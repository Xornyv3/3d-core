const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { Readable } = require("stream");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Google Drive Authentication
const auth = new google.auth.GoogleAuth({
    credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix the formatting
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// Use memory storage instead of disk storage
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, buffer } = req.file;
    const allowedExtensions = [".stl", ".step", ".gcode", ".3mf"];
    const fileExtension = originalname.split('.').pop().toLowerCase();
    const { email, phone } = req.body; // Get email and phone from request

    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      return res.status(400).json({ error: "Invalid file type. Allowed: .stl, .step, .gcode, .3mf" });
    }

    const fileMetadata = {
      name: originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: mimetype,
      body: Readable.from(buffer),
    };

    const driveResponse = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    const fileId = driveResponse.data.id;
    const fileLink = driveResponse.data.webViewLink;

    // Send email notification with uploader details
    await sendEmailNotification(originalname, fileLink, email, phone);

    res.status(200).json({ 
        success: true,
        message: "File uploaded successfully", 
        fileId, 
        fileLink 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route: List Uploaded Files
app.get("/files", async (req, res) => {
  try {
    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id, name, webViewLink)",
    });

    res.json(response.data.files);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch files", details: error.message });
  }
});

// Email Notification Function
async function sendEmailNotification(fileName, fileLink, email, phone) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const uploaderInfo = `
Uploader Details:
${email ? "Email: " + email : ""}
${phone ? "Phone: " + phone : ""}
  `.trim();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New 3D File Uploaded",
    text: `A new file has been uploaded: ${fileName}\nDownload: ${fileLink}\n\n${uploaderInfo}`,
  });
}


app.get("/", (req, res) => {
  res.send("3D-Core Backend is Running!");
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

// 📌 Serve static files from the "public" folder
app.use(express.static("public"));

// Google Drive Authentication
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
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

    const fileMetadata = {
      name: originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Set in .env
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

    // Send email notification
    await sendEmailNotification(originalname, fileLink);

    res.status(200).json({ message: "File uploaded successfully", fileId, fileLink });
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
async function sendEmailNotification(fileName, fileLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New 3D File Uploaded",
    text: `A new file has been uploaded: ${fileName}\nDownload: ${fileLink}`,
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

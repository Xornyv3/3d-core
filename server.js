const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Google Drive Authentication
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Password-protected access
const PASSWORD = "roboticore2025";

// Route: File Upload to Google Drive
app.post("/upload", upload.single("file"), async (req, res) => {
  const { password } = req.body;
  if (password !== PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const fileMetadata = {
    name: req.file.originalname,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Set your Google Drive folder ID
  };

  const media = {
    mimeType: req.file.mimetype,
    body: fs.createReadStream(req.file.path),
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });

    fs.unlinkSync(req.file.path); // Delete local file after upload

    const fileLink = `https://drive.google.com/uc?id=${file.data.id}`;
    await sendEmailNotification(req.file.originalname, fileLink);

    res.json({ success: true, fileLink });
  } catch (error) {
    res.status(500).json({ error: "Upload failed", details: error.message });
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

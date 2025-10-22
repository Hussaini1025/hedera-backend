import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so frontend can connect
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
// Setup file upload using multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Default route
app.get("/", (req, res) => {
  res.send("✅ Hedera Certificate Vault Backend is running!");
});

// ✅ Upload route
app.post("/upload", upload.single("certificate"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Here you can later add Hedera storage or IPFS logic
    console.log("File uploaded:", req.file.originalname);

    res.json({
      message: "Certificate uploaded successfully ✅",
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error while uploading" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
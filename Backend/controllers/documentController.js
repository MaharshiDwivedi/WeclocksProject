const multer = require("multer");
const path = require("path");
const Document = require("../models/documentModel");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Add a new document with image and PDF upload
async function addDocument(req, res) {
  try {
    console.log("Request body:", req.body); // Debugging log
    console.log("Uploaded image:", req.files.image); // Debugging log
    console.log("Uploaded PDF:", req.files.pdf); // Debugging log

    const { document_title, year } = req.body;
    const image_url = req.files.image ? req.files.image[0].filename : null;
    const pdf_url = req.files.pdf ? req.files.pdf[0].filename : null;

    const result = await Document.addDocument({ document_title, year, image_url, pdf_url });

    if (result.error) {
      return res.status(400).json(result);
    }

    res.status(201).json({ message: "Document added successfully", result });
  } catch (error) {
    console.error("Error in addDocument:", error.message); // Debugging log
    res.status(500).json({ error: "Failed to add document" });
  }
}

// Rest of the code remains the same...

async function deleteDocument(req, res) {
  try {
    const { documentId } = req.params;

    const result = await Document.deleteDocument(documentId);

    if (result.error) {
      return res.status(404).json(result);
    }

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDocument:", error.message);
    res.status(500).json({ error: "Failed to delete document" });
  }
}






// Fetch all documents
async function getDocuments(req, res) {
  try {
    const documents = await Document.getAllDocuments();
    console.log("Fetched documents:", documents); // Debugging log
    res.json(documents);
  } catch (error) {
    console.error("Error in getDocuments:", error.message); // Debugging log
    res.status(500).json({ error: "Failed to fetch documents" });
  }
}

module.exports = { addDocument, getDocuments,deleteDocument, upload };
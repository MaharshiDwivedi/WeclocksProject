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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and PDF files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Add a new document with single file upload
async function addDocument(req, res) {
  try {
    const { document_title, year } = req.body;
    const file_url = req.file ? req.file.filename : null;

    if (!file_url) {
      return res.status(400).json({ error: "File is required" });
    }

    const result = await Document.addDocument({ document_title, year, file_url });

    if (result.error) {
      return res.status(400).json(result);
    }

    res.status(201).json({ message: "Document added successfully", result });
  } catch (error) {
    console.error("Error in addDocument:", error.message);
    res.status(500).json({ error: "Failed to add document" });
  }
}

// Update a document
async function updateDocument(req, res) {
  try {
    const { documentId } = req.params;
    const { document_title, year } = req.body;
    const file_url = req.file ? req.file.filename : null;

    const result = await Document.updateDocument(documentId, {
      document_title,
      year,
      file_url,
    });

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json({ message: "Document updated successfully", result });
  } catch (error) {
    console.error("Error in updateDocument:", error.message);
    res.status(500).json({ error: "Failed to update document" });
  }
}

// Delete a document
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
    res.json(documents);
  } catch (error) {
    console.error("Error in getDocuments:", error.message);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
}

module.exports = { addDocument, getDocuments, deleteDocument, upload, updateDocument };
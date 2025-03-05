const express = require("express");
const router = express.Router();
const { addDocument, getDocuments, upload, deleteDocument, updateDocument } = require("../controllers/documentController");

// Routes
router.post("/", upload.single("file"), addDocument); // Single file upload
router.put("/:documentId", upload.single("file"), updateDocument); // Single file upload
router.delete("/:documentId", deleteDocument);
router.get("/", getDocuments);

module.exports = router;
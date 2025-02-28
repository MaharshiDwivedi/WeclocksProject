const express = require("express");
const router = express.Router();
const { addDocument, getDocuments, upload, deleteDocument } = require("../controllers/documentController");

router.delete("/:documentId", deleteDocument);

router.post("/", upload.fields([
    { name: "image", maxCount: 1 }, // Field name: "image"
    { name: "pdf", maxCount: 1 }, // Field name: "pdf"
  ]), addDocument);
  
router.get("/", getDocuments);
module.exports = router;
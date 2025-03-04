const express = require("express");
const router = express.Router();
const { addDocument, getDocuments, upload, deleteDocument,updateDocument } = require("../controllers/documentController");

router.delete("/:documentId", deleteDocument);

router.post("/", upload.fields([
    { name: "image", maxCount: 1 }, // Field name: "image"
    { name: "pdf", maxCount: 1 }, // Field name: "pdf"
  ]), addDocument);

router.put("/:documentId", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 }
]), updateDocument);





  
router.get("/", getDocuments);
module.exports = router;
const express = require("express");
const router = express.Router();
const { addDocument, getDocuments, upload } = require("../controllers/documentController");



router.post("/", upload.single("image"), addDocument);
router.get("/", getDocuments);
module.exports = router;
const express = require("express");
const router = express.Router();
const memberController = require("../controllers/purposeController");

router.get("/", memberController.getMPurpose);
router.post("/", memberController.addPurpose);
router.put("/:id", memberController.updatePurpose);
router.delete("/:id", memberController.deletePurpose);

module.exports = router;

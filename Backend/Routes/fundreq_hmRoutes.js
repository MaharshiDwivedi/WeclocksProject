const express = require("express");
const router = express.Router();
const fundreq_hmController = require("../controllers/fundreq_hmController")


router.get("/", fundreq_hmController.getReq);
router.post("/", fundreq_hmController.addReq);
router.put("/:id", fundreq_hmController.updateReq);
router.delete("/:id", fundreq_hmController.deleteReq);


module.exports = router;













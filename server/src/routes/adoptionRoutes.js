const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const {
  getAdoptionContext,
  createAdoptionRequest,
  decideAdoptionRequest,
  listMessages,
  sendMessage
} = require("../controllers/adoptionController");

const router = express.Router();

router.get("/pets/:petId/context", requireAuth, getAdoptionContext);
router.post("/pets/:petId/request", requireAuth, createAdoptionRequest);
router.patch("/:requestId/decision", requireAuth, decideAdoptionRequest);
router.get("/:requestId/messages", requireAuth, listMessages);
router.post("/:requestId/messages", requireAuth, sendMessage);

module.exports = router;

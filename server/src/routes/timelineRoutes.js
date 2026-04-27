const express = require("express");
const router = express.Router();
const timelineController = require("../controllers/timelineController");
const { requireAuth } = require("../middlewares/auth");

router.post("/", requireAuth, timelineController.createEvent);
router.get("/:petId", requireAuth, timelineController.getTimeline);
router.delete("/:id", requireAuth, timelineController.deleteEvent);

module.exports = router;


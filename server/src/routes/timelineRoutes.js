const express = require("express");
const router = express.Router();
const timelineController = require("../controllers/timelineController");

router.post("/", timelineController.createEvent);
router.get("/:petId", timelineController.getTimeline);

module.exports = router;


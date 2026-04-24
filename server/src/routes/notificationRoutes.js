const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationController");

router.get("/:userId", controller.getNotifications);
router.put("/:id", controller.markRead);

module.exports = router;
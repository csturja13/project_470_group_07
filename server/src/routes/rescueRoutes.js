const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const rescueController = require("../controllers/rescueController");

const router = express.Router();

router.post("/", requireAuth, rescueController.createRequest);
router.get("/", requireAuth, rescueController.listRequests);
router.get("/mine", requireAuth, rescueController.listMyRequests);
router.patch("/:id/assign", requireAuth, rescueController.assignRequest);
router.patch("/:id/status", requireAuth, rescueController.updateStatus);

module.exports = router;

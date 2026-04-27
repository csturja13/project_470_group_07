const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middlewares/auth");
const { createPurchase } = require("../controllers/commerceController");

router.post("/purchases", requireAuth, requireRole("user"), createPurchase);

module.exports = router;

const router = require("express").Router();
const {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign
} = require("../controllers/vaccinationCampaignController");
const { requireAuth, requireRole } = require("../middlewares/auth");

// Public route
router.get("/", listCampaigns);

// Admin-only
router.post("/", requireAuth, requireRole("admin"), createCampaign);
router.patch("/:id", requireAuth, requireRole("admin"), updateCampaign);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCampaign);

module.exports = router;
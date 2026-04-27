const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middlewares/auth");
const {
  listPendingPets,
  approvePet,
  rejectPet,
  listHealthHistory,
  getCommerceStats,
  listPendingPetSales,
  markPetSoldBanner
} = require("../controllers/adminController");

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/pets/pending", listPendingPets);
router.get("/health-history", listHealthHistory);
router.get("/commerce-stats", getCommerceStats);
router.get("/pets/pending-sales", listPendingPetSales);
router.patch("/pets/:id/sold-banner", markPetSoldBanner);
router.patch("/pets/:id/approve", approvePet);
router.delete("/pets/:id/reject", rejectPet);

module.exports = router;
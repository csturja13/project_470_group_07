const router = require("express").Router();
const {
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  bookCampaignAppointment,
  listMyBookings,
  cancelBooking
} = require("../controllers/vaccinationCampaignController");
const { requireAuth, requireRole } = require("../middlewares/auth");

// Public route
router.get("/", listCampaigns);

// User
router.get("/my-bookings", requireAuth, listMyBookings);
router.post("/:id/book", requireAuth, bookCampaignAppointment);
router.delete("/booking/:bookingId", requireAuth, cancelBooking);

// Admin-only
router.post("/", requireAuth, requireRole("admin"), createCampaign);
router.patch("/:id", requireAuth, requireRole("admin"), updateCampaign);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCampaign);

module.exports = router;
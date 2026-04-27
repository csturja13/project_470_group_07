const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middlewares/auth");
const {
  listPendingPets,
  approvePet,
  rejectPet,
  listHealthHistory
} = require("../controllers/adminController");

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/pets/pending", listPendingPets);
router.get("/health-history", listHealthHistory);
router.patch("/pets/:id/approve", approvePet);
router.delete("/pets/:id/reject", rejectPet);

module.exports = router;
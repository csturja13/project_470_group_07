const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middlewares/auth");
const {
  listPendingPets,
  approvePet,
  rejectPet
} = require("../controllers/adminController");

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/pets/pending", listPendingPets);
router.patch("/pets/:id/approve", approvePet);
router.delete("/pets/:id/reject", rejectPet);

module.exports = router;
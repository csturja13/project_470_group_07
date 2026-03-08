const router = require("express").Router();
const { requireAuth, requireRole } = require("../middlewares/auth");
const { listPendingPets, setPetStatus, adminDeletePet } = require("../controllers/adminController");

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/pets/pending", listPendingPets);
router.patch("/pets/:id/status", setPetStatus);
router.delete("/pets/:id", adminDeletePet);

module.exports = router;
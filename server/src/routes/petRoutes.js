const router = require("express").Router();
const { createPet, listPets, getPetById } = require("../controllers/petController");
const { upload } = require("../middlewares/upload");
const { requireAuth } = require("../middlewares/auth");

router.get("/", listPets);
router.get("/:id", getPetById);

// key name must be "image"
router.post("/", requireAuth, upload.single("image"), createPet);

module.exports = router;
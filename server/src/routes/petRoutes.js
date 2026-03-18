const express = require("express");
const router = express.Router();

const { createPet, listPets, getPetById, listMyPets, deletePet } = require("../controllers/petController");
const { requireAuth } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.get("/", listPets);
router.get("/mine", requireAuth, listMyPets);
router.get("/:id", getPetById);
router.post("/", requireAuth, upload.single("image"), createPet);
router.delete("/:id", requireAuth, deletePet);

module.exports = router;
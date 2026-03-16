const express = require("express");
const router = express.Router();

const {
  createPet,
  listPets,
  listMyPets,
  getPetById
} = require("../controllers/petController");

const { requireAuth } = require("../middlewares/auth");
const { upload } = require("../middlewares/upload");

// public homepage feed -> approved only
router.get("/", listPets);

// my own pets
router.get("/mine", requireAuth, listMyPets);

// pet details
router.get("/:id", getPetById);

// create pet
router.post("/", requireAuth, upload.single("image"), createPet);

module.exports = router;
const router = require("express").Router();
const { createPet, listPets } = require("../controllers/petController");
const { upload } = require("../middlewares/upload");

router.get("/", listPets);

// key name must be "image"
router.post("/", upload.single("image"), createPet);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  createShopItem,
  getMyShopItems,
  updateShopItem,
  deleteShopItem
} = require("../controllers/shopItemController");

const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.get("/mine", auth, getMyShopItems);
router.post("/", auth, upload.single("image"), createShopItem);
router.patch("/:id", auth, upload.single("image"), updateShopItem);
router.delete("/:id", auth, deleteShopItem);

module.exports = router;
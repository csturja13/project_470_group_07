const express = require("express");
const router = express.Router();

const {
  createShopItem,
  getMyShopItems,
  updateShopItem,
  deleteShopItem
} = require("../controllers/shopItemController");

const { requireAuth } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.get("/mine", requireAuth, getMyShopItems);
router.post("/", requireAuth, upload.single("image"), createShopItem);
router.patch("/:id", requireAuth, upload.single("image"), updateShopItem);
router.delete("/:id", requireAuth, deleteShopItem);

module.exports = router;
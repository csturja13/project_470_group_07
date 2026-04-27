const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Pet = require("../models/Pet");
const ShopItem = require("../models/ShopItem");
const Rating = require("../models/Rating");
const { requireAuth } = require("../middlewares/auth");

// list all pet shops
router.get("/", async (req, res) => {
  try {
    const shops = await User.find({ role: "petshop" })
      .select("name email role averageRating totalRatings")
      .sort({ createdAt: -1 });

    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Failed to load pet shops", error: err.message });
  }
});

// pet shop details with pets and items
router.get("/:id/details", async (req, res) => {
  try {
    const shop = await User.findOne({ _id: req.params.id, role: "petshop" })
      .select("name email role averageRating totalRatings");

    if (!shop) {
      return res.status(404).json({ message: "Pet shop not found" });
    }

    const pets = await Pet.find({
      owner: shop._id,
      approvalStatus: { $in: ["Approved", "approved"] },
      isAdopted: { $ne: true }
    }).sort({ createdAt: -1 });

    const items = await ShopItem.find({ owner: shop._id }).sort({ createdAt: -1 });

    res.json({ shop, pets, items });
  } catch (err) {
    res.status(500).json({ message: "Failed to load shop details", error: err.message });
  }
});

// rate a pet shop
router.post("/:id/rate", requireAuth, async (req, res) => {
  try {
    const raterId = req.user?.userId || req.user?.id || req.user?._id;
    const { value, review } = req.body;

    if (!raterId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentUser = await User.findById(raterId).select("role");
    if (!currentUser || currentUser.role !== "user") {
      return res.status(403).json({ message: "Only normal users can rate pet shops" });
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue < 1 || numericValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const petshop = await User.findOne({ _id: req.params.id, role: "petshop" });
    if (!petshop) {
      return res.status(404).json({ message: "Pet shop not found" });
    }

    if (String(petshop._id) === String(raterId)) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

let rating = await Rating.findOne({
  rater: raterId,
  target: petshop._id,
  targetType: "petshop"
});

if (rating) {
  rating.value = numericValue;
  rating.review = review || "";
  await rating.save();
} else {
  rating = await Rating.create({
    rater: raterId,
    target: petshop._id,
    targetType: "petshop",
    value: numericValue,
    review: review || ""
  });
}

const ratings = await Rating.find({
  target: petshop._id,
  targetType: "petshop"
});
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? Number((ratings.reduce((sum, r) => sum + r.value, 0) / totalRatings).toFixed(1))
        : 0;

    petshop.averageRating = averageRating;
    petshop.totalRatings = totalRatings;
    await petshop.save();

    res.json({
      message: "Pet shop rating submitted",
      averageRating,
      totalRatings
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to rate pet shop", error: err.message });
  }
});

module.exports = router;
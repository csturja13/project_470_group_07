const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const User = require("../models/User");

async function refreshUserRating(targetUserId) {
  const result = await Rating.aggregate([
    {
      $match: {
        target: new mongoose.Types.ObjectId(targetUserId)
      }
    },
    {
      $group: {
        _id: "$target",
        averageRating: { $avg: "$value" },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  const averageRating = result[0]?.averageRating || 0;
  const totalRatings = result[0]?.totalRatings || 0;

  await User.findByIdAndUpdate(targetUserId, {
    averageRating: Number(averageRating.toFixed(1)),
    totalRatings
  });
}

async function submitRating(req, res) {
  try {
    const { id } = req.params;
    const { value, review = "" } = req.body;
    const { targetType } = req;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const numericValue = Number(value);

    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
      return res.status(400).json({ message: "Rating value must be an integer between 1 and 5" });
    }

    if (req.user.userId === id) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Target not found" });
    }

    if (targetType === "petshop" && targetUser.role !== "petshop") {
      return res.status(400).json({ message: "Target is not a pet shop" });
    }

    if (targetType === "user" && targetUser.role !== "user") {
      return res.status(400).json({ message: "Target is not a normal user" });
    }

    const rating = await Rating.findOneAndUpdate(
      {
        rater: req.user.userId,
        target: id,
        targetType
      },
      {
        value: numericValue,
        review: review.trim()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    await refreshUserRating(id);

    const updatedTarget = await User.findById(id).select(
      "name role averageRating totalRatings"
    );

    return res.json({
      message: "Rating saved",
      rating,
      target: updatedTarget
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save rating", error: err.message });
  }
}

async function getRatings(req, res) {
  try {
    const { id } = req.params;
    const { targetType } = req;

    const targetUser = await User.findById(id).select(
      "name role averageRating totalRatings"
    );
    if (!targetUser) {
      return res.status(404).json({ message: "Target not found" });
    }

    const ratings = await Rating.find({ target: id, targetType })
      .populate("rater", "name email role")
      .sort({ createdAt: -1 });

    return res.json({
      target: targetUser,
      ratings
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load ratings", error: err.message });
  }
}

async function listUsers(req, res) {
  try {
    const users = await User.find({ role: "user" })
      .select("name email role averageRating totalRatings createdAt")
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load users", error: err.message });
  }
}

async function listPetshops(req, res) {
  try {
    const petshops = await User.find({ role: "petshop" })
      .select("name email role averageRating totalRatings createdAt")
      .sort({ createdAt: -1 });

    return res.json(petshops);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load pet shops", error: err.message });
  }
}

module.exports = {
  submitRating,
  getRatings,
  listUsers,
  listPetshops
};
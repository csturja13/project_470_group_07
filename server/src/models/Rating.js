const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    targetType: {
      type: String,
      enum: ["user", "petshop"],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

ratingSchema.index({ rater: 1, target: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
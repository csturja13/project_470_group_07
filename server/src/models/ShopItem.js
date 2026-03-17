const mongoose = require("mongoose");

const shopItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["food", "toy", "accessory", "medicine", "other"],
      default: "other"
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      default: ""
    },
    imagePath: {
      type: String,
      default: ""
    },
    stock: {
      type: Number,
      default: 0
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShopItem", shopItemSchema);
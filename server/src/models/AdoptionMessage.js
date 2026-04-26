const mongoose = require("mongoose");

const adoptionMessageSchema = new mongoose.Schema(
  {
    adoptionRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdoptionRequest",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdoptionMessage", adoptionMessageSchema);

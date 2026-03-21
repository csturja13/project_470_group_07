const mongoose = require("mongoose");

const adoptionRequestSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);
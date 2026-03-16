const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    species: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Other"]
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //required: true
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    species: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Other"]
    },

    sex: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male"
    },

    age: {
      type: Number,
      default: null
    },

    price: {
      type: Number,
      default: null
    },

    description: {
      type: String,
      default: ""
    },

    imagePath: {
      type: String,
      default: ""
    },

    approvalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
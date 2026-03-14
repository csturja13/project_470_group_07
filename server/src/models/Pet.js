const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    species: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Other"]
    },

    /* NEW FIELD */
    sex: {
      type: String,
      enum: ["Male", "Female"],
      default: "Male"
    },

    /* Age should not force 0 */
    age: {
      type: Number,
      default: null
    },

    /* Price should not force 0 */
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
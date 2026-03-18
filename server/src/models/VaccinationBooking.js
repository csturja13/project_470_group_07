const mongoose = require("mongoose");

const vaccinationBookingSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VaccinationCampaign",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    petName: {
      type: String,
      required: true,
      trim: true
    },
    animalType: {
      type: String,
      enum: ["Dog", "Cat", "Bird", "Other"],
      required: true
    },
    ownerPhone: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    },
    bookingStatus: {
      type: String,
      enum: ["Booked", "Cancelled"],
      default: "Booked"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VaccinationBooking", vaccinationBookingSchema);
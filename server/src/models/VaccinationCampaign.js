const mongoose = require("mongoose");

const vaccinationCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    targetSpecies: {
      type: String,
      enum: ["Dog", "Cat", "Bird", "Other", "All"],
      default: "All"
    },
    vaccineName: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    organizer: {
      type: String,
      default: ""
    },
    campaignDate: {
      type: Date,
      required: true
    },
    lastRegistrationDate: {
      type: Date,
      default: null
    },
    availableSlots: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VaccinationCampaign", vaccinationCampaignSchema);
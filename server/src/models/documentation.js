const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    fullName: {
      type: String,
      default: "",
      trim: true
    },
    residentialAddress: {
      type: String,
      default: "",
      trim: true
    },
    contactNumber: {
      type: String,
      default: "",
      trim: true
    },
    emailAddress: {
      type: String,
      default: "",
      trim: true
    },
    petType: {
      type: String,
      enum: ["Dog", "Cat", "Bird", "Other"],
      default: "Other"
    },
    ownerSignature: {
      type: String,
      default: ""
    },
    specialtyDocuments: {
      type: String,
      default: "",
      trim: true
    },
    documentType: {
      type: String,
      enum: [
        "ownership",
        "medical",
        "vaccination",
        "adoption",
        "identity",
        "other"
      ],
      default: "other"
    },
    documentNumber: {
      type: String,
      default: ""
    },
    issuedBy: {
      type: String,
      default: ""
    },
    issueDate: {
      type: Date,
      default: null
    },
    expiryDate: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Active", "Expired"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
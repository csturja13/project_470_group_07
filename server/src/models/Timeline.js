const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
  type: { type: String }, // "document" or "vaccination"
  title: String,
  description: String,
  date: Date
}, { timestamps: true });

module.exports = mongoose.model("Timeline", timelineSchema);


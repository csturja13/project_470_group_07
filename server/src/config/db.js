const mongoose = require("mongoose");

async function connectDB(MONGO_URI) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
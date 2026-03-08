require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = (process.env.ADMIN_EMAIL || "admin@pet.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("✅ Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: "Admin",
    email,
    passwordHash,
    role: "admin"
  });

  console.log("✅ Admin created:", email, "password:", password);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
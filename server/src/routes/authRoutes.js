const router = require("express").Router();
const { signup, login } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/auth");
const User = require("../models/User");

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).select(
    "name email role createdAt averageRating totalRatings"
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;
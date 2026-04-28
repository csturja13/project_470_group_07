const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const {
  submitRating,
  getRatings,
  getGivenRatings,
  listUsers
} = require("../controllers/ratingController");

router.get("/", listUsers);

router.get("/:id/ratings", (req, res, next) => {
  req.targetType = "user";
  next();
}, getRatings);

router.get("/:id/given-ratings", requireAuth, getGivenRatings);

router.post("/:id/rate", requireAuth, (req, res, next) => {
  req.targetType = "user";
  next();
}, submitRating);

module.exports = router;
const router = require("express").Router();
const { requireAuth } = require("../middlewares/auth");
const {
  submitRating,
  getRatings,
  listPetshops
} = require("../controllers/ratingController");

router.get("/", listPetshops);

router.get("/:id/ratings", (req, res, next) => {
  req.targetType = "petshop";
  next();
}, getRatings);

router.post("/:id/rate", requireAuth, (req, res, next) => {
  req.targetType = "petshop";
  next();
}, submitRating);

module.exports = router;
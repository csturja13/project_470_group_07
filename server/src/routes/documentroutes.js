const router = require("express").Router();
const {
  createDocument,
  listMyDocuments,
  listDocumentsHistory,
  deleteDocument
} = require("../controllers/documentcontroller");
const { requireAuth } = require("../middlewares/auth");

router.use(requireAuth);

router.post("/", createDocument);
router.get("/mine", listMyDocuments);
router.get("/history", listDocumentsHistory);
router.delete("/:id", deleteDocument);

module.exports = router;
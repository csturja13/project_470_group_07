const Document = require("../models/documentation");
const Pet = require("../models/Pet");

// POST /api/documents
async function createDocument(req, res) {
  try {
    const {
      pet,
      title,
      documentType,
      documentNumber,
      issuedBy,
      issueDate,
      expiryDate,
      notes
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (pet) {
      const existingPet = await Pet.findById(pet);
      if (!existingPet) {
        return res.status(404).json({ message: "Pet not found" });
      }
    }

    const status =
      expiryDate && new Date(expiryDate) < new Date() ? "Expired" : "Active";

    const document = await Document.create({
      owner: req.user.userId,
      pet: pet || null,
      title,
      documentType,
      documentNumber,
      issuedBy,
      issueDate: issueDate || null,
      expiryDate: expiryDate || null,
      notes,
      status
    });

    return res.status(201).json(document);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

// GET /api/documents/mine
async function listMyDocuments(req, res) {
  try {
    const documents = await Document.find({ owner: req.user.userId })
      .populate("pet", "name species")
      .sort({ createdAt: -1 });

    return res.json(documents);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

// DELETE /api/documents/:id
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      owner: req.user.userId
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await document.deleteOne();
    return res.json({ message: "Document deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

module.exports = {
  createDocument,
  listMyDocuments,
  deleteDocument
};
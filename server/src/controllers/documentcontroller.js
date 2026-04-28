const Document = require("../models/documentation");
const Timeline = require("../models/Timeline");
const notificationController = require("../controllers/notificationController");


async function createDocument(req, res) {
  try {
    const {
      title,
      fullName,
      residentialAddress,
      contactNumber,
      emailAddress,
      petType,
      ownerSignature,
      specialtyDocuments,
      documentType,
      notes
    } = req.body;

    if (!title || !fullName || !residentialAddress || !contactNumber || !emailAddress) {
      return res.status(400).json({
        message: "title, fullName, residentialAddress, contactNumber, emailAddress are required"
      });
    }

    const document = await Document.create({
      owner: req.user.userId,
      pet: null,
      title,
      fullName,
      residentialAddress,
      contactNumber,
      emailAddress,
      petType: petType || "Other",
      ownerSignature: ownerSignature || "",
      specialtyDocuments: specialtyDocuments || "",
      documentType,
      issueDate: new Date(),
      notes,
      status: "Active"
    });

    await notificationController.createNotification({
      userId: document.owner,
      message: "Your document has been created successfully"
    });

    return res.status(201).json(document);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
}

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

async function listDocumentsHistory(req, res) {
  try {
    if (req.user.role === "admin") {
      const documents = await Document.find({})
        .populate("pet", "name species")
        .populate("owner", "name email role")
        .sort({ createdAt: -1 });

      return res.json(documents);
    }

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

async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete documents" });
    }

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await document.deleteOne();

    await Timeline.deleteMany({ petId: document.pet, type: "document" });
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
  listDocumentsHistory,
  deleteDocument
};
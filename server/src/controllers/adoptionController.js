const AdoptionRequest = require("../models/AdoptionRequest");
const AdoptionMessage = require("../models/AdoptionMessage");
const Pet = require("../models/Pet");

async function buildPetAdoptionContext(petId, userId) {
  const pet = await Pet.findById(petId).populate("owner", "name email");
  if (!pet) return { error: "Pet not found", status: 404 };

  const pendingRequest = await AdoptionRequest.findOne({
    pet: petId,
    status: "Pending"
  })
    .populate("owner", "name email")
    .populate("requester", "name email")
    .sort({ createdAt: -1 });

  const myLatestRequest = await AdoptionRequest.findOne({
    pet: petId,
    requester: userId
  })
    .populate("owner", "name email")
    .populate("requester", "name email")
    .sort({ createdAt: -1 });

  const isOwner = !!pet.owner && pet.owner._id.toString() === userId;
  const isPendingRequester =
    !!pendingRequest && pendingRequest.requester?._id?.toString() === userId;

  return {
    pet,
    pendingRequest,
    myLatestRequest,
    isOwner,
    canRequest: !isOwner && !pendingRequest
  };
}

async function getAdoptionContext(req, res) {
  try {
    const context = await buildPetAdoptionContext(req.params.petId, req.user.userId);
    if (context.error) return res.status(context.status).json({ message: context.error });

    return res.json({
      petId: context.pet._id,
      isOwner: context.isOwner,
      canRequest: context.canRequest,
      pendingRequest: context.pendingRequest,
      myLatestRequest: context.myLatestRequest
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function createAdoptionRequest(req, res) {
  try {
    const context = await buildPetAdoptionContext(req.params.petId, req.user.userId);
    if (context.error) return res.status(context.status).json({ message: context.error });

    if (context.isOwner) {
      return res.status(403).json({ message: "You cannot request adoption for your own pet" });
    }

    if (context.pendingRequest) {
      if (context.pendingRequest.requester?._id?.toString() === req.user.userId) {
        return res.status(409).json({ message: "You already have a pending adoption request" });
      }
      return res.status(409).json({
        message: "Adoption currently unavailable until owner decides on an existing request"
      });
    }

    const request = await AdoptionRequest.create({
      pet: req.params.petId,
      requester: req.user.userId,
      owner: context.pet.owner._id,
      status: "Pending"
    });

    const populated = await AdoptionRequest.findById(request._id)
      .populate("owner", "name email")
      .populate("requester", "name email")
      .populate("pet");

    return res.status(201).json({
      message: "Adoption request sent successfully",
      request: populated
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function decideAdoptionRequest(req, res) {
  try {
    const { decision } = req.body;
    if (!["Accepted", "Rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be Accepted or Rejected" });
    }

    const request = await AdoptionRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Adoption request not found" });

    if (request.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only pet owner can decide this request" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "This adoption request already has a decision" });
    }

    request.status = decision;
    await request.save();

    const updated = await AdoptionRequest.findById(request._id)
      .populate("owner", "name email")
      .populate("requester", "name email")
      .populate("pet");

    return res.json({
      message: `Adoption request ${decision.toLowerCase()}`,
      request: updated
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function listMessages(req, res) {
  try {
    const request = await AdoptionRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Adoption request not found" });

    const userId = req.user.userId;
    const isParticipant =
      request.owner.toString() === userId || request.requester.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "Only requester and owner can access this chat" });
    }

    const messages = await AdoptionMessage.find({ adoptionRequest: request._id })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function sendMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const request = await AdoptionRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Adoption request not found" });

    const userId = req.user.userId;
    const isParticipant =
      request.owner.toString() === userId || request.requester.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ message: "Only requester and owner can send messages" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Chat is closed because request is not pending" });
    }

    const message = await AdoptionMessage.create({
      adoptionRequest: request._id,
      sender: userId,
      text: text.trim()
    });

    const populated = await AdoptionMessage.findById(message._id).populate(
      "sender",
      "name email"
    );

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  getAdoptionContext,
  createAdoptionRequest,
  decideAdoptionRequest,
  listMessages,
  sendMessage
};

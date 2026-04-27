const Pet = require("../models/Pet");
const Timeline = require("../models/Timeline");

// Show only pending pets in admin panel
async function listPendingPets(req, res) {
  try {
    const pets = await Pet.find({ approvalStatus: "Pending" })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.json(pets);
  } catch (err) {
    console.error("List pending pets error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Approve pet
async function approvePet(req, res) {
  try {
    const { id } = req.params;

    const pet = await Pet.findByIdAndUpdate(
      id,
      { approvalStatus: "Approved" },
      { returnDocument: "after" }
    );

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json({ message: "Pet approved", pet });
  } catch (err) {
    console.error("Approve pet error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Reject pet = delete from DB
async function rejectPet(req, res) {
  try {
    const { id } = req.params;

    const pet = await Pet.findByIdAndDelete(id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json({ message: "Pet rejected and deleted" });
  } catch (err) {
    console.error("Reject pet error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Combined pet health history for admin (documents + vaccinations)
async function listHealthHistory(req, res) {
  try {
    const { petId, type } = req.query;
    const filter = {};
    if (petId) filter.petId = petId;
    if (type) filter.type = type;

    const events = await Timeline.find(filter)
      .populate({
        path: "petId",
        select: "name species owner",
        populate: { path: "owner", select: "name email" }
      })
      .sort({ date: -1, createdAt: -1 });

    return res.json(events);
  } catch (err) {
    console.error("List health history error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  listPendingPets,
  approvePet,
  rejectPet,
  listHealthHistory
};
const Pet = require("../models/Pet");

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
      { new: true }
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

module.exports = {
  listPendingPets,
  approvePet,
  rejectPet
};
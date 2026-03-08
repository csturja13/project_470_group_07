const Pet = require("../models/Pet");

// GET /api/admin/pets/pending
async function listPendingPets(req, res) {
  try {
    const pets = await Pet.find({ approvalStatus: "Pending" }).sort({ createdAt: -1 });
    return res.json(pets);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PATCH /api/admin/pets/:id/status  body: { status: "Approved" | "Rejected" }
async function setPetStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const pet = await Pet.findByIdAndUpdate(
      id,
      { approvalStatus: status },
      { new: true }
    );

    if (!pet) return res.status(404).json({ message: "Pet not found" });
    return res.json(pet);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// DELETE /api/admin/pets/:id
async function adminDeletePet(req, res) {
  try {
    const { id } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    await pet.deleteOne();
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { listPendingPets, setPetStatus, adminDeletePet };
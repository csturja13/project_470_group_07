const Pet = require("../models/Pet");

// Create pet post
async function createPet(req, res) {
  try {
    const { name, species, age, price, description } = req.body;

    if (!name || !species) {
      return res.status(400).json({ message: "name and species required" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const pet = await Pet.create({
      name,
      species,
      age: Number(age || 0),
      price: Number(price || 0),
      description: description || "",
      imagePath,
      approvalStatus: "Pending",
      owner: req.user.userId
    });

    return res.status(201).json(pet);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

//get_pet_by_owner_ID

async function getPetById(req, res) {
  try {
    const pet = await Pet.findById(req.params.id).populate("owner", "name email");

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json(pet);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// List pets with search + filter
async function listPets(req, res) {
  try {
    const { status, q, species } = req.query;

    const filter = {};
    if (status) filter.approvalStatus = status;
    if (q) filter.name = { $regex: q, $options: "i" };
    if (species) filter.species = species;

    const pets = await Pet.find(filter).sort({ createdAt: -1 });
    return res.json(pets);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { createPet, listPets, getPetById };
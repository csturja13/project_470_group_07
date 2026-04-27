const Pet = require("../models/Pet");

// Create pet post
async function createPet(req, res) {
  try {
    const { name, species, sex, age, price, description } = req.body;

    if (!name || !species) {
      return res.status(400).json({ message: "name and species required" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const pet = await Pet.create({
      name,
      species,
      sex: sex || "Male",
      age: age === "" || age === undefined ? null : Number(age),
      price: price === "" || price === undefined ? null : Number(price),
      description: description || "",
      imagePath,
      approvalStatus: "Pending",
      owner: req.user?.userId || null
    });

    return res.status(201).json(pet);
  } catch (err) {
    console.error("Create pet error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getPetById(req, res) {
  try {
    const pet = await Pet.findById(req.params.id).populate("owner", "name email");

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json(pet);
  } catch (err) {
    console.error("Get pet by id error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Homepage: only APPROVED pets
async function listPets(req, res) {
  try {
    const { q, species } = req.query;

    const filter = {
      approvalStatus: "Approved"
    };

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    if (species) {
      filter.species = species;
    }

    const pets = await Pet.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.json(pets);
  } catch (err) {
    console.error("List pets error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Logged in user's own pets
async function listMyPets(req, res) {
  try {
    const pets = await Pet.find({ owner: req.user.userId })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.json(pets);
  } catch (err) {
    console.error("List my pets error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function deletePet(req, res) {
  try {
    const { id } = req.params;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (!pet.owner || pet.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can delete only your own pet post" });
    }

    await Pet.findByIdAndDelete(id);

    return res.json({ message: "Pet deleted successfully" });
  } catch (err) {
    console.error("Delete pet error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function requestAdoption(req, res) {
  try {
    const { id } = req.params;

    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.owner && pet.owner.toString() === req.user.userId) {
      return res.status(403).json({ message: "You cannot request adoption for your own pet" });
    }

    return res.json({ message: "Adoption request sent successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  createPet,
  listPets,
  listMyPets,
  getPetById,
  deletePet,
  requestAdoption
};
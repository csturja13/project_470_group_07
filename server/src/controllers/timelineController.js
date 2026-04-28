const Timeline = require("../models/Timeline");
const Pet = require("../models/Pet");

exports.createEvent = async (req, res) => {
  try {
    const event = await Timeline.create(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimeline = async (req, res) => {
  try {
    const { petId } = req.params;

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && pet.owner && pet.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to this pet's timeline" });
    }

    const events = await Timeline.find({ petId: petId })
      .sort({ date: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Timeline.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Timeline event not found" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admin can delete timeline events" });
    }

    await Timeline.findByIdAndDelete(id);
    return res.json({ message: "Timeline event deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


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

    if (pet.owner && pet.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to this pet's timeline" });
    }

    const events = await Timeline.find({ petId: petId })
      .sort({ date: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


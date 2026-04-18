const Timeline = require("../models/Timeline");

// Create event manually (optional)
exports.createEvent = async (req, res) => {
  try {
    const event = await Timeline.create(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get timeline for a pet
exports.getTimeline = async (req, res) => {
  try {
    const events = await Timeline.find({ petId: req.params.petId })
      .sort({ date: -1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const Notification = require("../models/Notification");

exports.createNotification = async (data) => {
  await Notification.create(data);
};

exports.getNotifications = async (req, res) => {
  if (req.user.userId !== req.params.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const notes = await Notification.find({ userId: req.params.userId })
    .sort({ date: -1 });

  res.json(notes);
};

exports.markRead = async (req, res) => {
  const note = await Notification.findById(req.params.id);
  if (!note) return res.status(404).json({ message: "Notification not found" });
  if (note.userId?.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: "Updated" });
};
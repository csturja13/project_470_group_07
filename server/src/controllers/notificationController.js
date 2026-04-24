const Notification = require("../models/Notification");

exports.createNotification = async (data) => {
  await Notification.create(data);
};

exports.getNotifications = async (req, res) => {
  const notes = await Notification.find({ userId: req.params.userId })
    .sort({ date: -1 });

  res.json(notes);
};

exports.markRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: "Updated" });
};
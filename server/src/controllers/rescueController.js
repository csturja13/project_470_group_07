const RescueRequest = require("../models/RescueRequest");

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.createRequest = async (req, res) => {
  try {
    const { title, description, category, lat, lng, address } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return res.status(400).json({ message: "Valid latitude and longitude are required" });
    }

    const rescue = await RescueRequest.create({
      title: title.trim(),
      description: description.trim(),
      category: category || "Needs Help",
      location: {
        lat: latNum,
        lng: lngNum,
        address: address || ""
      },
      postedBy: req.user.userId
    });

    const populated = await RescueRequest.findById(rescue._id)
      .populate("postedBy", "name email role")
      .populate("assignedRescuer", "name email role");

    req.app.get("io").emit("rescue:updated");

    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.listRequests = async (req, res) => {
  try {
    const { status = "Open", lat, lng, radiusKm = 25 } = req.query;

    const filter = {};
    if (status && status !== "All") filter.status = status;

    const items = await RescueRequest.find(filter)
      .populate("postedBy", "name email role")
      .populate("assignedRescuer", "name email role")
      .sort({ createdAt: -1 });

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusNum = Number(radiusKm);

    let mapped = items.map((item) => {
      const plain = item.toObject();
      if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
        plain.distanceKm = haversineKm(
          latNum,
          lngNum,
          plain.location.lat,
          plain.location.lng
        );
      } else {
        plain.distanceKm = null;
      }
      return plain;
    });

    if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
      if (Number.isFinite(radiusNum) && radiusNum > 0) {
        mapped = mapped.filter((m) => m.distanceKm !== null && m.distanceKm <= radiusNum);
      }
      mapped.sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    }

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.listMyRequests = async (req, res) => {
  try {
    const items = await RescueRequest.find({ postedBy: req.user.userId })
      .populate("postedBy", "name email role")
      .populate("assignedRescuer", "name email role")
      .sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.assignRequest = async (req, res) => {
  try {
    if (req.user.role !== "rescue") {
      return res.status(403).json({ message: "Only rescue workers can assign requests" });
    }

    const rescue = await RescueRequest.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: "Rescue request not found" });

    if (rescue.status === "Resolved") {
      return res.status(400).json({ message: "Resolved request cannot be assigned" });
    }

    rescue.assignedRescuer = req.user.userId;
    rescue.status = "In Progress";
    await rescue.save();

    const populated = await RescueRequest.findById(rescue._id)
      .populate("postedBy", "name email role")
      .populate("assignedRescuer", "name email role");

    req.app.get("io").emit("rescue:updated");

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Open", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rescue = await RescueRequest.findById(req.params.id);
    if (!rescue) return res.status(404).json({ message: "Rescue request not found" });

    const isAssignedRescuer =
      rescue.assignedRescuer && rescue.assignedRescuer.toString() === req.user.userId;
    const isPoster = rescue.postedBy.toString() === req.user.userId;
    const isRescueRole = req.user.role === "rescue";

    if (!(isAssignedRescuer || isPoster || isRescueRole)) {
      return res.status(403).json({ message: "Not allowed to update this request" });
    }

    rescue.status = status;
    if (status === "Open") rescue.assignedRescuer = null;
    await rescue.save();

    const populated = await RescueRequest.findById(rescue._id)
      .populate("postedBy", "name email role")
      .populate("assignedRescuer", "name email role");

    req.app.get("io").emit("rescue:updated");

    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

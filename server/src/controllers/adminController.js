const Pet = require("../models/Pet");
const Timeline = require("../models/Timeline");
const Purchase = require("../models/Purchase");

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
      { returnDocument: "after" }
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

// Combined pet health history for admin (documents + vaccinations)
async function listHealthHistory(req, res) {
  try {
    const { petId, type } = req.query;
    const filter = {};
    if (petId) filter.petId = petId;
    if (type) filter.type = type;

    const events = await Timeline.find(filter)
      .populate({
        path: "petId",
        select: "name species owner",
        populate: { path: "owner", select: "name email" }
      })
      .sort({ date: -1, createdAt: -1 });

    return res.json(events);
  } catch (err) {
    console.error("List health history error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function getCommerceStats(req, res) {
  try {
    const purchases = await Purchase.find({}).sort({ createdAt: -1 });

    const totals = purchases.reduce(
      (acc, p) => {
        acc.totalOrders += 1;
        acc.totalItems += (p.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
        acc.subtotalSales += Number(p.subtotal) || 0;
        acc.deliveryCollected += Number(p.deliveryCharge) || 0;
        acc.netSales += Number(p.totalAmount) || 0;
        const method = p.paymentMethod || "unknown";
        acc.paymentMethods[method] = (acc.paymentMethods[method] || 0) + 1;
        return acc;
      },
      {
        totalOrders: 0,
        totalItems: 0,
        subtotalSales: 0,
        deliveryCollected: 0,
        netSales: 0,
        paymentMethods: {}
      }
    );

    const recentOrders = purchases.slice(0, 8).map((p) => ({
      _id: p._id,
      transactionId: p.transactionId,
      payerName: p.payerName,
      totalAmount: p.totalAmount,
      paymentMethod: p.paymentMethod,
      createdAt: p.createdAt
    }));

    return res.json({
      totals,
      recentOrders
    });
  } catch (err) {
    console.error("Get commerce stats error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function listPendingPetSales(req, res) {
  try {
    const pets = await Pet.find({ awaitingAdminSoldLabel: true })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    return res.json(pets);
  } catch (err) {
    console.error("List pending pet sales error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function markPetSoldBanner(req, res) {
  try {
    const { id } = req.params;
    const { mode } = req.body || {};
    if (!["no_delivery_discount", "free_delivery"].includes(mode)) {
      return res.status(400).json({ message: "Invalid sale label" });
    }

    const pet = await Pet.findOneAndUpdate(
      { _id: id, awaitingAdminSoldLabel: true },
      {
        $set: {
          awaitingAdminSoldLabel: false,
          soldBannerStyle: mode
        }
      },
      { new: true }
    ).populate("owner", "name email");

    if (!pet) {
      return res.status(404).json({ message: "Pet not found or already labeled" });
    }

    return res.json(pet);
  } catch (err) {
    console.error("Mark pet sold banner error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  listPendingPets,
  approvePet,
  rejectPet,
  listHealthHistory,
  getCommerceStats,
  listPendingPetSales,
  markPetSoldBanner
};
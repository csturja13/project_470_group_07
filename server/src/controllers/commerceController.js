const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Pet = require("../models/Pet");

const DEFAULT_DELIVERY_CHARGE = 60;

function round2(n) {
  return Number(Number(n || 0).toFixed(2));
}

function toMoney(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

async function assertPetsPurchasable(items) {
  const petEntries = items.filter((item) => item.kind === "pet" && item.petId);
  for (const item of petEntries) {
    const pet = await Pet.findById(item.petId).select(
      "awaitingAdminSoldLabel soldBannerStyle approvalStatus"
    );
    if (!pet || pet.approvalStatus !== "Approved") {
      throw Object.assign(new Error("Pet no longer available"), { statusCode: 400 });
    }
    if (pet.awaitingAdminSoldLabel || pet.soldBannerStyle !== "none") {
      throw Object.assign(new Error("This pet has already been purchased"), { statusCode: 400 });
    }
  }
}

async function createPurchase(req, res) {
  try {
    const { items = [], paymentMethod, payerName, accountTail, note = "", transactionId } = req.body || {};
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "No items provided for purchase" });
    }
    if (!paymentMethod || !payerName || !accountTail || !transactionId) {
      return res.status(400).json({ message: "Missing payment information" });
    }

    const normalizedItems = items.map((item) => {
      const qty = Math.max(1, Number(item.qty) || 1);
      const price = Math.max(0, toMoney(item.price));
      const kind = String(item.kind || "item");
      const rawId = item.id;
      const petId =
        kind === "pet" && rawId && mongoose.Types.ObjectId.isValid(String(rawId))
          ? new mongoose.Types.ObjectId(String(rawId))
          : null;
      return {
        name: String(item.name || "Item"),
        kind,
        category: String(item.category || ""),
        price: round2(price),
        qty,
        lineTotal: round2(price * qty),
        petId
      };
    });

    await assertPetsPurchasable(normalizedItems);

    const subtotal = round2(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0));
    const deliveryCharge = subtotal > 0 ? DEFAULT_DELIVERY_CHARGE : 0;
    const totalAmount = round2(subtotal + deliveryCharge);

    const purchase = await Purchase.create({
      userId: req.user.userId,
      items: normalizedItems,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: String(paymentMethod),
      payerName: String(payerName).trim(),
      accountTail: String(accountTail).trim(),
      note: String(note || "").trim(),
      transactionId: String(transactionId)
    });

    const petIds = normalizedItems.filter((i) => i.petId).map((i) => i.petId);
    if (petIds.length) {
      await Pet.updateMany({ _id: { $in: petIds } }, { $set: { awaitingAdminSoldLabel: true } });
    }

    return res.status(201).json(purchase);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Duplicate transaction ID" });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ message: err.message });
    }
    console.error("Create purchase error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = {
  DEFAULT_DELIVERY_CHARGE,
  createPurchase
};

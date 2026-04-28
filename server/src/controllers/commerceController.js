const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Pet = require("../models/Pet");
const ShopItem = require("../models/ShopItem");

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

function aggregateShopItemQty(items) {
  return items.reduce((map, item) => {
    if (!item.shopItemId) return map;
    const key = String(item.shopItemId);
    const current = map.get(key) || { id: item.shopItemId, qty: 0, name: item.name };
    current.qty += item.qty;
    map.set(key, current);
    return map;
  }, new Map());
}

async function reserveShopItemStock(items) {
  const groupedItems = [...aggregateShopItemQty(items).values()];
  const decrementedItems = [];

  for (const entry of groupedItems) {
    const updatedItem = await ShopItem.findOneAndUpdate(
      { _id: entry.id, stock: { $gte: entry.qty } },
      { $inc: { stock: -entry.qty } },
      { new: true }
    ).select("name stock");

    if (!updatedItem) {
      const existingItem = await ShopItem.findById(entry.id).select("name stock");
      if (!existingItem) {
        throw Object.assign(new Error(`${entry.name} is no longer available`), { statusCode: 400 });
      }
      throw Object.assign(
        new Error(`Only ${existingItem.stock} stock left for ${existingItem.name}`),
        { statusCode: 400 }
      );
    }

    decrementedItems.push({ id: entry.id, qty: entry.qty });
  }

  return decrementedItems;
}

async function restoreShopItemStock(decrementedItems) {
  for (const entry of decrementedItems) {
    await ShopItem.findByIdAndUpdate(entry.id, { $inc: { stock: entry.qty } });
  }
}

async function createPurchase(req, res) {
  let decrementedItems = [];
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
      const shopItemId =
        kind === "shop_item" && rawId && mongoose.Types.ObjectId.isValid(String(rawId))
          ? new mongoose.Types.ObjectId(String(rawId))
          : null;
      return {
        name: String(item.name || "Item"),
        kind,
        category: String(item.category || ""),
        price: round2(price),
        qty,
        lineTotal: round2(price * qty),
        petId,
        shopItemId
      };
    });

    await assertPetsPurchasable(normalizedItems);
    decrementedItems = await reserveShopItemStock(normalizedItems);

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
    if (decrementedItems.length) {
      await restoreShopItemStock(decrementedItems);
    }
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

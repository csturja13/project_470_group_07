const path = require("path");
const ShopItem = require("../models/ShopItem");

function getOwnerId(req) {
  return req.user?.userId || req.user?.id || req.user?._id;
}

async function createShopItem(req, res) {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user?.role !== "petshop") {
      return res.status(403).json({ message: "Only pet shop accounts can create shop items" });
    }

    const { name, category, price, description, stock } = req.body;

    if (!name || price === undefined || price === null || price === "") {
      return res.status(400).json({ message: "name and price are required" });
    }

    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const item = await ShopItem.create({
      name: String(name).trim(),
      category: category || "other",
      price: Number(price),
      description: description || "",
      stock: stock === undefined || stock === "" ? 0 : Number(stock),
      imagePath,
      owner: ownerId
    });

    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create item", error: err.message });
  }
}

async function getMyShopItems(req, res) {
  try {
    const ownerId = getOwnerId(req);

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const items = await ShopItem.find({ owner: ownerId }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load items", error: err.message });
  }
}

async function updateShopItem(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { id } = req.params;

    const item = await ShopItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (String(item.owner) !== String(ownerId)) {
      return res.status(403).json({ message: "You can edit only your own items" });
    }

    const { name, category, price, description, stock } = req.body;

    if (name !== undefined) item.name = name;
    if (category !== undefined) item.category = category;
    if (price !== undefined) item.price = Number(price);
    if (description !== undefined) item.description = description;
    if (stock !== undefined) item.stock = Number(stock);

    if (req.file) {
      item.imagePath = `/uploads/${req.file.filename}`;
    }

    await item.save();
    return res.json(item);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update item", error: err.message });
  }
}

async function deleteShopItem(req, res) {
  try {
    const ownerId = getOwnerId(req);
    const { id } = req.params;

    const item = await ShopItem.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (String(item.owner) !== String(ownerId)) {
      return res.status(403).json({ message: "You can delete only your own items" });
    }

    await ShopItem.findByIdAndDelete(id);
    return res.json({ message: "Item deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete item", error: err.message });
  }
}

module.exports = {
  createShopItem,
  getMyShopItems,
  updateShopItem,
  deleteShopItem
};
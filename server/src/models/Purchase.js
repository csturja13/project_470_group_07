const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    kind: { type: String, default: "item" },
    category: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", default: null }
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [purchaseItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    payerName: { type: String, required: true },
    accountTail: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    note: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);

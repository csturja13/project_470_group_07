import { useMemo, useState } from "react";
import Modal from "./Modal";

function toNumberPrice(price) {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

function buildTransactionId() {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function CheckoutModal({ open, items = [], onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [payerName, setPayerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [showThanks, setShowThanks] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + toNumberPrice(item.price) * (Number(item.qty) || 0), 0),
    [items]
  );
  const totalQty = useMemo(() => items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0), [items]);

  function resetFormState() {
    setError("");
    setReceipt(null);
    setShowThanks(false);
    setPayerName("");
    setAccountNumber("");
    setNote("");
    setPaymentMethod("card");
  }

  function closeModal() {
    resetFormState();
    onClose?.();
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!items.length) {
      setError("No item selected for checkout.");
      return;
    }
    if (!payerName.trim()) {
      setError("Please enter payer name.");
      return;
    }
    const accountDigits = digitsOnly(accountNumber);
    const requiredLength = paymentMethod === "card" ? 13 : 11;
    if (accountDigits.length > requiredLength) {
      setError("You are more than digit limit.");
      return;
    }
    if (!accountDigits || accountDigits.length !== requiredLength) {
      setError(
        paymentMethod === "card"
          ? "Card number must be exactly 13 digits."
          : `${paymentMethod === "bkash" ? "bKash" : "Nagad"} number must be exactly 11 digits.`
      );
      return;
    }

    const transaction = {
      id: buildTransactionId(),
      at: new Date().toLocaleString(),
      method: paymentMethod,
      payerName: payerName.trim(),
      accountTail: accountDigits.slice(-4),
      total: subtotal.toFixed(2),
      qty: totalQty
    };
    setReceipt(transaction);
    onPaymentSuccess?.(transaction);
  }

  const methodLabel =
    paymentMethod === "card"
      ? "Card Number"
      : paymentMethod === "bkash"
      ? "bKash Number"
      : "Nagad Number";
  const requiredDigits = paymentMethod === "card" ? 13 : 11;
  const accountDigitsCount = digitsOnly(accountNumber).length;

  return (
    <Modal
      open={open}
      title={showThanks ? "Thanks for purchasing" : receipt ? "Transaction Successful" : "Checkout Payment"}
      onClose={closeModal}
      actions={
        showThanks ? (
          <button className="btn" type="button" onClick={closeModal}>
            Close
          </button>
        ) : receipt ? (
          <button className="btn" type="button" onClick={() => setShowThanks(true)}>
            Done
          </button>
        ) : (
          <>
            <button className="btn secondary" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn" type="submit" form="checkout-payment-form">
              Pay now
            </button>
          </>
        )
      }
    >
      {showThanks ? (
        <div style={{ display: "grid", gap: 12, justifyItems: "center", textAlign: "center", padding: "10px 0" }}>
          <div
            style={{
              background: "linear-gradient(90deg, #22c55e, #0ea5e9)",
              color: "white",
              fontWeight: 900,
              borderRadius: 999,
              padding: "8px 16px",
              display: "inline-block"
            }}
          >
            Payment Confirmed
          </div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Thank you for your purchase!</div>
          <div style={{ opacity: 0.9, maxWidth: 460 }}>
            Your order has been placed successfully. We will process and contact you soon with delivery details.
          </div>
        </div>
      ) : receipt ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div>
            Payment received for <b>{receipt.qty}</b> item(s) totaling <b>{receipt.total}</b>.
          </div>
          <div>Transaction ID: {receipt.id}</div>
          <div>Paid by: {receipt.payerName}</div>
          <div>Method: {receipt.method}</div>
          <div>Account ending: ****{receipt.accountTail}</div>
          <div>Time: {receipt.at}</div>
          {note ? <div>Note: {note}</div> : null}
        </div>
      ) : (
        <form id="checkout-payment-form" onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <div style={{ opacity: 0.88 }}>
            Items: <b>{totalQty}</b> • Total: <b>{subtotal.toFixed(2)}</b>
          </div>
          <select className="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="card">Card</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
          </select>
          <input
            className="input"
            placeholder="Payer name"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
          />
          <input
            className="input"
            placeholder={methodLabel}
            value={accountNumber}
            inputMode="numeric"
            onChange={(e) => {
              const nextDigits = digitsOnly(e.target.value);
              setAccountNumber(nextDigits);
              if (nextDigits.length > requiredDigits) {
                setError("You are more than digit limit.");
              } else if (error === "You are more than digit limit.") {
                setError("");
              }
            }}
          />
          <div
            style={{
              opacity: 0.9,
              fontSize: 13,
              color: accountDigitsCount > requiredDigits ? "#fecaca" : "inherit"
            }}
          >
            Digits: {accountDigitsCount}/{requiredDigits}
          </div>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            {paymentMethod === "card"
              ? "Card number must be exactly 13 digits."
              : `${paymentMethod === "bkash" ? "bKash" : "Nagad"} number must be exactly 11 digits.`}
          </div>
          <textarea
            className="input"
            rows={3}
            placeholder="Delivery note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error ? (
            <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
              {error}
            </div>
          ) : null}
        </form>
      )}
    </Modal>
  );
}

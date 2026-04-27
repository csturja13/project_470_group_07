import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "./CartContext";
import CheckoutModal from "../components/CheckoutModal";

function toNumberPrice(price) {
  const n = Number(price);
  return Number.isFinite(n) ? n : 0;
}

export default function CartPage({ user }) {
  const { items, remove, clear, setQty } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [purchaseKeys, setPurchaseKeys] = useState([]);

  if (!user) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Cart</h2>
        <div>Please login to use the cart.</div>
        <div style={{ marginTop: 10 }}>
          <Link to="/login" className="btn">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "user") {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Cart</h2>
        <div>Only normal users can use the cart.</div>
      </div>
    );
  }

  const totalItems = items.reduce((sum, x) => sum + (Number(x.qty) || 0), 0);
  const subtotal = items.reduce((sum, x) => sum + toNumberPrice(x.price) * (Number(x.qty) || 0), 0);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
        onClose={() => {
          setCheckoutOpen(false);
        }}
        onPaymentSuccess={() => {
          purchaseKeys.forEach((k) => remove(k));
          setPurchaseKeys([]);
        }}
      />

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>Cart</h2>
            <div style={{ opacity: 0.85 }}>
              {totalItems} item(s) • Subtotal: <b>{subtotal.toFixed(2)}</b>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn secondary" type="button" onClick={clear} disabled={!items.length}>
              Clear
            </button>
            <button
              className="btn"
              type="button"
              disabled={!items.length}
              onClick={() => {
                setPurchaseKeys(items.map((x) => x.key));
                setCheckoutItems(items);
                setCheckoutOpen(true);
              }}
            >
              Buy all now
            </button>
          </div>
        </div>
      </div>

      {!items.length ? (
        <div className="card" style={{ opacity: 0.9 }}>
          Your cart is empty. Browse <Link to="/petshops">Pet Shops</Link> to add items.
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((x) => (
              <div
                key={x.key}
                className="badge"
                style={{
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "92px 1fr auto",
                  gap: 12,
                  alignItems: "center"
                }}
              >
                <img
                  src={x.imageUrl || "https://placehold.co/240x180?text=Item"}
                  alt={x.name}
                  style={{ width: 92, height: 72, objectFit: "cover", borderRadius: 12 }}
                />

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {x.name}
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 2 }}>
                    Type: {x.kind}
                    {x.category ? ` • ${x.category}` : ""}
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 2 }}>
                    Price: <b>{x.price ?? "N/A"}</b>
                    {x.stock != null ? ` • Stock: ${x.stock}` : ""}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={x.kind === "pet" ? 1 : undefined}
                      value={x.qty}
                      disabled={x.kind === "pet"}
                      onChange={(e) => setQty(x.key, e.target.value)}
                      style={{ width: 92, padding: "9px 10px" }}
                    />
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setPurchaseKeys([x.key]);
                        setCheckoutItems([x]);
                        setCheckoutOpen(true);
                      }}
                    >
                      Buy now
                    </button>
                    <button className="btn secondary" type="button" onClick={() => remove(x.key)}>
                      Remove
                    </button>
                  </div>
                  <div style={{ opacity: 0.9 }}>
                    Line total: <b>{(toNumberPrice(x.price) * (Number(x.qty) || 0)).toFixed(2)}</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


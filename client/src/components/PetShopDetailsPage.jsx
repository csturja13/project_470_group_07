import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useCart } from "../cart/CartContext";
import CheckoutModal from "./CheckoutModal";
import PetSoldOverlay from "./PetSoldOverlay";

function petIsPurchasable(p) {
  if (p.awaitingAdminSoldLabel) return false;
  const style = p.soldBannerStyle || "none";
  return style === "none";
}

export default function PetShopDetailsPage({ user }) {
  const { id } = useParams();
  const nav = useNavigate();
  const cart = useCart();
  const [shop, setShop] = useState(null);
  const [pets, setPets] = useState([]);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);

  const [itemForm, setItemForm] = useState({
    name: "",
    category: "food",
    price: "",
    description: "",
    stock: ""
  });
  const [itemImage, setItemImage] = useState(null);

  const [petForm, setPetForm] = useState({
    name: "",
    species: "Dog",
    sex: "Male",
    age: "",
    price: "",
    description: ""
  });
  const [petImage, setPetImage] = useState(null);

  async function loadShopDetails() {
    try {
      setErr("");
      const res = await api.get(`/api/petshops/${id}/details`);
      setShop(res.data.shop);
      setPets(res.data.pets || []);
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load shop details");
    }
  }

  useEffect(() => {
    loadShopDetails();
  }, [id]);

  async function submitItem(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const data = new FormData();
      data.append("name", itemForm.name);
      data.append("category", itemForm.category);
      data.append("price", itemForm.price);
      data.append("description", itemForm.description);
      data.append("stock", itemForm.stock);
      if (itemImage) data.append("image", itemImage);

      await api.post("/api/shop-items", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setItemForm({
        name: "",
        category: "food",
        price: "",
        description: "",
        stock: ""
      });
      setItemImage(null);
      setMsg("Shop item added successfully");
      await loadShopDetails();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add shop item");
    }
  }

  async function submitPet(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const data = new FormData();
      data.append("name", petForm.name);
      data.append("species", petForm.species);
      data.append("sex", petForm.sex);
      data.append("age", petForm.age);
      data.append("price", petForm.price);
      data.append("description", petForm.description);
      if (petImage) data.append("image", petImage);

      await api.post("/api/pets", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setPetForm({
        name: "",
        species: "Dog",
        sex: "Male",
        age: "",
        price: "",
        description: ""
      });
      setPetImage(null);
      setMsg("Pet added successfully. It may stay pending until admin approves.");
      await loadShopDetails();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to add pet");
    }
  }

  if (err && !shop) return <div className="card">{err}</div>;
  if (!shop) return <div className="card">Loading shop details...</div>;

  const isOwner =
    user &&
    user.role === "petshop" &&
    (user._id === shop._id || user.id === shop._id);

  const canBuy = user?.role === "user";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
        onClose={() => setCheckoutOpen(false)}
        onPaymentSuccess={(txn) => {
          setMsg(`Payment complete: ${txn.id}`);
          loadShopDetails();
        }}
      />

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{shop.name}</h2>
        <div>{shop.email}</div>
        <div style={{ marginTop: 8 }}>⭐ {shop.averageRating || 0} / 5</div>
        <div style={{ opacity: 0.8 }}>Role: {shop.role}</div>
      </div>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
          {err}
        </div>
      )}

      {msg && (
        <div className="badge" style={{ background: "rgba(0,255,120,0.15)" }}>
          {msg}
        </div>
      )}
      {isOwner && (
        <>
          <div className="card">
            <h2>Add Pet</h2>

            <form
              onSubmit={submitPet}
              style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}
            >
              <input
                className="input"
                placeholder="Pet name"
                value={petForm.name}
                onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                required
              />

              <select
                className="select"
                value={petForm.species}
                onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Other">Other</option>
              </select>

              <select
                className="select"
                value={petForm.sex}
                onChange={(e) => setPetForm({ ...petForm, sex: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <input
                className="input"
                type="number"
                placeholder="Age"
                value={petForm.age}
                onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
              />

              <input
                className="input"
                type="number"
                placeholder="Price"
                value={petForm.price}
                onChange={(e) => setPetForm({ ...petForm, price: e.target.value })}
              />

              <textarea
                className="input"
                rows={4}
                placeholder="Description"
                value={petForm.description}
                onChange={(e) => setPetForm({ ...petForm, description: e.target.value })}
              />

              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e) => setPetImage(e.target.files?.[0] || null)}
              />

              <button className="btn" type="submit">
                Add Pet
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Add Shop Item</h2>

            <form
              onSubmit={submitItem}
              style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}
            >
              <input
                className="input"
                placeholder="Item name"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
              />

              <select
                className="select"
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
              >
                <option value="food">Food</option>
                <option value="toy">Toy</option>
                <option value="accessory">Accessory</option>
                <option value="medicine">Medicine</option>
                <option value="other">Other</option>
              </select>

              <input
                className="input"
                type="number"
                placeholder="Price"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                required
              />

              <input
                className="input"
                type="number"
                placeholder="Stock"
                value={itemForm.stock}
                onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
              />

              <textarea
                className="input"
                rows={4}
                placeholder="Description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              />

              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e) => setItemImage(e.target.files?.[0] || null)}
              />

              <button className="btn" type="submit">
                Add Item
              </button>
            </form>
          </div>
        </>
      )}

      <div className="card">
        <h2>Pets</h2>

        {!pets.length ? (
          <div style={{ opacity: 0.8 }}>No pets available.</div>
        ) : (
          <div className="petGrid" style={{ marginTop: 14 }}>
            {pets.map((p) => (
              <div key={p._id} className="petCard">
                <div className="petImgWrap">
                  <img
                    className="petImg"
                    src={
                      p.imagePath
                        ? `http://localhost:5000${p.imagePath}`
                        : "https://placehold.co/600x400?text=Pet"
                    }
                    alt={p.name}
                  />
                  <PetSoldOverlay
                    soldBannerStyle={p.soldBannerStyle || "none"}
                    awaitingAdminSoldLabel={Boolean(p.awaitingAdminSoldLabel)}
                  />
                </div>
                <div className="petTitle">
                  {p.name} — {p.species}
                </div>
                <div className="petMeta">
                  Sex: {p.sex || "Not specified"} • Age: {p.age ?? "Not specified"}
                </div>
                <div className="petMeta">Price: {p.price ?? "Not specified"}</div>
                <div className="petMeta">{p.description || "No description"}</div>

                {canBuy && petIsPurchasable(p) && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => {
                        cart.add({
                          kind: "pet",
                          id: p._id,
                          name: `${p.name} — ${p.species}`,
                          price: p.price ?? "",
                          imageUrl: p.imagePath ? `http://localhost:5000${p.imagePath}` : "",
                          shopId: shop?._id || id
                        });
                        setMsg(`Added to cart: ${p.name}`);
                      }}
                    >
                      Add to cart
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setCheckoutItems([
                          {
                            key: `pet:${p._id}`,
                            kind: "pet",
                            id: p._id,
                            name: `${p.name} — ${p.species}`,
                            qty: 1,
                            price: p.price ?? 0,
                            category: "",
                            imageUrl: p.imagePath ? `http://localhost:5000${p.imagePath}` : "",
                            shopId: shop?._id || id
                          }
                        ]);
                        setCheckoutOpen(true);
                      }}
                    >
                      Buy now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Pet Food, Toys & Items</h2>

        {!items.length ? (
          <div style={{ opacity: 0.8 }}>No items available.</div>
        ) : (
          <div className="petGrid" style={{ marginTop: 14 }}>
            {items.map((item) => (
              <div key={item._id} className="petCard">
                <img
                  className="petImg"
                  src={
                    item.imagePath
                      ? `http://localhost:5000${item.imagePath}`
                      : "https://placehold.co/600x400?text=Shop+Item"
                  }
                  alt={item.name}
                />
                <div className="petTitle">{item.name}</div>
                <div className="petMeta">Category: {item.category}</div>
                <div className="petMeta">Price: {item.price}</div>
                <div className="petMeta">Stock: {item.stock}</div>
                <div className="petMeta">{item.description}</div>

                {canBuy && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => {
                        cart.add({
                          kind: "shop_item",
                          id: item._id,
                          name: item.name,
                          category: item.category,
                          price: item.price ?? "",
                          stock: item.stock ?? null,
                          imageUrl: item.imagePath ? `http://localhost:5000${item.imagePath}` : "",
                          shopId: shop?._id || id
                        });
                        setMsg(`Added to cart: ${item.name}`);
                      }}
                    >
                      Add to cart
                    </button>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => {
                        setCheckoutItems([
                          {
                            key: `shop_item:${item._id}`,
                            kind: "shop_item",
                            id: item._id,
                            name: item.name,
                            qty: 1,
                            price: item.price ?? 0,
                            category: item.category || "",
                            imageUrl: item.imagePath ? `http://localhost:5000${item.imagePath}` : "",
                            shopId: shop?._id || id,
                            stock: item.stock ?? null
                          }
                        ]);
                        setCheckoutOpen(true);
                      }}
                    >
                      Buy now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
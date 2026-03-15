import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import "./App.css";
import { api, setAuthToken } from "./api";
import DocumentsPage from "./components/DocumentsPage";

/* ================= AUTH HELPERS ================= */
function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  setAuthToken(token);
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setAuthToken(null);
}

/* ================= NAVBAR (WITH SEARCH/FILTER/SORT) ================= */
function Navbar({
  user,
  onLogout,
  searchText,
  setSearchText,
  category,
  setCategory,
  sort,
  setSort,
  onSearchEnter
}) {
  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>🐾 Pawlytics</div>
          <Link to="/" className="btn secondary">Home</Link>
          {user && <Link to="/petshops" className="btn secondary">Pet Shops</Link>}
          {user && <Link to="/profile" className="btn secondary">Profile</Link>}
          {user && <Link to="/documents" className="btn secondary">Documents</Link>}
          {user && user.role === "admin" && <Link to="/admin" className="btn secondary">Admin Panel</Link>}
          {!user && <Link to="/signup" className="btn secondary">Signup</Link>}
          {!user && <Link to="/login" className="btn secondary">Login</Link>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {user ? (
            <>
              <span className="badge">{user.name} ({user.role})</span>
              <button className="btn" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <span className="badge">Not logged in</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1.4fr 0.6fr 0.6fr",
          marginTop: 18
        }}
      >
        <input
          className="input"
          placeholder="Search pets... (Enter)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchEnter();
          }}
        />

        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Category → All</option>
          <option value="Dog">Category → Dog</option>
          <option value="Cat">Category → Cat</option>
          <option value="Bird">Category → Bird</option>
          <option value="Other">Category → Other</option>
        </select>

        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort → Default</option>
          <option value="price_asc">Sort → Price: Low → High</option>
          <option value="price_desc">Sort → Price: High → Low</option>
        </select>
      </div>

      {!user && (
        <div style={{ marginTop: 14, opacity: 0.9 }}>
          Welcome to Pawlytics. Signup/Login to create pet posts.
        </div>
      )}
    </div>
  );
}

/* ================= HOME (FEED FIRST) ================= */
function Home({ user, pets, loading, error, onRefresh }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Pet Feed</h2>
          <button className="btn" onClick={onRefresh}>Refresh</button>
        </div>

        {loading && <div style={{ marginTop: 12 }}>Loading pets…</div>}

        {error && (
          <div className="badge" style={{ background: "rgba(255,0,0,0.15)", marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
          {pets.map((p) => (
            <div key={p._id} className="badge" style={{ padding: 12 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {p.name} — {p.species}
              </div>
              <div style={{ opacity: 0.85, marginTop: 4 }}>
                Sex: {p.sex || "Not specified"} • Age: {p.age ?? "Not specified"} • Price: {p.price ?? "Not specified"}
              </div>
              <div style={{ marginTop: 6 }}>{p.description}</div>
              <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                Status: {p.approvalStatus}
              </div>
              {p.imagePath && (
                <img
                  src={`http://localhost:5000${p.imagePath}`}
                  alt={p.name}
                  style={{ width: "100%", maxWidth: 320, marginTop: 10, borderRadius: 12 }}
                />
              )}
            </div>
          ))}

          {!loading && !pets.length && <div style={{ opacity: 0.85 }}>No pets found.</div>}
        </div>

        {!user && <div style={{ marginTop: 18, opacity: 0.75 }}>Created by CAPA (2026)</div>}
      </div>

      {user && <CreatePet user={user} onCreated={onRefresh} />}
    </div>
  );
}

/* ================= CREATE POST ================= */
function CreatePet({ user, onCreated }) {
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    species: "Dog",
    sex: "Male",
    age: "",
    price: "",
    description: ""
  });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function submitPet(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("species", form.species);
      data.append("sex", form.sex);
      data.append("age", form.age === "" ? "" : String(form.age));
      data.append("price", form.price === "" ? "" : String(form.price));
      data.append("description", form.description);
      if (imageFile) data.append("image", imageFile);

      await api.post("/api/pets", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm({
        name: "",
        species: "Dog",
        sex: "Male",
        age: "",
        price: "",
        description: ""
      });
      setImageFile(null);
      setMsg("Pet post submitted");
      const fileInput = document.getElementById("petImageInput");
      if (fileInput) fileInput.value = "";
      onCreated();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to submit pet");
    }
  }

  if (!user) return null;

  return (
    <div className="card">
      <h2>Create Pet Post</h2>

      {err && <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>{err}</div>}
      {msg && <div className="badge" style={{ background: "rgba(0,255,120,0.15)" }}>{msg}</div>}

      <form onSubmit={submitPet} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <input
          className="input"
          placeholder="Pet name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <select
            className="input"
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
          >
            <option>Dog</option>
            <option>Cat</option>
            <option>Bird</option>
            <option>Other</option>
          </select>

          <select
            className="input"
            value={form.sex}
            onChange={(e) => setForm({ ...form, sex: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <input
            className="input"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <input
            className="input"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <input
          id="petImageInput"
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <textarea
          className="input"
          rows={4}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button className="btn" type="submit">Submit</button>
      </form>

      <div style={{ marginTop: 8, opacity: 0.75, fontSize: 13 }}>
        Posts are <b>Pending</b> until admin approves.
      </div>
    </div>
  );
}

/* ================= PET SHOPS PAGE ================= */
function PetShops() {
  const [shops, setShops] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadShops() {
      try {
        setErr("");
        const res = await api.get("/api/petshops");
        setShops(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load pet shops");
      }
    }
    loadShops();
  }, []);

  return (
    <div className="card">
      <h2>Pet Shops</h2>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)", marginTop: 12 }}>
          {err}
        </div>
      )}

      {!err && !shops.length && <div style={{ marginTop: 10 }}>No pet shops found.</div>}

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {shops.map((s) => (
          <div key={s._id} className="badge" style={{ padding: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{s.name}</div>
            <div style={{ marginTop: 4 }}>{s.email}</div>
            <div style={{ marginTop: 6 }}>⭐ {s.averageRating || 0} / 5</div>
            <div>{s.totalRatings || 0} reviews</div>
            <div style={{ marginTop: 4, opacity: 0.8 }}>Role: {s.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= SIGNUP ================= */
function Signup({ onAuth }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/api/auth/signup", form);
      onAuth(res.data.token, res.data.user);
      nav("/login");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2>Signup</h2>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
          {err}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <input
          className="input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="input"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="user">User</option>
          <option value="petshop">Pet Shop</option>
        </select>
        <button className="btn" type="submit">Create Account</button>
      </form>
    </div>
  );
}

/* ================= LOGIN ================= */
function Login({ onAuth }) {
  const nav = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/api/auth/login", form);
      const user = res.data.user;

      if (isAdminLogin && user.role !== "admin") {
        setErr("This account is not an admin.");
        return;
      }

      onAuth(res.data.token, user);
      if (user.role === "admin") nav("/admin");
      else nav("/");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2>{isAdminLogin ? "Admin Login" : "User Login"}</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          type="button"
          className={!isAdminLogin ? "btn" : "btn secondary"}
          onClick={() => setIsAdminLogin(false)}
        >
          User Login
        </button>
        <button
          type="button"
          className={isAdminLogin ? "btn" : "btn secondary"}
          onClick={() => setIsAdminLogin(true)}
        >
          Admin Login
        </button>
      </div>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
          {err}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}

/* ================= PROFILE WITH RATINGS ================= */
function Profile({ user, onUserRefresh }) {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [petshops, setPetshops] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedPetshop, setSelectedPetshop] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [petshopRating, setPetshopRating] = useState(5);
  const [userReview, setUserReview] = useState("");
  const [petshopReview, setPetshopReview] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function loadAll() {
    try {
      setErr("");

      const [meRes, usersRes, petshopsRes] = await Promise.all([
        api.get("/api/auth/me"),
        api.get("/api/users"),
        api.get("/api/petshops")
      ]);

      setMe(meRes.data);
      setUsers(usersRes.data.filter((u) => u._id !== meRes.data._id));
      setPetshops(petshopsRes.data.filter((p) => p._id !== meRes.data._id));

      const updatedUser = {
        ...(user || {}),
        ...meRes.data
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      onUserRefresh?.(updatedUser);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load profile data");
    }
  }

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  async function submitUserRating(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      await api.post(`/api/users/${selectedUser}/rate`, {
        value: Number(userRating),
        review: userReview
      });
      setMsg("User rating submitted");
      setUserReview("");
      setSelectedUser("");
      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to rate user");
    }
  }

  async function submitPetshopRating(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      await api.post(`/api/petshops/${selectedPetshop}/rate`, {
        value: Number(petshopRating),
        review: petshopReview
      });
      setMsg("Pet shop rating submitted");
      setPetshopReview("");
      setSelectedPetshop("");
      await loadAll();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to rate pet shop");
    }
  }

  if (!user) return <div className="card">Please login first.</div>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="card">
        <h2>Profile</h2>

        {err && <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>{err}</div>}
        {msg && <div className="badge" style={{ background: "rgba(0,255,120,0.15)" }}>{msg}</div>}

        <div><b>Name:</b> {me?.name || user.name}</div>
        <div><b>Email:</b> {me?.email || user.email}</div>
        <div><b>Role:</b> {me?.role || user.role}</div>
        <div><b>Average rating:</b> ⭐ {me?.averageRating ?? 0} / 5</div>
        <div><b>Total ratings:</b> {me?.totalRatings ?? 0}</div>
      </div>

      <div className="card">
        <h2>Rate a User</h2>

        {!users.length ? (
          <div style={{ opacity: 0.8 }}>No users available.</div>
        ) : (
          <form onSubmit={submitUserRating} style={{ display: "grid", gap: 10 }}>
            <select
              className="input"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
            >
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — ⭐ {u.averageRating || 0} ({u.totalRatings || 0})
                </option>
              ))}
            </select>

            <select
              className="input"
              value={userRating}
              onChange={(e) => setUserRating(e.target.value)}
            >
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>

            <textarea
              className="input"
              placeholder="Write review"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
            />

            <button className="btn" type="submit">Submit User Rating</button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Rate a Pet Shop</h2>

        {!petshops.length ? (
          <div style={{ opacity: 0.8 }}>No pet shops available.</div>
        ) : (
          <form onSubmit={submitPetshopRating} style={{ display: "grid", gap: 10 }}>
            <select
              className="input"
              value={selectedPetshop}
              onChange={(e) => setSelectedPetshop(e.target.value)}
              required
            >
              <option value="">Select pet shop</option>
              {petshops.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ⭐ {p.averageRating || 0} ({p.totalRatings || 0})
                </option>
              ))}
            </select>

            <select
              className="input"
              value={petshopRating}
              onChange={(e) => setPetshopRating(e.target.value)}
            >
              <option value={1}>1 Star</option>
              <option value={2}>2 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={5}>5 Stars</option>
            </select>

            <textarea
              className="input"
              placeholder="Write review"
              value={petshopReview}
              onChange={(e) => setPetshopReview(e.target.value)}
            />

            <button className="btn" type="submit">Submit Pet Shop Rating</button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Pet Shop Ratings</h2>

        {!petshops.length ? (
          <div style={{ opacity: 0.8 }}>No pet shops found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {petshops.map((p) => (
              <div key={p._id} className="badge" style={{ padding: 12 }}>
                <div><b>{p.name}</b></div>
                <div>⭐ {p.averageRating || 0} / 5</div>
                <div>{p.totalRatings || 0} review(s)</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= ADMIN PANEL ================= */
function AdminPanel({ user }) {
  const [pending, setPending] = useState([]);
  const [err, setErr] = useState("");

  async function loadPending() {
    setErr("");
    try {
      const res = await api.get("/api/admin/pets/pending");
      setPending(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load pending pets");
    }
  }

  useEffect(() => {
    loadPending();
  }, []);

  async function setStatus(id, status) {
    await api.patch(`/api/admin/pets/${id}/status`, { status });
    await loadPending();
  }

  async function remove(id) {
    if (!window.confirm("Delete this post?")) return;
    await api.delete(`/api/admin/pets/${id}`);
    await loadPending();
  }

  if (!user) return <div className="card">Please login as admin.</div>;
  if (user.role !== "admin") return <div className="card">Forbidden: Admin only.</div>;

  return (
    <div className="card">
      <h2>Admin Panel — Pending Posts</h2>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
          {err}
        </div>
      )}

      {!pending.length && <div style={{ opacity: 0.8, marginTop: 10 }}>No pending posts.</div>}

      {pending.map((p) => (
        <div
          key={p._id}
          style={{ marginTop: 15, display: "flex", gap: 15, alignItems: "center" }}
        >
          <img
            src={p.imagePath ? `http://localhost:5000${p.imagePath}` : "https://placehold.co/240x180?text=Pet"}
            alt={p.name}
            style={{ width: 220, height: 160, objectFit: "cover", borderRadius: 14 }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {p.name} — {p.species}
            </div>

            <div style={{ opacity: 0.85 }}>
              Sex: {p.sex || "Not specified"} • Age: {p.age ?? "Not specified"} • Price: {p.price ?? "Not specified"}
            </div>

            <div style={{ opacity: 0.9 }}>{p.description}</div>

            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Status: {p.approvalStatus}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setStatus(p._id, "Approved")}>Approve</button>
              <button className="btn secondary" onClick={() => setStatus(p._id, "Rejected")}>Reject</button>
              <button className="btn secondary" onClick={() => remove(p._id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [petsRaw, setPetsRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  async function loadPets() {
    setLoading(true);
    setErr("");

    try {
      const res = await api.get("/api/pets", {
        params: { q: searchText, species: category }
      });
      setPetsRaw(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load pets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    loadPets();
  }, [category]);

  const pets = useMemo(() => {
    const arr = [...petsRaw];
    if (sort === "price_asc") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price_desc") arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    return arr;
  }, [petsRaw, sort]);

  function onAuth(token, userObj) {
    saveAuth(token, userObj);
    setUser(userObj);
  }

  function onLogout() {
    clearAuth();
    setUser(null);
  }

  function onUserRefresh(userObj) {
    setUser(userObj);
  }

  return (
    <BrowserRouter>
      <div className="container">
        <Navbar
          user={user}
          onLogout={onLogout}
          searchText={searchText}
          setSearchText={setSearchText}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          onSearchEnter={loadPets}
        />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={user}
                pets={pets}
                loading={loading}
                error={err}
                onRefresh={loadPets}
              />
            }
          />
          <Route path="/petshops" element={<PetShops />} />
          <Route path="/signup" element={<Signup onAuth={onAuth} />} />
          <Route path="/login" element={<Login onAuth={onAuth} />} />
          <Route path="/profile" element={<Profile user={user} onUserRefresh={onUserRefresh} />} />
          <Route path="/documents" element={<DocumentsPage user={user} />} />
          <Route path="/admin" element={<AdminPanel user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
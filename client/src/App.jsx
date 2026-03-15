import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
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
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="navbarTop">
        <div className="navLinks">
          <div style={{ fontSize: 22 }}>🐾</div>
          <b style={{ fontSize: 25 }}>Pawlytics</b>

          <Link to="/">Home</Link>
          {user && user.role === "admin" && <Link to="/admin">Admin Panel</Link>}

          {!user && <Link to="/signup">Signup</Link>}
          {!user && <Link to="/login">Login</Link>}
          {user && <Link to="/profile">Profile</Link>}
          {user && <Link to="/documents">Documents</Link>}
        </div>

        <div className="navSearchLine">
          <input
            className="input"
            placeholder="Search pets… (Enter)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchEnter();
            }}
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category → All</option>
            <option value="Dog">Category → Dog</option>
            <option value="Cat">Category → Cat</option>
            <option value="Bird">Category → Bird</option>
            <option value="Other">Category → Other</option>
          </select>

          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Sort → Default</option>
            <option value="price_asc">Sort → Price: Low → High</option>
            <option value="price_desc">Sort → Price: High → Low</option>
          </select>
        </div>

        <div className="navRight">
          {user ? (
            <>
              <span className="badge">
                {user.name} ({user.role})
              </span>
              <button className="btn secondary" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <span className="badge">Not logged in</span>
          )}
        </div>
      </div>

      {!user && (
        <div className="navWelcome">
          Welcome to Pawlytics 🐾 <span style={{ opacity: 0.85 }}>Signup/Login to create pet posts.</span>
        </div>
      )}
    </div>
  );
}

/*================= REUSABLE CARD ================= */

function PetCard({ p }) {
  return (
    <div className="petCard" key={p._id}>
      <img
        className="petImg"
        src={
          p.imagePath
            ? `http://localhost:5000${p.imagePath}`
            : "https://placehold.co/600x400?text=Pet"
        }
        alt={p.name}
      />

      <div className="petTitle">
        {p.name} — {p.species}
      </div>

      <div className="petMeta">
        Sex: {p.sex || "Not specified"} • Age: {p.age || "Not specified"} • Price: {p.price || "Not specified"}
      </div>

      <div className="petMeta">{p.description}</div>
      <div className="petStatus">Status: {p.approvalStatus}</div>

      <div style={{ marginTop: 10 }}>
        <Link to={`/pets/${p._id}`} className="btn">
          View Details
        </Link>
      </div>
    </div>
  );
}

/* ================= HOME (FEED FIRST) ================= */

function Home({ user, pets, loading, error, onRefresh }) {
  const myPets = user
    ? pets.filter((p) => p.owner && p.owner._id === user._id)
    : [];

  const otherPets = user
    ? pets.filter((p) => !p.owner || p.owner._id !== user._id)
    : pets;

  return (
    <div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>
            {user ? "Pet Feed" : "All Pet Posts"}
          </h2>
          <button className="btn" type="button" onClick={onRefresh}>
            Refresh
          </button>
        </div>

        {loading && <div style={{ marginTop: 12, opacity: 0.85 }}>Loading pets…</div>}
        {error && (
          <div className="badge" style={{ background: "rgba(255,0,0,0.15)", marginTop: 12 }}>
            {error}
          </div>
        )}

        {!loading && !error && !user && (
          <>
            <div className="petGrid" style={{ marginTop: 14 }}>
              {pets.map((p) => (
                <PetCard key={p._id} p={p} />
              ))}
            </div>

            {!pets.length && <div style={{ marginTop: 10, opacity: 0.8 }}>No pets found.</div>}
          </>
        )}

        {!loading && !error && user && (
          <>
            <h3 style={{ marginTop: 18 }}>My Pet Posts</h3>
            <div className="petGrid" style={{ marginTop: 14 }}>
              {myPets.map((p) => (
                <PetCard key={p._id} p={p} />
              ))}
            </div>
            {!myPets.length && (
              <div style={{ marginTop: 10, opacity: 0.8 }}>You have not posted any pets yet.</div>
            )}

            <h3 style={{ marginTop: 28 }}>Other Users' Pet Posts</h3>
            <div className="petGrid" style={{ marginTop: 14 }}>
              {otherPets.map((p) => (
                <PetCard key={p._id} p={p} />
              ))}
            </div>
            {!otherPets.length && (
              <div style={{ marginTop: 10, opacity: 0.8 }}>No posts from other users found.</div>
            )}
          </>
        )}
      </div>

      {!user && (
        <div className="card welcomeCard">
          <p style={{ margin: "10px 0 0", opacity: 0.9 }}>
            Created by CAPA (2026)
          </p>
        </div>
      )}

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

  async function submitPet(e) {
    e.preventDefault();

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

    const fileInput = document.getElementById("petImageInput");
    if (fileInput) fileInput.value = "";

    onCreated();
  }

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Create Pet Post</h2>

      <form
  onSubmit={submitPet}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 14,
    maxWidth: 500
  }}
>
        <input
          className="input"
          placeholder="Pet name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <select
          className="select"
          value={form.species}
          onChange={(e) => setForm({ ...form, species: e.target.value })}
        >
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Other">Other</option>
        </select>

        <select
          className="select"
          value={form.sex}
          onChange={(e) => setForm({ ...form, sex: e.target.value })}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          className="input"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <input
          className="input"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          id="petImageInput"
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />

        <textarea
          className="textarea"
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

/* ================= PET DETAILS ================= */
function PetDetails() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadPet() {
      setLoading(true);
      setErr("");

      try {
        const res = await api.get(`/api/pets/${id}`);
        setPet(res.data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load pet details");
      } finally {
        setLoading(false);
      }
    }

    loadPet();
  }, [id]);

  if (loading) return <div className="card">Loading pet details...</div>;
  if (err) return <div className="card">{err}</div>;
  if (!pet) return <div className="card">Pet not found.</div>;

  return (
    <div className="card">
      <h2>{pet.name} — {pet.species}</h2>

      <img
        src={
          pet.imagePath
            ? `http://localhost:5000${pet.imagePath}`
            : "https://placehold.co/600x400?text=Pet"
        }
        alt={pet.name}
        style={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 14,
          objectFit: "cover",
          marginBottom: 14
        }}
      />

      <div><b>Age:</b> {pet.age}</div>
      <div><b>Price:</b> {pet.price}</div>
      <div><b>Description:</b> {pet.description}</div>
      <div><b>Status:</b> {pet.approvalStatus}</div>

      <hr style={{ margin: "16px 0" }} />

      <h3>Owner Information</h3>
      <div><b>Name:</b> {pet.owner?.name || "Not available"}</div>
      <div><b>Email:</b> {pet.owner?.email || "Not available"}</div>
    </div>
  );
}

/* ================= SIGNUP ================= */

function Signup({ onAuth }) {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
        <input className="input" placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password (min 6)" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
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
        <button type="button" className={!isAdminLogin ? "btn" : "btn secondary"} onClick={() => setIsAdminLogin(false)}>
          User Login
        </button>
        <button type="button" className={isAdminLogin ? "btn" : "btn secondary"} onClick={() => setIsAdminLogin(true)}>
          Admin Login
        </button>
      </div>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
          {err}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <input className="input" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}

/* ================= PROFILE ================= */

function Profile({ user }) {
  if (!user) return <div className="card">Please login first.</div>;

  return (
    <div className="card">
      <h2>Profile</h2>
      <div><b>Name:</b> {user.name}</div>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Role:</b> {user.role}</div>
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
    if (!confirm("Delete this post?")) return;
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
        <div key={p._id} style={{ marginTop: 15, display: "flex", gap: 15, alignItems: "center" }}>
          <img
            src={p.imagePath ? `http://localhost:5000${p.imagePath}` : "https://placehold.co/240x180?text=Pet"}
            alt={p.name}
            style={{ width: 220, height: 160, objectFit: "cover", borderRadius: 14 }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{p.name} — {p.species}</div>
            <div style={{ opacity: 0.85 }}>
              Sex: {p.sex || "Not specified"} • Age: {p.age ?? "Not specified"} • Price: {p.price ?? "Not specified"}
            </div>
            <div style={{ opacity: 0.9 }}>{p.description}</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>Status: {p.approvalStatus}</div>

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
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadPets();
    // eslint-disable-next-line
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
        <Route path="/signup" element={<Signup onAuth={onAuth} />} />
        <Route path="/login" element={<Login onAuth={onAuth} />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/documents" element={<DocumentsPage user={user} />} />
        <Route path="/admin" element={<AdminPanel user={user} />} />
        <Route path="/pets/:id" element={<PetDetails />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}
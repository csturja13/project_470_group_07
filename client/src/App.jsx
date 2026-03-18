import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import "./App.css";
import { api, setAuthToken } from "./api";
import DocumentsPage from "./components/DocumentsPage";
import VaccinationCampaignsPage from "./components/VaccinationCampaignsPage";
import PetShopDetailsPage from "./components/PetShopDetailsPage";
import useDeletePet from "./hooks/useDeletePet";

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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              flexWrap: "wrap"
            }}
          >
            <div style={{ fontSize: 22 }}>🐾</div>
            <b style={{ fontSize: 25 }}>Pawlytics</b>

            <Link to="/">Home</Link>
            {user && <Link to="/petshops">Pet Shops</Link>}
            {user && <Link to="/profile">Profile</Link>}
            {user && <Link to="/documents">Documents</Link>}
            {user && <Link to="/vaccination-campaigns">Vaccination Campaigns</Link>}

<<<<<<< HEAD
          {!user && <Link to="/signup">Signup</Link>}
          {!user && <Link to="/login">Login</Link>}
          {user && <Link to="/profile">Profile</Link>}
          {user && <Link to="/documents">Documents</Link>}
          <Link to="/vaccination-campaigns">Vaccination Campaigns</Link>
        
=======
            {!user && <Link to="/signup">Signup</Link>}
            {!user && <Link to="/login">Login</Link>}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" className="btn secondary">
                    Admin Panel
                  </Link>
                )}

                <span className="badge">
                  {user.name} ({user.role})
                </span>

                <button className="btn" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <span className="badge">Not logged in</span>
            )}
          </div>
>>>>>>> b58eac600b0004b95e848a336fac219746b2e01e
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap"
          }}
        >
          <input
            className="input"
            placeholder="Search pets… (Enter)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearchEnter();
            }}
            style={{ flex: "1 1 320px", minWidth: 260 }}
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="">Category → All</option>
            <option value="Dog">Category → Dog</option>
            <option value="Cat">Category → Cat</option>
            <option value="Bird">Category → Bird</option>
            <option value="Other">Category → Other</option>
          </select>

          <select
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="">Sort → Default</option>
            <option value="price_asc">Sort → Price: Low → High</option>
            <option value="price_desc">Sort → Price: High → Low</option>
          </select>
        </div>
      </div>

      {!user && (
        <div style={{ marginTop: 14, opacity: 0.9 }}>
          Welcome to Pawlytics. Signup/Login to create pet posts.
        </div>
      )}
    </div>
  );
}
/* ================= REUSABLE CARD ================= */
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
        Owner: {p.owner?.name || "Unknown"}
      </div>

      <div className="petMeta">
        Sex: {p.sex || "Not specified"} • Age: {p.age ?? "Not specified"} • Price: {p.price ?? "Not specified"}
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
        </div>

        {loading && <div style={{ marginTop: 12 }}>Loading pets…</div>}

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

/* ================= PET DETAILS ================= */
function PetDetails({ user, onRefresh }) {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const deletePet = useDeletePet(onRefresh);

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

  const isOwner = user && pet?.owner && pet.owner._id === user._id;

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
      <div><b>Sex:</b>{pet.sex || "Not specified"}</div>
      <div><b>Age:</b> {pet.age ?? "Not specified"}</div>
      <div><b>Price:</b> {pet.price ?? "Not specified"}</div>
      <div><b>Description:</b> {pet.description || "No description"}</div>

      {isOwner && (
        <div style={{ marginTop: 16 }}>
          <button className="btn secondary" onClick={() => deletePet(id)}>
            Delete Post
          </button>
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      <h3>Owner Information</h3>
      <div><b>Name:</b> {pet.owner?.name || "Not available"}</div>
      <div><b>Email:</b> {pet.owner?.email || "Not available"}</div>
    </div>
  );
}

/* ================= PET SHOPS PAGE ================= */
function PetShops({ user }) {
  const [shops, setShops] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function loadShops() {
    try {
      setErr("");
      const res = await api.get("/api/petshops");
      setShops(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load pet shops");
    }
  }

  useEffect(() => {
    loadShops();
  }, []);

  async function rateShop(shopId, value) {
    if (!user) {
      setErr("Please login first.");
      return;
    }

    if (user.role !== "user") {
      setErr("Only normal users can rate pet shops.");
      return;
    }

    try {
      setErr("");
      setMsg("");
      await api.post(`/api/petshops/${shopId}/rate`, {
        value,
        review: ""
      });
      setMsg("Rating submitted successfully.");
      await loadShops();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to submit rating");
    }
  }

  return (
    <div className="card">
      <h2>Pet Shops</h2>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)", marginTop: 12 }}>
          {err}
        </div>
      )}

      {msg && (
        <div className="badge" style={{ background: "rgba(0,255,120,0.15)", marginTop: 12 }}>
          {msg}
        </div>
      )}

      {!err && !shops.length && <div style={{ marginTop: 10 }}>No pet shops found.</div>}

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {shops.map((s) => (
          <div key={s._id} className="badge" style={{ padding: 14 }}>
            <Link
              to={`/petshops/${s._id}`}
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: "white",
                textDecoration: "none"
              }}
            >
              {s.name}
            </Link>

            <div style={{ marginTop: 4 }}>{s.email}</div>

            <div style={{ display: "flex", gap: 8, marginTop: 12, fontSize: 30 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => rateShop(s._id, star)}
                  style={{
                    cursor: user?.role === "user" ? "pointer" : "default",
                    color: star <= Math.round(s.averageRating || 0) ? "#facc15" : "#9ca3af"
                  }}
                >
                  ★
                </span>
              ))}
            </div>

            <div style={{ marginTop: 8 }}>
              ⭐ {s.averageRating || 0} / 5
            </div>

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
function AdminPanel({ user, onRefresh }) {
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

  async function approve(id) {
    try {
      await api.patch(`/api/admin/pets/${id}/approve`);
      await loadPending();
      onRefresh?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to approve pet");
    }
  }

  async function reject(id) {
    try {
      await api.delete(`/api/admin/pets/${id}/reject`);
      await loadPending();
      onRefresh?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to reject pet");
    }
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
            src={
              p.imagePath
                ? `http://localhost:5000${p.imagePath}`
                : "https://placehold.co/240x180?text=Pet"
            }
            alt={p.name}
            style={{ width: 220, height: 160, objectFit: "cover", borderRadius: 14 }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {p.name} — {p.species}
            </div>

            <div style={{ opacity: 0.85 }}>
              Owner: {p.owner?.name || "Unknown"}
            </div>

            <div style={{ opacity: 0.85 }}>
              Sex: {p.sex || "Not specified"} • Age: {p.age ?? "Not specified"} • Price: {p.price ?? "Not specified"}
            </div>

            <div style={{ opacity: 0.9 }}>{p.description}</div>

            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Status: {p.approvalStatus}
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => approve(p._id)}>Approve</button>
              <button className="btn secondary" onClick={() => reject(p._id)}>Reject</button>
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
<<<<<<< HEAD
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
        <Route path="/vaccination-campaigns" element={<VaccinationCampaignsPage user={user} />}
/>
        <Route path="/admin" element={<AdminPanel user={user} />} />
        <Route path="/pets/:id" element={<PetDetails />} />
      </Routes>
=======
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
          <Route path="/profile" element={<Profile user={user} onUserRefresh={onUserRefresh} />} />
          <Route path="/documents" element={<DocumentsPage user={user} />} />
          <Route path="/vaccination-campaigns" element={<VaccinationCampaignsPage user={user} />} />
          <Route path="/admin" element={<AdminPanel user={user} onRefresh={loadPets} />} />
          <Route path="/pets/:id" element={<PetDetails user={user} onRefresh={loadPets} />} />
          <Route path="/petshops" element={<PetShops user={user} />} />
          <Route path="/petshops/:id" element={<PetShopDetailsPage user={user} />} />
        </Routes>
>>>>>>> b58eac600b0004b95e848a336fac219746b2e01e
      </div>
    </BrowserRouter>
  );
}
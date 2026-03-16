import { useEffect, useState } from "react";
import { api } from "../api";

export default function VaccinationCampaignsPage({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [err, setErr] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    targetSpecies: "All",
    vaccineName: "",
    location: "",
    organizer: "",
    campaignDate: "",
    lastRegistrationDate: "",
    availableSlots: 0,
    status: "Upcoming"
  });

  async function loadCampaigns() {
    try {
      const res = await api.get("/api/vaccination-campaigns", {
        params: {
          status: filterStatus || undefined,
          species: filterSpecies || undefined
        }
      });
      setCampaigns(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load campaigns");
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [filterStatus, filterSpecies]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/api/vaccination-campaigns", form);
      setForm({
        title: "",
        description: "",
        targetSpecies: "All",
        vaccineName: "",
        location: "",
        organizer: "",
        campaignDate: "",
        lastRegistrationDate: "",
        availableSlots: 0,
        status: "Upcoming"
      });
      loadCampaigns();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create campaign");
    }
  }

  async function removeCampaign(id) {
    try {
      await api.delete(`/api/vaccination-campaigns/${id}`);
      loadCampaigns();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete campaign");
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Vaccination Campaigns</h2>

        {err && (
          <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <select
            className="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            className="select"
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
          >
            <option value="">All Species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>

          <button className="btn" onClick={loadCampaigns}>
            Refresh
          </button>
        </div>
      </div> 

      {user && user.role === "admin" && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Manage Vaccination Campaign</h2>

          <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
            <input
              className="input"
              placeholder="Campaign Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <textarea
              className="textarea"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <select
              className="select"
              value={form.targetSpecies}
              onChange={(e) => setForm({ ...form, targetSpecies: e.target.value })}
            >
              <option value="All">All</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </select>

            <input
              className="input"
              placeholder="Vaccine Name"
              value={form.vaccineName}
              onChange={(e) => setForm({ ...form, vaccineName: e.target.value })}
              required
            />

            <input
              className="input"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />

            <input
              className="input"
              placeholder="Organizer"
              value={form.organizer}
              onChange={(e) => setForm({ ...form, organizer: e.target.value })}
            />

            <input
              className="input"
              type="date"
              value={form.campaignDate}
              onChange={(e) => setForm({ ...form, campaignDate: e.target.value })}
              required
            />

            <input
              className="input"
              type="date"
              value={form.lastRegistrationDate}
              onChange={(e) =>
                setForm({ ...form, lastRegistrationDate: e.target.value })
              }
            />

            <input
              className="input"
              type="number"
              placeholder="Available Slots"
              value={form.availableSlots}
              onChange={(e) =>
                setForm({ ...form, availableSlots: Number(e.target.value) })
              }
            />

            <select
              className="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button className="btn" type="submit">
              Create Campaign
            </button>
          </form>
        </div>
      )}
      

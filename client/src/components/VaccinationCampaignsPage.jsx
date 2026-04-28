import { useEffect, useState } from "react";
import { api } from "../api";

export default function VaccinationCampaignsPage({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [err, setErr] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("");

  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    petId: "",
    petName: "",
    animalType: "Dog",
    ownerPhone: "",
    notes: ""
  });

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
      setErr("");
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

  async function resetVaccinationOffersPage() {
    setErr("");
    setFilterStatus("");
    setFilterSpecies("");
    setSelectedCampaignId(null);
    setBookingForm({
      petId: "",
      petName: "",
      animalType: "Dog",
      ownerPhone: "",
      notes: ""
    });

    try {
      const res = await api.get("/api/vaccination-campaigns");
      setCampaigns(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load campaigns");
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, [filterStatus, filterSpecies]);

  useEffect(() => {
    async function loadMyPets() {
      if (!user) {
        setMyPets([]);
        return;
      }

      try {
        const res = await api.get("/api/pets");
        const ownedPets = (res.data || []).filter((p) => p?.owner?._id === user._id);
        setMyPets(ownedPets);
      } catch {
        setMyPets([]);
      }
    }

    loadMyPets();
  }, [user?._id]);

  async function submitCampaign(e) {
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

  async function submitBooking(e, campaign) {
    e.preventDefault();
    setErr("");

    try {
      await api.post(`/api/vaccination-campaigns/${campaign._id}/book`, {
        ...bookingForm,
        petId: bookingForm.petId || undefined,
        animalType:
          campaign.targetSpecies === "All"
            ? bookingForm.animalType
            : campaign.targetSpecies
      });

      setBookingForm({
        petId: "",
        petName: "",
        animalType: "Dog",
        ownerPhone: "",
        notes: ""
      });
      setSelectedCampaignId(null);
      loadCampaigns();
      alert("Appointment booked successfully");
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Booking failed");
    }
  }

  return (
    <div>
      <div className="card">
        <h2>Vaccination Campaign Offers</h2>

        {err && (
          <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <select
            className="select"
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
          >
            <option value="">All Animals</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>

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

          <button className="btn" onClick={resetVaccinationOffersPage}>
            Refresh
          </button>
        </div>
      </div>

      {user && user.role === "admin" && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Manage Vaccination Campaign</h2>

          <form onSubmit={submitCampaign} style={{ display: "grid", gap: 10 }}>
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

      
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Campaign List</h2>

        {!campaigns.length && <div>No vaccination campaigns found.</div>}

        {campaigns.map((c) => (
          <div
            key={c._id}
            style={{
              padding: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              marginBottom: 14
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18 }}>{c.title}</div>
            <div><strong>Vaccine:</strong> {c.vaccineName}</div>
            <div><strong>Animal:</strong> {c.targetSpecies}</div>
            <div><strong>Location:</strong> {c.location}</div>
            <div><strong>Organizer:</strong> {c.organizer || "N/A"}</div>
            <div><strong>Status:</strong> {c.status}</div>
            <div><strong>Date:</strong> {new Date(c.campaignDate).toLocaleDateString()}</div>
            <div>
              <strong>Last Registration Date:</strong>{" "}
              {c.lastRegistrationDate
                ? new Date(c.lastRegistrationDate).toLocaleDateString()
                : "N/A"}
            </div>
            <div><strong>Available Slots:</strong> {c.availableSlots}</div>
            <div><strong>Description:</strong> {c.description || "N/A"}</div>

            {user &&
              c.status !== "Completed" &&
              c.status !== "Cancelled" &&
              c.availableSlots > 0 && (
                <button
                  className="btn"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setSelectedCampaignId(
                      selectedCampaignId === c._id ? null : c._id
                    );
                    setBookingForm({
                      petId: "",
                      petName: "",
                      animalType:
                        c.targetSpecies === "All" ? "Dog" : c.targetSpecies,
                      ownerPhone: "",
                      notes: ""
                    });
                  }}
                >
                  {selectedCampaignId === c._id ? "Close Booking" : "Book Appointment"}
                </button>
              )}

            {selectedCampaignId === c._id && user && (
              <form
                onSubmit={(e) => submitBooking(e, c)}
                style={{
                  display: "grid",
                  gap: 10,
                  marginTop: 12,
                  padding: 12,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12
                }}
              >
                <select
                  className="select"
                  value={bookingForm.petId}
                  onChange={(e) => {
                    const selectedPetId = e.target.value;
                    const selectedPet = myPets.find((p) => p._id === selectedPetId);
                    setBookingForm({
                      ...bookingForm,
                      petId: selectedPetId,
                      petName: selectedPet ? selectedPet.name : bookingForm.petName,
                      animalType:
                        selectedPet && c.targetSpecies === "All"
                          ? selectedPet.species
                          : bookingForm.animalType
                    });
                  }}
                >
                  <option value="">Select your pet (optional)</option>
                  {myPets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>

                <input
                  className="input"
                  placeholder="Pet Name"
                  value={bookingForm.petName}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, petName: e.target.value })
                  }
                  required
                />

                <select
                  className="select"
                  value={bookingForm.animalType}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, animalType: e.target.value })
                  }
                  disabled={c.targetSpecies !== "All"}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  className="input"
                  placeholder="Owner Phone"
                  value={bookingForm.ownerPhone}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, ownerPhone: e.target.value })
                  }
                />

                <textarea
                  className="textarea"
                  placeholder="Notes"
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, notes: e.target.value })
                  }
                />

                <button className="btn" type="submit">
                  Confirm Booking
                </button>
              </form>
            )}

            {user && user.role === "admin" && (
              <button
                className="btn secondary"
                style={{ marginTop: 10 }}
                onClick={() => removeCampaign(c._id)}
              >
                Delete Campaign
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



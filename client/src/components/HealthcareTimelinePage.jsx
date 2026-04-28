import { useEffect, useState } from "react";
import { api } from "../api";
import Timeline from "./Timeline";

export default function HealthcareTimelinePage({ user }) {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeSection, setActiveSection] = useState(
    user?.role === "admin" ? "pet" : "documents"
  );
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [err, setErr] = useState("");

  const isAdmin = user?.role === "admin";

  async function loadAll() {
    if (!user) return;

    try {
      setErr("");
      const [petsRes, docsRes, bookingsRes] = await Promise.all([
        api.get("/api/pets"),
        api.get("/api/documents/history"),
        api.get("/api/vaccination-campaigns/bookings/history")
      ]);

      const allPets = petsRes.data || [];
      const visiblePets = isAdmin
        ? allPets
        : allPets.filter((p) => p?.owner?._id === user._id);

      setPets(visiblePets);
      setDocuments(docsRes.data || []);
      setBookings(bookingsRes.data || []);

      setSelectedPetId((prev) => {
        if (prev && visiblePets.some((p) => p._id === prev)) return prev;
        return visiblePets[0]?._id || "";
      });
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load healthcare history");
    }
  }

  useEffect(() => {
    loadAll();
  }, [user?._id, user?.role]);

  useEffect(() => {
    if (!isAdmin && activeSection === "pet") {
      setActiveSection("documents");
    }
  }, [isAdmin, activeSection]);

  if (!user) {
    return <div className="card">Please login first.</div>;
  }

  return (
    <div className="card">
      <h2>Healthcare Timeline</h2>
      <div style={{ opacity: 0.85, marginBottom: 12 }}>
        {isAdmin
          ? "Admin view: all users history with section-wise details."
          : "Only Your Pets and Your Pets History ."}
      </div>

      {err && (
        <div className="badge" style={{ background: "rgba(255,0,0,0.15)", marginBottom: 12 }}>
          {err}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        {isAdmin && (
          <button
            className={activeSection === "pet" ? "btn" : "btn secondary"}
            onClick={() => setActiveSection("pet")}
          >
            Pet Timeline
          </button>
        )}
        <button
          className={activeSection === "documents" ? "btn" : "btn secondary"}
          onClick={() => setActiveSection("documents")}
        >
          Documents History
        </button>
        <button
          className={activeSection === "campaigns" ? "btn" : "btn secondary"}
          onClick={() => setActiveSection("campaigns")}
        >
          Vaccination Campaign History
        </button>
        {isAdmin && <button className="btn secondary" onClick={loadAll}>Refresh</button>}
      </div>

      <div style={{ marginBottom: 12, maxWidth: 280 }}>
        <select
          className="input"
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
        </select>
      </div>

      {isAdmin && activeSection === "pet" && (
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <select
              className="input"
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              disabled={!pets.length}
            >
              {!pets.length && <option value="">No pets available</option>}
              {pets
                .filter((p) => speciesFilter === "All" || p.species === speciesFilter)
                .map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.species}){isAdmin ? ` - ${p.owner?.name || "Unknown owner"}` : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedPetId ? (
            <Timeline petId={selectedPetId} canDelete={isAdmin} />
          ) : (
            <div style={{ opacity: 0.8 }}>No pet selected.</div>
          )}
        </div>
      )}

      {activeSection === "documents" && (
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "stretch"
          }}
        >
          {!documents.length && <div>No document history found.</div>}
          {documents
            .filter((doc) =>
              speciesFilter === "All" ? true : doc.pet?.species === speciesFilter
            )
            .map((doc) => (
            <div
              key={doc._id}
              style={{
                padding: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ fontWeight: 800 }}>{doc.title}</div>
                <div>Type: {doc.documentType}</div>
                <div>Status: {doc.status}</div>
                <div>
                  Pet: {doc.pet ? `${doc.pet.name} (${doc.pet.species})` : "No pet linked"}
                </div>
                {isAdmin && (
                  <div>
                    Owner: {doc.owner?.name || "Unknown"} ({doc.owner?.email || "N/A"})
                  </div>
                )}
                <div>
                  Created: {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : "N/A"}
                </div>
                <div>Notes: {doc.notes || "N/A"}</div>
              </div>
              {isAdmin && (
                <button
                  className="btn secondary"
                  style={{ marginTop: 10 }}
                  onClick={async () => {
                    try {
                      await api.delete(`/api/documents/${doc._id}`);
                      await loadAll();
                    } catch (e) {
                      setErr(e?.response?.data?.message || "Failed to delete document");
                    }
                  }}
                >
                  Delete Document
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSection === "campaigns" && (
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "stretch"
          }}
        >
          {!bookings.length && <div>No vaccination campaign bookings history found.</div>}
          {bookings
            .filter((booking) => speciesFilter === "All" || booking.animalType === speciesFilter)
            .map((booking) => (
            <div
              key={booking._id}
              style={{
                padding: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                minHeight: 220,
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div style={{ fontWeight: 800 }}>
                {booking.campaign?.title || "Campaign removed"}
              </div>
              <div>Pet Name: {booking.petName}</div>
              <div>Animal Type: {booking.animalType}</div>
              <div>Status: {booking.bookingStatus}</div>
              <div>Campaign Date: {booking.campaign?.campaignDate ? new Date(booking.campaign.campaignDate).toLocaleDateString() : "N/A"}</div>
              {isAdmin && (
                <div>
                  User: {booking.user?.name || "Unknown"} ({booking.user?.email || "N/A"})
                </div>
              )}
              <div>
                Booked At: {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "N/A"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

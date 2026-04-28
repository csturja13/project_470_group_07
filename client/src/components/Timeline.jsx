import { useEffect, useState } from "react";
import { api } from "../api";

export default function Timeline({ petId, canDelete = true }) {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadTimeline() {
    if (!petId) return;

    try {
      setError("");
      const res = await api.get(`/api/timeline/${petId}`);
      setEvents(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Failed to load timeline");
    }
  }

  useEffect(() => {
    if (!petId) return;
    loadTimeline();
  }, [petId]);

  async function handleDelete(id) {
    try {
      setBusyId(id);
      await api.delete(`/api/timeline/${id}`);
      await loadTimeline();
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Failed to delete timeline event");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <h2>Pet Health Timeline</h2>
      {error && <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>{error}</div>}
      {!error && !events.length && <div style={{ opacity: 0.8 }}>No timeline events yet.</div>}
      {events.map((e) => (
        <div key={e._id} style={{ borderBottom: "1px solid gray", paddingBottom: 10, marginBottom: 10 }}>
          <p><b>{e.title}</b></p>
          <p>{e.description}</p>
          <p>{new Date(e.date).toLocaleDateString()}</p>
          {canDelete && (
            <button
              className="btn secondary"
              onClick={() => handleDelete(e._id)}
              disabled={busyId === e._id}
              style={{ padding: "7px 12px", fontSize: 13 }}
            >
              {busyId === e._id ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}



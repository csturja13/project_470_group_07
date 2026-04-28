import { useEffect, useState } from "react";
import { api } from "../api";

export default function Notifications({ userId }) {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    async function loadNotifications() {
      try {
        setError("");
        const res = await api.get(`/api/notifications/${userId}`);
        setNotes(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load notifications");
      }
    }

    loadNotifications();
  }, [userId]);

  return (
    <div>
      <h2>Notifications</h2>
      {error && <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>{error}</div>}
      {!error && !notes.length && <div style={{ opacity: 0.8 }}>No notifications yet.</div>}
      {notes.map((n) => (
        <div key={n._id}>
          <p>{n.message}</p>
          <small>{n.isRead ? "Read" : "Unread"}</small>
        </div>
      ))}
    </div>
  );
}



import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications({ userId }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    axios.get(`/api/notifications/${userId}`)
      .then(res => setNotes(res.data));
  }, [userId]);

  return (
    <div>
      <h2>Notifications</h2>
      {notes.map(n => (
        <div key={n._id}>
          <p>{n.message}</p>
          <small>{n.isRead ? "Read" : "Unread"}</small>
        </div>
      ))}
    </div>
  );
}

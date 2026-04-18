import { useEffect, useState } from "react";
import axios from "axios";

export default function Timeline({ petId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`/api/timeline/${petId}`)
      .then(res => setEvents(res.data));
  }, [petId]);

  return (
    <div>
      <h2>Pet Health Timeline</h2>
      {events.map(e => (
        <div key={e._id} style={{ borderBottom: "1px solid gray" }}>
          <p><b>{e.title}</b></p>
          <p>{e.description}</p>
          <p>{new Date(e.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
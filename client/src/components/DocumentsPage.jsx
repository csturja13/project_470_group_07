import { useEffect, useState } from "react";
import { api } from "../api";

export default function DocumentsPage({ user }) {
  const [documents, setDocuments] = useState([]);
  const [pets, setPets] = useState([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    pet: "",
    title: "",
    documentType: "ownership",
    documentNumber: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    notes: ""
  });

  async function loadDocuments() {
    try {
      const res = await api.get("/api/documents/mine");
      setDocuments(res.data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load documents");
    }
  }

  async function loadPets() {
    try {
      const res = await api.get("/api/pets");
      setPets(res.data || []);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadPets();
    }
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/api/documents", form);
      setForm({
        pet: "",
        title: "",
        documentType: "ownership",
        documentNumber: "",
        issuedBy: "",
        issueDate: "",
        expiryDate: "",
        notes: ""
      });
      loadDocuments();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to create document");
    }
  }

  async function removeDocument(id) {
    try {
      await api.delete(`/api/documents/${id}`);
      loadDocuments();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete document");
    }
  }

  if (!user) {
    return <div className="card">Please login first.</div>;
  }

  return (
    <div>
      <div className="card" style={{ maxWidth: 700 }}>
        <h2>Owner Documentation</h2>
        {err && (
          <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
            {err}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <select
            className="input"
            value={form.pet}
            onChange={(e) => setForm({ ...form, pet: e.target.value })}
          >
            <option value="">No Pet Selected</option>
            {pets.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.species})
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Document Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <select
            className="input"
            value={form.documentType}
            onChange={(e) => setForm({ ...form, documentType: e.target.value })}
          >
            <option value="ownership">Ownership</option>
            <option value="medical">Medical</option>
            <option value="vaccination">Vaccination</option>
            <option value="adoption">Adoption</option>
            <option value="identity">Identity</option>
            <option value="other">Other</option>
          </select>

          <input
            className="input"
            placeholder="Document Number"
            value={form.documentNumber}
            onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
          />

          <input
            className="input"
            placeholder="Issued By"
            value={form.issuedBy}
            onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
          />

          <input
            className="input"
            type="date"
            value={form.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
          />

          <input
            className="input"
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
          />

          <textarea
            className="input"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <button className="btn" type="submit">
            Save Document
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>My Documents</h2>

        {!documents.length && <div>No documents added yet.</div>}

        {documents.map((doc) => (
          <div
            key={doc._id}
            style={{
              padding: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              marginBottom: 12
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18 }}>{doc.title}</div>
            <div>Type: {doc.documentType}</div>
            <div>Status: {doc.status}</div>
            <div>Document No: {doc.documentNumber || "N/A"}</div>
            <div>Issued By: {doc.issuedBy || "N/A"}</div>
            <div>
              Pet: {doc.pet ? `${doc.pet.name} (${doc.pet.species})` : "No pet linked"}
            </div>
            <div>
              Issue Date: {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : "N/A"}
            </div>
            <div>
              Expiry Date: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "N/A"}
            </div>
            <div>Notes: {doc.notes || "N/A"}</div>

            <button
              className="btn secondary"
              style={{ marginTop: 10 }}
              onClick={() => removeDocument(doc._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
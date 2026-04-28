import { useEffect, useState } from "react";
import { api } from "../api";

export default function DocumentsPage({ user }) {
  const [documents, setDocuments] = useState([]);
  const [err, setErr] = useState("");
  const [signaturePreview, setSignaturePreview] = useState("");
  const [form, setForm] = useState({
    title: "",
    fullName: "",
    residentialAddress: "",
    contactNumber: "",
    emailAddress: "",
    petType: "Dog",
    ownerSignature: "",
    specialtyDocuments: "",
    documentType: "ownership",
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

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      await api.post("/api/documents", form);
      setForm({
        title: "",
        fullName: "",
        residentialAddress: "",
        contactNumber: "",
        emailAddress: "",
        petType: "Dog",
        ownerSignature: "",
        specialtyDocuments: "",
        documentType: "ownership",
        notes: ""
      });
      setSignaturePreview("");
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

  const uniformFieldStyle = {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    minHeight: 64,
    margin: 0,
    boxSizing: "border-box"
  };

  async function onSignatureChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setSignaturePreview("");
      setForm((prev) => ({ ...prev, ownerSignature: "" }));
      return;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setSignaturePreview(dataUrl);
    setForm((prev) => ({ ...prev, ownerSignature: dataUrl }));
  }

  return (
    <div>
      <div className="card" style={{ maxWidth: 700, overflow: "hidden" }}>
        <h2>Owner Documentation</h2>
        {err && (
          <div className="badge" style={{ background: "rgba(255,0,0,0.15)" }}>
            {err}
          </div>
        )}

        <form
          onSubmit={submit}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 10,
            marginTop: 12,
            width: "100%",
            maxWidth: "100%"
          }}
        >
          <select
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            style={uniformFieldStyle}
          >
            <option value="">Select Document Title</option>
            <option value="Pet Description">Pet Description</option>
            <option value="Registration Papers">Registration Papers</option>
            <option value="Veterinary Inspection">Veterinary Inspection</option>
          </select>

          <input
            className="input"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            style={uniformFieldStyle}
          />

          <textarea
            className="input"
            placeholder="Residential Address (city, country, postal code)"
            value={form.residentialAddress}
            onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })}
            required
            style={uniformFieldStyle}
          />

          <input
            className="input"
            placeholder="Contact Number"
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
            required
            style={uniformFieldStyle}
          />

          <input
            className="input"
            type="email"
            placeholder="Email Address"
            value={form.emailAddress}
            onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
            required
            style={uniformFieldStyle}
          />

          <select
            className="input"
            value={form.petType}
            onChange={(e) => setForm({ ...form, petType: e.target.value })}
            style={uniformFieldStyle}
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Bird">Bird</option>
            <option value="Other">Other</option>
          </select>

          <div style={{ opacity: 0.9, fontSize: 13, marginTop: 2 }}>Owner&apos;s Signature (Upload)</div>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={onSignatureChange}
            style={uniformFieldStyle}
          />
          {signaturePreview && (
            <img
              src={signaturePreview}
              alt="Signature preview"
              style={{ maxWidth: 220, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }}
            />
          )}

          <textarea
            className="input"
            placeholder='Specialty Documents: Rental Agreements (something special about your pet personality)'
            value={form.specialtyDocuments}
            onChange={(e) => setForm({ ...form, specialtyDocuments: e.target.value })}
            style={{ ...uniformFieldStyle, minHeight: 90, resize: "vertical" }}
          />

          <textarea
            className="input"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            style={{ ...uniformFieldStyle, minHeight: 110, resize: "vertical" }}
          />

          <button className="btn" type="submit" style={uniformFieldStyle}>
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
            <div>Full Name: {doc.fullName || "N/A"}</div>
            <div>Residential Address: {doc.residentialAddress || "N/A"}</div>
            <div>Contact Number: {doc.contactNumber || "N/A"}</div>
            <div>Email Address: {doc.emailAddress || "N/A"}</div>
            <div>Pet Type: {doc.petType || "N/A"}</div>
            <div>Type: {doc.documentType || "N/A"}</div>
            <div>Status: {doc.status}</div>
            <div>
              Issue Date: {doc.issueDate ? new Date(doc.issueDate).toLocaleString() : "N/A"}
            </div>
            <div>Specialty Documents: {doc.specialtyDocuments || "N/A"}</div>
            {doc.ownerSignature && (
              <div style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 6 }}>Owner Signature:</div>
                <img
                  src={doc.ownerSignature}
                  alt="Owner signature"
                  style={{ maxWidth: 220, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }}
                />
              </div>
            )}
            <div>Notes: {doc.notes || "N/A"}</div>

            {user?.role === "admin" ? (
              <button
                className="btn secondary"
                style={{ marginTop: 10 }}
                onClick={() => removeDocument(doc._id)}
              >
                Delete
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
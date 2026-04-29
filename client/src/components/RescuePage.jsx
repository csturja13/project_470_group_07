import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker1x from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow
});

const defaultCenter = { lat: 23.8103, lng: 90.4125 };

function fmtDistance(km) {
  if (km === null || km === undefined || Number.isNaN(km)) return "N/A";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(2)} km`;
}

export default function RescuePage({ user }) {
  const [accessRole, setAccessRole] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Needs Help",
    lat: "",
    lng: "",
    address: ""
  });
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState("Open");
  const [radiusKm, setRadiusKm] = useState(25);
  const [center, setCenter] = useState(defaultCenter);
  const [routePoints, setRoutePoints] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [allRescuerRequests, setAllRescuerRequests] = useState([]);

  const selected = useMemo(
    () => requests.find((r) => r._id === selectedId) || null,
    [requests, selectedId]
  );
  const isRequesterView = accessRole === "requester";
  const isRescuerView = accessRole === "rescuer";
  const visibleRescuerRequests = useMemo(() => {
    if (!isRescuerView) return requests;
    if (statusFilter === "All") return allRescuerRequests;
    if (statusFilter === "Open") {
      // Keep active jobs visible: newly taken requests become In Progress.
      return allRescuerRequests.filter(
        (r) => r.status === "Open" || r.status === "In Progress"
      );
    }
    return allRescuerRequests.filter((r) => r.status === statusFilter);
  }, [isRescuerView, requests, allRescuerRequests, statusFilter]);

  const mapRequests = useMemo(
    () => visibleRescuerRequests.filter((r) => r.status !== "Resolved"),
    [visibleRescuerRequests]
  );

  async function loadRequests() {
    if (!user || !accessRole) return;
    setLoading(true);
    setErr("");
    try {
      const res = isRequesterView
        ? await api.get("/api/rescue/mine")
        : await api.get("/api/rescue", {
            params: {
              status: "All",
              lat: center.lat,
              lng: center.lng,
              radiusKm
            }
          });

      if (isRequesterView) {
        setRequests(res.data);
      } else {
        setAllRescuerRequests(res.data);
      }

      const nextVisible = isRequesterView
        ? res.data
        : (statusFilter === "All"
            ? res.data
            : statusFilter === "Open"
              ? res.data.filter((r) => r.status === "Open" || r.status === "In Progress")
              : res.data.filter((r) => r.status === statusFilter));
      setRequests(nextVisible);

      if (selectedId && !nextVisible.some((r) => r._id === selectedId)) {
        setSelectedId("");
        setRoutePoints([]);
      }
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load rescue requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, [user, accessRole, isRequesterView, statusFilter, radiusKm, center.lat, center.lng]);

  // Near real-time refresh.
  useEffect(() => {
    if (!user || !accessRole) return undefined;
    const timer = setInterval(loadRequests, 10000);
    return () => clearInterval(timer);
  }, [user, accessRole, isRequesterView, statusFilter, radiusKm, center.lat, center.lng]);

  useEffect(() => {
    setSelectedId("");
    setRoutePoints([]);
  }, [accessRole]);

  async function useCurrentLocationForCenter() {
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nextCenter = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        };
        setCenter(nextCenter);
      },
      () => setErr("Unable to get your location")
    );
  }

  async function useCurrentLocationForForm() {
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6))
        }));
      },
      () => setErr("Unable to get your location")
    );
  }

  async function submitRequest(e) {
    e.preventDefault();
    if (!isRequesterView) return;
    setErr("");
    setMsg("");
    try {
      await api.post("/api/rescue", form);
      setMsg("Rescue request posted successfully.");
      setForm({
        title: "",
        description: "",
        category: "Needs Help",
        lat: "",
        lng: "",
        address: ""
      });
      await loadRequests();
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Failed to post rescue request");
    }
  }

  async function assignRequest(id) {
    if (!isRescuerView) return;
    setErr("");
    setMsg("");
    try {
      await api.patch(`/api/rescue/${id}/assign`);
      setMsg("Request assigned to you.");
      await loadRequests();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to assign request");
    }
  }

  async function updateStatus(id, status) {
    if (!isRescuerView) return;
    setErr("");
    setMsg("");
    try {
      await api.patch(`/api/rescue/${id}/status`, { status });
      setMsg(`Status updated to ${status}.`);
      await loadRequests();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update status");
    }
  }

  async function buildRoutePreview(request) {
    if (!isRescuerView) return;
    setSelectedId(request._id);
    setRoutePoints([]);
    const from = `${center.lng},${center.lat}`;
    const to = `${request.location.lng},${request.location.lat}`;

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`
      );
      if (!res.ok) throw new Error("Routing failed");
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates || [];
      if (!coords.length) throw new Error("No route found");
      setRoutePoints(coords.map(([lng, lat]) => [lat, lng]));
    } catch {
      // Fallback to straight line path if routing service is unavailable.
      setRoutePoints([
        [center.lat, center.lng],
        [request.location.lat, request.location.lng]
      ]);
    }
  }

  async function deleteRequest(id) {
    if (!isRequesterView) return;
    setErr("");
    setMsg("");
    try {
      await api.delete(`/api/rescue/${id}`);
      setMsg("Rescue request removed.");
      await loadRequests();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to remove rescue request");
    }
  }

  if (!user) return <div className="card">Please login to access rescue system.</div>;
  if (!accessRole) {
    return (
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Rescue System Entry</h2>
        <div style={{ opacity: 0.9 }}>
          Choose how you want to enter this page.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={() => setAccessRole("requester")}>Enter as Requester</button>
          <button className="btn" onClick={() => setAccessRole("rescuer")}>Enter as Rescuer</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h2>Rescue System</h2>
        <div style={{ opacity: 0.9 }}>
          {isRequesterView
            ? "Requester mode: post rescue alerts and manage your own untaken requests."
            : "Rescuer mode: view hotspots, preview routes, and complete assigned rescues."}
        </div>
        <div style={{ marginTop: 10 }}>
          <button className="btn secondary" onClick={() => setAccessRole("")}>Switch Entry Role</button>
        </div>
        {err && <div className="badge" style={{ marginTop: 10, background: "rgba(255,0,0,0.15)" }}>{err}</div>}
        {msg && <div className="badge" style={{ marginTop: 10, background: "rgba(0,255,120,0.15)" }}>{msg}</div>}
      </div>

      {isRescuerView && (
        <div className="card">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn" onClick={useCurrentLocationForCenter}>Use My Location as Rescue Center</button>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 220 }}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="All">All</option>
            </select>
            <input
              className="input"
              type="number"
              min={1}
              max={200}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value) || 25)}
              style={{ maxWidth: 180 }}
              placeholder="Radius km"
            />
            {loading && <span style={{ opacity: 0.8 }}>Loading requests...</span>}
          </div>
        </div>
      )}

      {isRequesterView && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Post Rescue Request</h3>
          <form onSubmit={submitRequest} style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Short title (e.g. Injured dog near market)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="input"
            rows={4}
            placeholder="Describe situation and urgency"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <select
            className="select"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="Needs Help">Needs Help</option>
            <option value="Distress">Distress</option>
            <option value="Wounded">Wounded</option>
          </select>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="input"
              type="number"
              step="any"
              placeholder="Latitude"
              value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              step="any"
              placeholder="Longitude"
              value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              required
            />
          </div>
          <input
            className="input"
            placeholder="Address or nearby landmark"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn" type="button" onClick={useCurrentLocationForForm}>Use My Current Coordinates</button>
            <button className="btn" type="submit">Post Rescue Alert</button>
          </div>
          </form>
        </div>
      )}

      {isRescuerView && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Rescue Hotspots Map</h3>
          <div style={{ height: 460, borderRadius: 14, overflow: "hidden" }}>
            <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[center.lat, center.lng]}>
                <Popup>Rescue center / your location</Popup>
              </Marker>

              {mapRequests.map((r) => (
                <Circle
                  key={r._id}
                  center={[r.location.lat, r.location.lng]}
                  radius={130}
                  pathOptions={{
                    color: r.assignedRescuer ? "#22c55e" : "red",
                    fillColor: r.assignedRescuer ? "#22c55e" : "red",
                    fillOpacity: 0.34
                  }}
                  eventHandlers={{ click: () => buildRoutePreview(r) }}
                >
                  <Popup>
                    <div style={{ display: "grid", gap: 6, minWidth: 180 }}>
                      <b>{r.title}</b>
                      <span>Status: {r.status}</span>
                      <span>Distance: {fmtDistance(r.distanceKm)}</span>
                      {isRescuerView &&
                        r.postedBy?._id !== user?._id &&
                        r.status !== "Resolved" &&
                        !r.assignedRescuer && (
                        <button
                          className="btn"
                          onClick={() => assignRequest(r._id)}
                          style={{ width: "100%" }}
                        >
                          Take Rescue
                        </button>
                      )}
                      {isRescuerView && r.assignedRescuer && (
                        <span style={{ opacity: 0.85 }}>
                          Taken by: {r.assignedRescuer?.name || "Another rescuer"}
                        </span>
                      )}
                      {isRescuerView &&
                        r.assignedRescuer?._id === user?._id &&
                        r.status !== "Resolved" && (
                        <button
                          className="btn secondary"
                          onClick={() => updateStatus(r._id, "Resolved")}
                          style={{ width: "100%" }}
                        >
                          Mark Finished
                        </button>
                      )}
                    </div>
                  </Popup>
                </Circle>
              ))}

              {selected && (
                <Marker position={[selected.location.lat, selected.location.lng]}>
                  <Popup>{selected.title}</Popup>
                </Marker>
              )}

              {routePoints.length > 1 && (
                <Polyline positions={routePoints} pathOptions={{ color: "#22c55e", weight: 5 }} />
              )}
            </MapContainer>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>{isRequesterView ? "Rescue Requests" : "Nearby Rescue Requests"}</h3>
        {!visibleRescuerRequests.length && <div style={{ opacity: 0.8 }}>No rescue requests found in selected area.</div>}
        <div style={{ display: "grid", gap: 10 }}>
          {visibleRescuerRequests.map((r) => {
            const assignedToMe = r.assignedRescuer?._id === user._id;
            const postedByMe = r.postedBy?._id === user._id;
            const canRequesterRemove = postedByMe && !r.assignedRescuer;
            const canTakeRequest =
              isRescuerView && !postedByMe && r.status !== "Resolved" && !r.assignedRescuer;
            return (
              <div key={r._id} className="badge" style={{ borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <b>{r.title}</b>
                  <span>Distance: {fmtDistance(r.distanceKm)}</span>
                </div>
                <div style={{ marginTop: 4 }}>{r.description}</div>
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Category: {r.category} | Status: {r.status}
                </div>
                <div style={{ marginTop: 4, opacity: 0.9 }}>
                  Posted by: {r.postedBy?.name || "Unknown"} | Address: {r.location?.address || "N/A"}
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isRescuerView && <button className="btn" onClick={() => buildRoutePreview(r)}>Preview Path</button>}

                  {canTakeRequest && (
                    <button className="btn" onClick={() => assignRequest(r._id)}>Take Request</button>
                  )}

                  {isRescuerView && assignedToMe && (
                    <>
                      <button className="btn" onClick={() => updateStatus(r._id, "In Progress")}>Set In Progress</button>
                      <button className="btn secondary" onClick={() => updateStatus(r._id, "Resolved")}>Mark Resolved</button>
                    </>
                  )}

                  {isRequesterView && canRequesterRemove && (
                    <button className="btn secondary" onClick={() => deleteRequest(r._id)}>Remove Request</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

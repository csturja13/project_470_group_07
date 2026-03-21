import { api } from "../api";

export default function useAdoptPet() {
  async function requestAdoption(petId) {
    const ok = window.confirm("Send adoption request?");
    if (!ok) return;

    try {
      await api.post(`/api/pets/${petId}/adopt-request`);
      alert("Adoption request sent successfully");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to send request");
    }
  }

  return requestAdoption;
}
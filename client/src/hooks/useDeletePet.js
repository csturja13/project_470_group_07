import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function useDeletePet(onRefresh) {
  const nav = useNavigate();

  async function deletePet(id) {
    const ok = window.confirm("Are you sure you want to delete this pet post?");
    if (!ok) return;

    try {
      await api.delete(`/api/pets/${id}`);
      onRefresh?.();
      alert("Pet post deleted successfully");
      nav("/");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete pet post");
    }
  }

  return deletePet;
}
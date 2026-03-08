import axios from "axios";

export const API = "http://localhost:5000";

export const api = axios.create({
  baseURL: API
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
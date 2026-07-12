import axios from "axios";

const rawBase = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:3000";
// Normalize: remove trailing slash, then always append /api/v1 if not already present
const normalizedBase = rawBase.replace(/\/$/, "");
const baseURL = normalizedBase.endsWith("/api/v1")
  ? normalizedBase
  : `${normalizedBase}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

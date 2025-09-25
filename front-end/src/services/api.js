import axios from "axios";

// Pick base URL from Vite env variable (frontend .env)
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ Create an Axios instance — do NOT add extra /api here
const api = axios.create({
  baseURL: BASE_URL, // already includes /api in .env if needed
  withCredentials: true, // required if using session cookies
});

// ✅ Add Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Export Axios instance
export default api;

// ✅ Signup function — relative to baseURL
export const signup = async (data) => {
  const res = await api.post("/users/signup", data); // correct route
  return res.data;
};

// ✅ Login function — relative to baseURL
export const login = async (data) => {
  const res = await api.post("/users/login", data); // correct route
  return res.data;
};

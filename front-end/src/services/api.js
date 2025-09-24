// src/services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,  // ✅ only once
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Signup / Login
export const signup = async (data) => {
  const res = await api.post("/users/signup", data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

import axios from "axios";

// Pick base URL from Vite env variable
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // required for cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const signup = async (data) => {
  const res = await api.post("/users/signup", data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

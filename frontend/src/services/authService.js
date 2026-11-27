import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

const getErr = (e) => {
  if (e.response?.data?.message) return e.response.data.message;
  if (e.message === "Network Error") return "Cannot connect to backend. Make sure the server is running.";
  return e.message || "Unexpected error.";
};

export const registerWithEmail = async (fullName, email, password) => {
  try {
    const res = await api.post("/auth/register", { fullName, email, password });
    return res.data;
  } catch (e) { throw new Error(getErr(e)); }
};

export const loginWithEmail = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (e) { throw new Error(getErr(e)); }
};

export const fetchMe = async (token) => {
  try {
    const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) { throw new Error(getErr(e)); }
};

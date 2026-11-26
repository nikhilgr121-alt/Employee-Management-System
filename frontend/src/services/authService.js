import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const getError = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === "Network Error")
    return "Cannot connect to server. Make sure the backend is running.";
  return error.message || "An unexpected error occurred.";
};

export const registerWithEmail = async (fullName, email, password) => {
  try {
    const res = await apiClient.post("/auth/register", { fullName, email, password });
    return res.data;
  } catch (e) {
    throw new Error(getError(e));
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data;
  } catch (e) {
    throw new Error(getError(e));
  }
};

export const loginWithGoogle = async (payload) => {
  try {
    const body = typeof payload === "string" ? { credential: payload } : payload;
    const res = await apiClient.post("/auth/google", body);
    return res.data;
  } catch (e) {
    throw new Error(getError(e));
  }
};

export const sendOTP = async (phone) => {
  try {
    const res = await apiClient.post("/auth/phone/send-otp", { phone });
    return res.data;
  } catch (e) {
    throw new Error(getError(e));
  }
};

export const verifyOTP = async (phone, otp, fullName) => {
  try {
    const res = await apiClient.post("/auth/phone/verify-otp", { phone, otp, fullName });
    return res.data;
  } catch (e) {
    throw new Error(getError(e));
  }
};

export const fetchMe = async (token) => {
  try {
    const res = await apiClient.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (e) {
    throw new Error(getError(e));
  }
};

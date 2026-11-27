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

export const checkHealth = async () => {
  try { const res = await api.get("/health"); return res.data; }
  catch (e) { throw new Error(getErr(e)); }
};

export const getEmployees = async () => {
  try { const res = await api.get("/employees"); return res.data.data; }
  catch (e) { throw new Error(getErr(e)); }
};

export const createEmployee = async (data) => {
  try { const res = await api.post("/employees", data); return res.data; }
  catch (e) { throw new Error(getErr(e)); }
};

export const updateEmployee = async (id, data) => {
  try { const res = await api.put(`/employees/${id}`, data); return res.data; }
  catch (e) { throw new Error(getErr(e)); }
};

export const deleteEmployee = async (id) => {
  try { const res = await api.delete(`/employees/${id}`); return res.data; }
  catch (e) { throw new Error(getErr(e)); }
};

export const bulkDeleteEmployees = async (ids) => {
  try { const res = await api.post("/employees/bulk-delete", { ids }); return res.data; }
  catch (e) { throw new Error(getErr(e)); }
};

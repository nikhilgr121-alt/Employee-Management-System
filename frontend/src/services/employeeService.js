import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Extracts a clean, readable error message from an Axios error response.
 */
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message === "Network Error") {
    return "Cannot connect to backend server. Make sure the Node.js server is running on port 5000.";
  }
  return error.message || "An unexpected error occurred.";
};

export const checkHealth = async () => {
  try {
    const response = await apiClient.get("/health");
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getEmployees = async (params = {}) => {
  try {
    const response = await apiClient.get("/employees", { params });
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getEmployeeById = async (id) => {
  try {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const response = await apiClient.post("/employees", employeeData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const bulkDeleteEmployees = async (ids) => {
  try {
    const response = await apiClient.post("/employees/bulk-delete", { ids });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

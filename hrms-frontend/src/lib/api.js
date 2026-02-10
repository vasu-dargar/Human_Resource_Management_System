import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

export function normalizeError(err) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.details) return "Validation failed.";
  return err.message || "Something went wrong.";
}
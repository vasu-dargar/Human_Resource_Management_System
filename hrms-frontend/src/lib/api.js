import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // no timeout -> axios default is unlimited
});

export function normalizeError(err) {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.data?.details) return "Request failed.";
  return "Request failed.";
}
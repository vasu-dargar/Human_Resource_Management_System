import axios from "axios";

console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export function normalizeError(err) {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  if (err?.response?.data?.details) {
    // show first validation message
    const d = err.response.data.details;
    if (typeof d === "string") return d;
    if (typeof d === "object") {
      const firstKey = Object.keys(d)[0];
      if (firstKey) return d[firstKey][0];
    }
  }

  // network / unexpected errors
  if (err?.message === "Network Error") {
    return "Unable to reach server.";
  }

  // fallback: return empty so UI shows nothing
  return "";
}
import axios from "axios";
import { API_BASE } from "../config";
import { getItem, TOKEN_KEY } from "./storage";

export { API_BASE };

// AuthContext registers a handler so a hard 401 can clear the session and
// bounce to the login stack — the RN equivalent of the web's redirect.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Inject JWT bearer token on every request (read async from secure storage).
client.interceptors.request.use(async (config) => {
  const token = await getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface a clean error message and handle auth expiry.
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      onUnauthorized?.();
    }
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export default client;

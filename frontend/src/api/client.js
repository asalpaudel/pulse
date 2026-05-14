import axios from "axios";

export const API_BASE = "http://localhost:8080";

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

// Inject JWT bearer token on every request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("pulse_token");
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
      // Token invalid/expired — clear and bounce to login.
      const onAuthPage = ["/login", "/register"].includes(
        window.location.pathname,
      );
      if (!onAuthPage) {
        localStorage.removeItem("pulse_token");
        localStorage.removeItem("pulse_user");
        window.location.assign("/login");
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

export default client;

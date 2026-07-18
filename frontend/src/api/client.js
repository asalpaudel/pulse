import axios from "axios";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  withXSRFToken: true,
});

let csrfRequest;
const SAFE_METHODS = new Set(["get", "head", "options"]);

async function ensureCsrfToken() {
  if (document.cookie.split("; ").some((item) => item.startsWith("XSRF-TOKEN="))) return;
  if (!csrfRequest) {
    csrfRequest = axios.get(`${API_BASE}/api/auth/csrf`, { withCredentials: true })
      .finally(() => { csrfRequest = null; });
  }
  await csrfRequest;
}

// Inject JWT bearer token on every request.
client.interceptors.request.use(async (config) => {
  if (!SAFE_METHODS.has((config.method || "get").toLowerCase()) && !config.headers.Authorization) {
    await ensureCsrfToken();
  }
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
    if (status === 401 && !error.config?.skipAuthRedirect) {
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

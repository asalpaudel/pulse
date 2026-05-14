import client from "./client";

// POST /api/auth/register — { email, password, role, profile{...} }
export const register = (payload) =>
  client.post("/auth/register", payload).then((r) => r.data);

// POST /api/auth/login — { email, password }
export const login = (payload) =>
  client.post("/auth/login", payload).then((r) => r.data);

// GET /api/auth/me — current User + profile
export const getMe = () => client.get("/auth/me").then((r) => r.data);

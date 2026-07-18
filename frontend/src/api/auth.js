import client from "./client";

// POST /api/auth/register — { email, password, role, profile{...} }
export const register = (payload) =>
  client.post("/auth/register", payload).then((r) => r.data);

export const verifyEmail = (payload) =>
  client.post("/auth/verify-email", payload).then((r) => r.data);

export const resendVerification = (payload) =>
  client.post("/auth/resend-verification", payload);

// POST /api/auth/login — { email, password }
export const login = (payload) =>
  client.post("/auth/session/login", payload).then((r) => r.data);

export const logout = () => client.post("/auth/session/logout");

export const touchSession = () => client.post("/auth/session/touch");

// GET /api/auth/me — current User + profile
export const getMe = () =>
  client.get("/auth/me", { skipAuthRedirect: true }).then((r) => r.data);

import client from "./client";

// GET /api/admin/users?role=&verified=
export const listUsers = ({ role, verified } = {}) =>
  client.get("/admin/users", { params: { role, verified } }).then((r) => r.data);

// PATCH /api/admin/users/{id}/verify
export const verifyUser = (id) =>
  client.patch(`/admin/users/${id}/verify`).then((r) => r.data);

// GET /api/admin/stats
export const getStats = () => client.get("/admin/stats").then((r) => r.data);

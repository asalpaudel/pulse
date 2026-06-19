import client from "./client";

// GET /api/notifications — own only
export const listNotifications = () =>
  client.get("/notifications").then((r) => r.data);

// PATCH /api/notifications/{id}/read
export const markNotificationRead = (id) =>
  client.patch(`/notifications/${id}/read`).then((r) => r.data);

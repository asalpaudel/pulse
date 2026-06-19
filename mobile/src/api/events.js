import client from "./client";

// GET /api/events — list events
export const listEvents = () => client.get("/events").then((r) => r.data);

// GET /api/events/{id}
export const getEvent = (id) =>
  client.get(`/events/${id}`).then((r) => r.data);

// POST /api/events/{id}/join — enroll (DONOR)
export const joinEvent = (id) =>
  client.post(`/events/${id}/join`).then((r) => r.data);

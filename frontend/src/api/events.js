import client from "./client";

// POST /api/events — create event (BLOOD_BANK)
export const createEvent = (payload) =>
  client.post("/events", payload).then((r) => r.data);

// GET /api/events — list events
export const listEvents = () => client.get("/events").then((r) => r.data);

// GET /api/events/{id}
export const getEvent = (id) =>
  client.get(`/events/${id}`).then((r) => r.data);

// POST /api/events/{id}/join — enroll (DONOR)
export const joinEvent = (id) =>
  client.post(`/events/${id}/join`).then((r) => r.data);

// GET /api/events/{id}/enrollments
export const getEventEnrollments = (id) =>
  client.get(`/events/${id}/enrollments`).then((r) => r.data);

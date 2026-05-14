import client from "./client";

// POST /api/requests — create request (HOSPITAL)
export const createRequest = (payload) =>
  client.post("/requests", payload).then((r) => r.data);

// GET /api/requests?status=&mine=
export const listRequests = ({ status, mine } = {}) =>
  client.get("/requests", { params: { status, mine } }).then((r) => r.data);

// GET /api/requests/{id}
export const getRequest = (id) =>
  client.get(`/requests/${id}`).then((r) => r.data);

// PATCH /api/requests/{id}/status — { status }
export const updateRequestStatus = (id, status) =>
  client.patch(`/requests/${id}/status`, { status }).then((r) => r.data);

// POST /api/requests/{id}/respond — donor/bank offers to fulfil
export const respondToRequest = (id) =>
  client.post(`/requests/${id}/respond`).then((r) => r.data);

// GET /api/requests/{id}/responses
export const getRequestResponses = (id) =>
  client.get(`/requests/${id}/responses`).then((r) => r.data);

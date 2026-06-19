import client from "./client";

// GET /api/requests?status=&mine=
export const listRequests = ({ status, mine } = {}) =>
  client.get("/requests", { params: { status, mine } }).then((r) => r.data);

// GET /api/requests/{id}
export const getRequest = (id) =>
  client.get(`/requests/${id}`).then((r) => r.data);

// POST /api/requests/{id}/respond — donor offers to fulfil (no body)
export const respondToRequest = (id) =>
  client.post(`/requests/${id}/respond`).then((r) => r.data);

// GET /api/requests/{id}/responses
export const getRequestResponses = (id) =>
  client.get(`/requests/${id}/responses`).then((r) => r.data);

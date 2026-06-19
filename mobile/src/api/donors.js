import client from "./client";

// GET /api/donors/me
export const getMyDonorProfile = () =>
  client.get("/donors/me").then((r) => r.data);

// PUT /api/donors/me — update profile + availability
export const updateMyDonorProfile = (payload) =>
  client.put("/donors/me", payload).then((r) => r.data);

// GET /api/donors/{id}
export const getDonor = (id) =>
  client.get(`/donors/${id}`).then((r) => r.data);

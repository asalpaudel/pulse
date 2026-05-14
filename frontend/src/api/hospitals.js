import client from "./client";

// GET /api/hospitals/me
export const getMyHospitalProfile = () =>
  client.get("/hospitals/me").then((r) => r.data);

// PUT /api/hospitals/me
export const updateMyHospitalProfile = (payload) =>
  client.put("/hospitals/me", payload).then((r) => r.data);

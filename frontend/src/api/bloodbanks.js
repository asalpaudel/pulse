import client from "./client";

// GET /api/bloodbanks/me
export const getMyBloodBankProfile = () =>
  client.get("/bloodbanks/me").then((r) => r.data);

// PUT /api/bloodbanks/me
export const updateMyBloodBankProfile = (payload) =>
  client.put("/bloodbanks/me", payload).then((r) => r.data);

// GET /api/bloodbanks/search?lat=&lng=&radiusKm=
export const searchBloodBanks = ({ lat, lng, radiusKm }) =>
  client
    .get("/bloodbanks/search", { params: { lat, lng, radiusKm } })
    .then((r) => r.data);

// GET /api/bloodbanks/{id}/stock
export const getBloodBankStock = (id) =>
  client.get(`/bloodbanks/${id}/stock`).then((r) => r.data);

// PUT /api/bloodbanks/me/stock — [{ bloodGroup, units }] upsert
export const updateMyStock = (stockList) =>
  client.put("/bloodbanks/me/stock", stockList).then((r) => r.data);

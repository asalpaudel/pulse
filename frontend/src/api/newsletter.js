import client from "./client";

export const subscribe = (payload) =>
  client.post("/newsletter/subscriptions", payload).then((response) => response.data);

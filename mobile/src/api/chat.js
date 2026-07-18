import client from "./client";

export const listConversations = () =>
  client.get("/chat/conversations").then((r) => r.data);

export const getThread = (requestId, otherUserId) =>
  client
    .get(`/chat/requests/${requestId}/with/${otherUserId}`)
    .then((r) => r.data);

export const sendMessage = (payload) =>
  client.post("/chat/messages", payload).then((r) => r.data);

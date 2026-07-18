import client from "./client";

// GET /api/chat/conversations — my conversation list with unread counts
export const listConversations = () =>
  client.get("/chat/conversations").then((r) => r.data);

// GET /api/chat/requests/{requestId}/with/{otherUserId} — full thread (marks read)
export const getThread = (requestId, otherUserId) =>
  client
    .get(`/chat/requests/${requestId}/with/${otherUserId}`)
    .then((r) => r.data);

// POST /api/chat/messages — { requestId, recipientUserId, content }
export const sendMessage = (payload) =>
  client.post("/chat/messages", payload).then((r) => r.data);

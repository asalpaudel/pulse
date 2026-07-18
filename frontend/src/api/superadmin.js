import client from "./client";

export const getSecurityStatus = () =>
  client.get("/superadmin/security").then((response) => response.data);

export const requestTwoFactorCode = (action) =>
  client.post("/superadmin/security/2fa/code", { action }).then((response) => response.data);

export const confirmTwoFactor = (action, code) =>
  client.post("/superadmin/security/2fa/confirm", { action, code }).then((response) => response.data);

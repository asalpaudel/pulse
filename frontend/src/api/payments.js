import client from "./client";

// POST /api/payments/initiate — { purpose, targetId? }
// Returns { paymentId, transactionUuid, amount, formUrl, fields }
export const initiatePayment = (payload) =>
  client.post("/payments/initiate", payload).then((r) => r.data);

// POST /api/payments/verify — { data?, transactionUuid? }
export const verifyPayment = (payload) =>
  client.post("/payments/verify", payload).then((r) => r.data);

/**
 * Builds a hidden HTML form from an eSewa `InitiateResponse` and submits it,
 * redirecting the browser to the eSewa payment page.
 */
export function submitEsewaForm({ formUrl, fields }) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = formUrl;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import { homePathForRole } from "../../lib/routes";
import * as paymentsApi from "../../api/payments";

/**
 * eSewa redirects here (success_url / failure_url) after checkout with a base64
 * `data` payload on success. We hand it to the backend to verify server-side,
 * which then unlocks the featured placement or moves an ad into review.
 */
export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [state, setState] = useState("verifying"); // verifying | success | failed
  const [detail, setDetail] = useState("");

  useEffect(() => {
    const data = searchParams.get("data");
    const run = async () => {
      try {
        if (!data) {
          setState("failed");
          setDetail("Payment was cancelled or returned no confirmation.");
          return;
        }
        const payment = await paymentsApi.verifyPayment({ data });
        if (payment.status !== "COMPLETE") {
          setState("failed");
          setDetail("The payment did not complete. You have not been charged.");
          return;
        }
        setState("success");
        setDetail(
          payment.purpose === "AD_CAMPAIGN"
            ? "Your ad has been submitted for admin review."
            : "Your featured placement is now active.",
        );
      } catch (err) {
        setState("failed");
        setDetail(err.message || "We couldn't verify this payment.");
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnPath = sessionStorage.getItem("pulse_pay_return") || homePathForRole(role) || "/";
  const goBack = () => {
    sessionStorage.removeItem("pulse_pay_return");
    navigate(returnPath);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded-2xl border border-editorial bg-white p-8 text-center">
        <Logo className="mx-auto h-9 w-9 text-oxblood" />
        {state === "verifying" && (
          <>
            <Loader2 className="mx-auto mt-6 h-10 w-10 animate-spin text-primary" />
            <h1 className="mt-4 font-display text-xl font-semibold text-ink">Verifying payment…</h1>
            <p className="mt-1 text-sm text-neutral-500">Confirming your transaction with eSewa.</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-green-600" />
            <h1 className="mt-4 font-display text-xl font-semibold text-ink">Payment successful</h1>
            <p className="mt-1 text-sm text-neutral-600">{detail}</p>
            <Button className="mt-6 w-full" onClick={goBack}>Continue</Button>
          </>
        )}
        {state === "failed" && (
          <>
            <XCircle className="mx-auto mt-6 h-12 w-12 text-primary" />
            <h1 className="mt-4 font-display text-xl font-semibold text-ink">Payment not completed</h1>
            <p className="mt-1 text-sm text-neutral-600">{detail}</p>
            <Button variant="secondary" className="mt-6 w-full" onClick={goBack}>Go back</Button>
          </>
        )}
      </div>
    </div>
  );
}

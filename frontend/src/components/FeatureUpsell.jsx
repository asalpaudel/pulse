import { useState } from "react";
import { Sparkles, BadgeCheck } from "lucide-react";
import Card, { CardBody } from "./ui/Card";
import Button from "./ui/Button";
import { useToast } from "../context/ToastContext";
import * as paymentsApi from "../api/payments";

const COPY = {
  FEATURED_HOSPITAL: {
    label: "hospital",
    price: 500,
    blurb: "Surface your hospital at the top of search results and in the Featured section for 30 days.",
  },
  FEATURED_BLOOD_BANK: {
    label: "blood bank",
    price: 500,
    blurb: "Rank first when donors and hospitals search — plus a Featured badge for 30 days.",
  },
  FEATURED_EVENT: {
    label: "event",
    price: 300,
    blurb: "Boost this donation drive to nearby donors and pin it in the events feed.",
  },
};

/**
 * Paid "Feature" CTA (Tier 2). Initiates an eSewa payment for the given purpose;
 * once verified the backend flips `featured` on. Shows an active state when already featured.
 */
export default function FeatureUpsell({ purpose, targetId, featured, returnPath }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const copy = COPY[purpose] || {};

  const feature = async () => {
    setBusy(true);
    try {
      if (returnPath) sessionStorage.setItem("pulse_pay_return", returnPath);
      const init = await paymentsApi.initiatePayment({ purpose, targetId });
      toast.info("Redirecting to eSewa…");
      paymentsApi.submitEsewaForm(init);
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  };

  if (featured) {
    return (
      <Card className="rounded-xl border-primary/30 bg-primary-50/40">
        <CardBody className="flex items-center gap-3">
          <BadgeCheck className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-ink">Featured placement active</p>
            <p className="text-sm text-neutral-600">You're currently boosted in search and featured sections.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardBody>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-ink">Get featured</h3>
        </div>
        <p className="mt-2 text-sm text-neutral-600">{copy.blurb}</p>
        <Button className="mt-4 w-full" loading={busy} onClick={feature}>
          Feature this {copy.label || "placement"} for NPR {(copy.price || 0).toLocaleString()} · eSewa
        </Button>
        <p className="mt-2 text-xs leading-relaxed text-neutral-500">
          Promotional placement never changes emergency matching or request priority.
        </p>
        {import.meta.env.DEV && (
          <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wide text-neutral-400">
            Sandbox payment · test card only
          </p>
        )}
      </CardBody>
    </Card>
  );
}

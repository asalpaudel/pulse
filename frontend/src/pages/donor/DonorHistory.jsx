import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as donorsApi from "../../api/donors";
import { formatDate, bloodGroupLabel } from "../../lib/constants";

/**
 * Donation history. The API contract exposes `Donor.lastDonationDate` but no
 * dedicated history-log endpoint, so this page surfaces and lets the donor
 * update their last donation date. (Deviation noted in handover report.)
 */
export default function DonorHistory() {
  const { profile, setProfile } = useAuth();
  const { toast } = useToast();
  const [donor, setDonor] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  // Captured once on mount — avoids calling Date.now() during render.
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await donorsApi.getMyDonorProfile();
        if (!active) return;
        setDonor(me);
        if (me?.lastDonationDate)
          setDate(me.lastDonationDate.slice(0, 10));
      } catch {
        if (donor?.lastDonationDate)
          setDate(donor.lastDonationDate.slice(0, 10));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await donorsApi.updateMyDonorProfile({
        ...donor,
        lastDonationDate: date || null,
      });
      setDonor(updated);
      setProfile(updated);
      toast.success("Donation history updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Eligibility: most guidelines recommend ~3 months (90 days) between donations.
  const { eligible, nextEligible } = useMemo(() => {
    if (!donor?.lastDonationDate) {
      return { eligible: true, nextEligible: null };
    }
    const next = new Date(donor.lastDonationDate);
    next.setDate(next.getDate() + 90);
    return { eligible: mountedAt >= next.getTime(), nextEligible: next };
  }, [donor, mountedAt]);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Donation History"
        subtitle="Track your last donation and eligibility"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Eligibility status" />
          <CardBody>
            <div
              className={`rounded-lg px-4 py-3 ${
                eligible
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-800"
              }`}
            >
              <p className="font-semibold">
                {eligible
                  ? "You're eligible to donate"
                  : "Not yet eligible to donate"}
              </p>
              <p className="mt-1 text-sm">
                {donor?.lastDonationDate
                  ? `Last donation: ${formatDate(donor.lastDonationDate)}`
                  : "No donation recorded yet."}
                {nextEligible &&
                  !eligible &&
                  ` · Next eligible around ${formatDate(nextEligible.toISOString())}`}
              </p>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Blood group</dt>
                <dd className="font-medium text-stone-900">
                  {bloodGroupLabel(donor?.bloodGroup)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Availability</dt>
                <dd className="font-medium text-stone-900">
                  {donor?.available ? "Available" : "Unavailable"}
                </dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Record a donation"
            subtitle="Update your most recent donation date"
          />
          <CardBody>
            <form onSubmit={save} className="space-y-4">
              <Input
                label="Last donation date"
                type="date"
                name="lastDonationDate"
                value={date}
                max={new Date(mountedAt).toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
              />
              <Button type="submit" loading={saving}>
                Save
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

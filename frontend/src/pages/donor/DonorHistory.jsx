import { useEffect, useMemo, useState } from "react";
import { Droplet, HeartPulse, CalendarClock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import StatusCard from "../../components/ui/StatusCard";
import FeatureCard from "../../components/ui/FeatureCard";
import StatCard from "../../components/ui/StatCard";
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
        if (me?.lastDonationDate) setDate(me.lastDonationDate.slice(0, 10));
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

      {/* Stat row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Droplet}
          tone="red"
          label="Blood group"
          value={bloodGroupLabel(donor?.bloodGroup)}
        />
        <StatCard
          icon={CalendarClock}
          tone="blue"
          label="Last donation"
          value={
            donor?.lastDonationDate ? formatDate(donor.lastDonationDate) : "—"
          }
        />
        <StatCard
          icon={HeartPulse}
          tone={eligible ? "green" : "amber"}
          label="Eligibility"
          value={eligible ? "Eligible" : "Resting"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <StatusCard
            tone={eligible ? "green" : "amber"}
            title={
              eligible
                ? "You're eligible to donate"
                : "Not yet eligible to donate"
            }
            description={
              donor?.lastDonationDate
                ? `Last donation: ${formatDate(donor.lastDonationDate)}${
                    nextEligible && !eligible
                      ? ` · Next eligible around ${formatDate(
                          nextEligible.toISOString(),
                        )}`
                      : ""
                  }`
                : "No donation recorded yet — record your most recent donation below."
            }
          />

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

        <FeatureCard
          icon={HeartPulse}
          title="Your Eligibility Status"
          description="Healthy adults can typically donate whole blood every 90 days."
          bullets={[
            "Stay hydrated before and after donating",
            "A balanced, iron-rich diet speeds recovery",
            "We'll alert you the moment you're eligible again",
          ]}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader, { StatCard } from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import RequestCard from "../../components/RequestCard";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as donorsApi from "../../api/donors";
import * as requestsApi from "../../api/requests";
import { bloodGroupLabel, formatDate } from "../../lib/constants";

export default function DonorOverview() {
  const { profile, setProfile } = useAuth();
  const { toast } = useToast();
  const [donor, setDonor] = useState(profile);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [me, reqs] = await Promise.all([
          donorsApi.getMyDonorProfile().catch(() => profile),
          requestsApi.listRequests({ status: "OPEN" }).catch(() => []),
        ]);
        if (!active) return;
        if (me) setDonor(me);
        setRequests(Array.isArray(reqs) ? reqs : []);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAvailability = async () => {
    if (!donor) return;
    setToggling(true);
    try {
      const updated = await donorsApi.updateMyDonorProfile({
        ...donor,
        available: !donor.available,
      });
      setDonor(updated);
      setProfile(updated);
      toast.success(
        updated.available
          ? "You're now available for donation"
          : "You're marked unavailable",
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <Spinner label="Loading your dashboard…" />;

  const matching = requests.filter(
    (r) => !donor?.bloodGroup || r.bloodGroup === donor.bloodGroup,
  );

  return (
    <div>
      <PageHeader
        title={`Welcome${donor?.fullName ? `, ${donor.fullName.split(" ")[0]}` : ""}`}
        subtitle="Your donor dashboard"
      />

      {/* Availability banner */}
      <Card
        className={`mb-6 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center ${
          donor?.available ? "border-emerald-200 bg-emerald-50" : ""
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                donor?.available ? "bg-emerald-500" : "bg-stone-400"
              }`}
            />
            <p className="font-semibold text-stone-900">
              {donor?.available
                ? "You're available to donate"
                : "You're currently unavailable"}
            </p>
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {donor?.available
              ? "You'll receive emergency alerts matched to your blood group and location."
              : "Turn this on to start receiving matched emergency alerts."}
          </p>
        </div>
        <Button
          variant={donor?.available ? "outline" : "primary"}
          onClick={toggleAvailability}
          loading={toggling}
        >
          {donor?.available ? "Go unavailable" : "Go available"}
        </Button>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Blood group"
          value={bloodGroupLabel(donor?.bloodGroup)}
          tone="red"
        />
        <StatCard
          label="Open matching requests"
          value={matching.length}
          tone="amber"
        />
        <StatCard
          label="Last donation"
          value={donor?.lastDonationDate ? formatDate(donor.lastDonationDate) : "—"}
        />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Requests matching your blood group"
            subtitle={`${matching.length} open`}
            action={
              <Link to="/donor/requests">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          <CardBody>
            {matching.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">
                No open requests matching {bloodGroupLabel(donor?.bloodGroup)}{" "}
                right now.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {matching.slice(0, 4).map((r) => (
                  <RequestCard key={r.id} request={r}>
                    <Link to="/donor/requests">
                      <Button size="sm" variant="secondary">
                        Respond
                      </Button>
                    </Link>
                  </RequestCard>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/donor/alerts">
          <Badge tone="red">Emergency alerts feed →</Badge>
        </Link>
        <Link to="/donor/events">
          <Badge tone="blue">Browse donation events →</Badge>
        </Link>
      </div>
    </div>
  );
}

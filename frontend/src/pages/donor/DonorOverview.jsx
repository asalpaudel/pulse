import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplet,
  MapPin,
  CalendarClock,
  HeartPulse,
  Bell,
  ShieldCheck,
  CalendarDays,
  Activity,
} from "lucide-react";
import HeroCard from "../../components/ui/HeroCard";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody } from "../../components/ui/Card";
import StatusCard from "../../components/ui/StatusCard";
import FeatureCard from "../../components/ui/FeatureCard";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/Spinner";
import RequestCard from "../../components/RequestCard";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationsContext";
import * as donorsApi from "../../api/donors";
import * as requestsApi from "../../api/requests";
import { bloodGroupLabel, formatDate } from "../../lib/constants";

export default function DonorOverview() {
  const { profile, setProfile } = useAuth();
  const { toast } = useToast();
  const { notifications, unreadCount } = useNotifications();
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
  const urgent = matching.filter((r) => r.urgency === "EMERGENCY");
  const firstName = donor?.fullName ? donor.fullName.split(" ")[0] : null;

  const chips = [
    { icon: Droplet, label: bloodGroupLabel(donor?.bloodGroup) },
    {
      icon: MapPin,
      label: donor?.address || "Location not set",
    },
    {
      icon: CalendarClock,
      label: donor?.lastDonationDate
        ? `Last donated ${formatDate(donor.lastDonationDate)}`
        : "No donation recorded",
    },
  ];

  return (
    <div>
      <HeroCard
        greeting={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        subtitle="Here's what's happening across the Pulse network today."
        chips={chips}
        action={
          <Button
            variant={donor?.available ? "outline" : "primary"}
            onClick={toggleAvailability}
            loading={toggling}
          >
            {donor?.available ? "Go unavailable" : "Go available"}
          </Button>
        }
      />

      {/* 4-up stat row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Droplet}
          tone="red"
          label="Blood group"
          value={bloodGroupLabel(donor?.bloodGroup)}
        />
        <StatCard
          icon={Activity}
          tone="amber"
          label="Matching requests"
          value={matching.length}
          hint={`${urgent.length} urgent`}
        />
        <StatCard
          icon={Bell}
          tone="blue"
          label="Unread alerts"
          value={unreadCount}
        />
        <StatCard
          icon={HeartPulse}
          tone={donor?.available ? "green" : "neutral"}
          label="Availability"
          value={donor?.available ? "Active" : "Off"}
        />
      </div>

      {/* Main + right rail */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {/* Urgent blood requests */}
          <section>
            <SectionHeader
              title="Urgent Blood Requests"
              subtitle="Emergency requests matching your blood group"
              to="/donor/requests"
            />
            {urgent.length === 0 ? (
              <Card>
                <EmptyState
                  icon={ShieldCheck}
                  title="No urgent requests right now"
                  message={`There are no emergency requests matching ${bloodGroupLabel(
                    donor?.bloodGroup,
                  )} at the moment.`}
                />
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {urgent.slice(0, 4).map((r, i) => (
                  <RequestCard key={r.id} request={r} elevated={i === 0}>
                    <Link to="/donor/requests" className="block">
                      <Button size="sm" className="w-full">
                        Apply to Donate
                      </Button>
                    </Link>
                  </RequestCard>
                ))}
              </div>
            )}
          </section>

          {/* All matching requests */}
          <section>
            <SectionHeader
              title="More Requests For You"
              subtitle={`${matching.length} open request${
                matching.length === 1 ? "" : "s"
              } matching your group`}
              to="/donor/requests"
            />
            {matching.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Droplet}
                  title="Nothing matching yet"
                  message="New requests matching your blood group will appear here."
                />
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {matching.slice(0, 4).map((r) => (
                  <RequestCard key={r.id} request={r}>
                    <Link to="/donor/requests" className="block">
                      <Button size="sm" variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </RequestCard>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <StatusCard
            tone={donor?.available ? "green" : "neutral"}
            title={
              donor?.available
                ? "You're available to donate"
                : "You're currently unavailable"
            }
            description={
              donor?.available
                ? "You'll receive emergency alerts matched to your blood group and location."
                : "Turn this on to start receiving matched emergency alerts."
            }
            action={
              <Button
                size="sm"
                variant={donor?.available ? "outline" : "primary"}
                onClick={toggleAvailability}
                loading={toggling}
              >
                {donor?.available ? "Go unavailable" : "Go available"}
              </Button>
            }
          />

          <Card>
            <CardBody>
              <div className="flex items-center gap-2">
                <Bell size={18} strokeWidth={1.8} className="text-primary" />
                <h3 className="text-base font-bold text-secondary">
                  Recent Alerts
                </h3>
              </div>
              {notifications.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-600">
                  No alerts yet. Matched emergency requests will show up here.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <li key={n.id} className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read ? "bg-neutral-300" : "bg-primary"
                        }`}
                      />
                      <p className="text-sm text-neutral-700">{n.message}</p>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/donor/alerts" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  View all alerts
                </Button>
              </Link>
            </CardBody>
          </Card>

          <FeatureCard
            icon={HeartPulse}
            title="Your Safety Matters"
            description="Every donation is screened and handled by verified medical professionals."
            bullets={[
              "Sterile, single-use equipment only",
              "Free mini health check-up each visit",
              "Recover with a snack and 15 minutes rest",
            ]}
          >
            <Link to="/donor/events">
              <Button variant="secondary" size="sm">
                <CalendarDays size={15} strokeWidth={1.9} />
                Find a donation event
              </Button>
            </Link>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}

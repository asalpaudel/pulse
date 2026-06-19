import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplet,
  MapPin,
  Boxes,
  Layers,
  Inbox,
  CalendarDays,
  CalendarClock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Phone,
} from "lucide-react";
import HeroCard from "../../components/ui/HeroCard";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody } from "../../components/ui/Card";
import StatusCard from "../../components/ui/StatusCard";
import FeatureCard from "../../components/ui/FeatureCard";
import Button from "../../components/ui/Button";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import BloodStockGrid from "../../components/BloodStockGrid";
import RequestCard from "../../components/RequestCard";
import { useAuth } from "../../context/AuthContext";
import * as bloodBanksApi from "../../api/bloodbanks";
import * as requestsApi from "../../api/requests";
import * as eventsApi from "../../api/events";
import { BLOOD_GROUPS } from "../../lib/constants";

export default function BloodBankOverview() {
  const { profile, user } = useAuth();
  const [stock, setStock] = useState([]);
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [stockRes, reqRes, evRes] = await Promise.allSettled([
        profile?.id != null
          ? bloodBanksApi.getBloodBankStock(profile.id)
          : Promise.resolve([]),
        requestsApi.listRequests({ status: "OPEN" }),
        eventsApi.listEvents(),
      ]);
      if (!active) return;
      if (stockRes.status === "fulfilled" && Array.isArray(stockRes.value))
        setStock(stockRes.value);
      if (reqRes.status === "fulfilled" && Array.isArray(reqRes.value))
        setRequests(reqRes.value);
      if (evRes.status === "fulfilled" && Array.isArray(evRes.value))
        setEvents(evRes.value);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [profile?.id]);

  if (loading) return <Spinner label="Loading your dashboard…" />;

  const totalUnits = stock.reduce((a, s) => a + (s.units || 0), 0);
  const stockedGroups = stock.filter((s) => (s.units || 0) > 0).length;
  const lowGroups = BLOOD_GROUPS.length - stockedGroups;
  const myEvents = profile?.id
    ? events.filter((e) => e.bloodBankId === profile.id)
    : events;
  const verified = profile?.verified ?? user?.verified;

  const chips = [
    { icon: Building2, label: profile?.name || "Blood Bank" },
    { icon: MapPin, label: profile?.address || "Location not set" },
    { icon: Phone, label: profile?.phone || "No phone on file" },
  ];

  return (
    <div>
      <HeroCard
        greeting={`Welcome back${profile?.name ? `, ${profile.name}` : ""}`}
        subtitle="Keep your inventory live and respond to hospitals across the Pulse network."
        chips={chips}
        action={
          <Link to="/bloodbank/stock">
            <Button>Manage stock</Button>
          </Link>
        }
      />

      {/* 4-up stat row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Boxes}
          tone="red"
          label="Total units in stock"
          value={totalUnits}
        />
        <StatCard
          icon={Layers}
          tone={lowGroups > 0 ? "amber" : "green"}
          label="Groups in stock"
          value={`${stockedGroups}/${BLOOD_GROUPS.length}`}
          hint={lowGroups > 0 ? `${lowGroups} group${lowGroups === 1 ? "" : "s"} empty` : "All groups stocked"}
        />
        <StatCard
          icon={Inbox}
          tone="blue"
          label="Open requests"
          value={requests.length}
        />
        <StatCard
          icon={CalendarDays}
          tone="neutral"
          label="My events"
          value={myEvents.length}
        />
      </div>

      {/* Main + right rail */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {/* Stock summary */}
          <section>
            <SectionHeader
              title="Current Stock"
              subtitle="Live inventory across all blood groups"
              to="/bloodbank/stock"
              actionLabel="Manage stock"
            />
            <Card>
              <CardBody>
                <BloodStockGrid stock={stock} />
              </CardBody>
            </Card>
          </section>

          {/* Open requests */}
          <section>
            <SectionHeader
              title="Open Requests"
              subtitle="Hospitals needing blood right now"
              to="/bloodbank/requests"
            />
            {requests.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Inbox}
                  title="No open requests"
                  message="There are no open blood requests at the moment. New requests will appear here."
                />
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {requests.slice(0, 4).map((r, i) => (
                  <RequestCard key={r.id} request={r} elevated={i === 0}>
                    <Link to="/bloodbank/requests" className="block">
                      <Button size="sm" className="w-full">
                        Respond
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
            tone={verified ? "green" : "amber"}
            title={
              verified
                ? "Your blood bank is verified"
                : "Verification pending"
            }
            description={
              verified
                ? "Hospitals can find you in proximity search and your stock is visible across the network."
                : "An administrator must verify this account before it gains full access to the network."
            }
            action={
              <Link to="/bloodbank/profile">
                <Button size="sm" variant={verified ? "outline" : "primary"}>
                  View profile
                </Button>
              </Link>
            }
          />

          <Card>
            <CardBody>
              <div className="flex items-center gap-2">
                <Droplet size={18} strokeWidth={1.8} className="text-primary" />
                <h3 className="text-base font-bold text-secondary">
                  Inventory at a glance
                </h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Total units</span>
                  <span className="font-semibold text-secondary">
                    {totalUnits}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Groups in stock</span>
                  <span className="font-semibold text-secondary">
                    {stockedGroups}/{BLOOD_GROUPS.length}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Empty groups</span>
                  <span
                    className={`font-semibold ${
                      lowGroups > 0 ? "text-amber-600" : "text-green-600"
                    }`}
                  >
                    {lowGroups}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Upcoming events</span>
                  <span className="font-semibold text-secondary">
                    {myEvents.length}
                  </span>
                </li>
              </ul>
              {lowGroups > 0 && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle
                    size={14}
                    strokeWidth={1.9}
                    className="mt-0.5 shrink-0"
                  />
                  {lowGroups} blood group{lowGroups === 1 ? " is" : "s are"} out
                  of stock — consider running a donation drive.
                </p>
              )}
              <Link to="/bloodbank/stock" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  Update inventory
                </Button>
              </Link>
            </CardBody>
          </Card>

          <FeatureCard
            icon={CalendarClock}
            title="Run a Donation Drive"
            description="Keep your shelves stocked by organising collection events and engaging donors directly."
            bullets={[
              "Schedule campaigns with date and location",
              "Donors browse and enroll in your events",
              "Track enrollments as they come in",
            ]}
          >
            <Link to="/bloodbank/events">
              <Button variant="secondary" size="sm">
                <ShieldCheck size={15} strokeWidth={1.9} />
                Manage events
              </Button>
            </Link>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}

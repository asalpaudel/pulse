import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader, { StatCard } from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import BloodStockGrid from "../../components/BloodStockGrid";
import RequestCard from "../../components/RequestCard";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import * as bloodBanksApi from "../../api/bloodbanks";
import * as requestsApi from "../../api/requests";
import * as eventsApi from "../../api/events";

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
  const myEvents = profile?.id
    ? events.filter((e) => e.bloodBankId === profile.id)
    : events;

  return (
    <div>
      <PageHeader
        title={profile?.name || "Blood Bank Dashboard"}
        subtitle="Manage stock, respond to requests, run events"
      />

      {!user?.verified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Verification pending.</span> Your
          blood bank account is awaiting administrator verification.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total units in stock" value={totalUnits} tone="red" />
        <StatCard label="Open requests" value={requests.length} tone="amber" />
        <StatCard label="My events" value={myEvents.length} tone="blue" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Current stock"
            action={
              <Link to="/bloodbank/stock">
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </Link>
            }
          />
          <CardBody>
            <BloodStockGrid stock={stock} compact />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Open requests"
            subtitle="Hospitals needing blood now"
            action={
              <Link to="/bloodbank/requests">
                <Button variant="ghost" size="sm">
                  View all
                </Button>
              </Link>
            }
          />
          <CardBody>
            {requests.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">
                No open requests right now.
              </p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((r) => (
                  <RequestCard key={r.id} request={r} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

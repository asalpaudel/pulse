import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Droplet,
  Building2,
  MapPin,
  ClipboardList,
  Activity,
  CheckCircle2,
  Layers,
  Users,
  Search,
  ShieldCheck,
} from "lucide-react";
import HeroCard from "../../components/ui/HeroCard";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody } from "../../components/ui/Card";
import StatusCard from "../../components/ui/StatusCard";
import FeatureCard from "../../components/ui/FeatureCard";
import Button from "../../components/ui/Button";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import RequestCard from "../../components/RequestCard";
import RequestDetailModal from "../../components/RequestDetailModal";
import CreateRequestModal from "../../components/CreateRequestModal";
import { useAuth } from "../../context/AuthContext";
import * as requestsApi from "../../api/requests";

export default function HospitalOverview() {
  const { profile, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    try {
      const data = await requestsApi.listRequests({ mine: true });
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(load);
  }, []);

  const onUpdated = (updated) => {
    setRequests((r) => r.map((x) => (x.id === updated.id ? updated : x)));
  };

  if (loading) return <Spinner label="Loading your dashboard…" />;

  const open = requests.filter((r) => r.status === "OPEN");
  const matched = requests.filter((r) => r.status === "MATCHED");
  const fulfilled = requests.filter((r) => r.status === "FULFILLED");
  const active = requests.filter(
    (r) => r.status === "OPEN" || r.status === "MATCHED",
  );
  const totalUnits = requests.reduce((sum, r) => sum + (r.units || 0), 0);

  const chips = [
    { icon: Building2, label: profile?.name || "Hospital" },
    { icon: MapPin, label: profile?.address || "Location not set" },
    {
      icon: ShieldCheck,
      label: user?.verified ? "Verified institution" : "Verification pending",
    },
  ];

  return (
    <div>
      <HeroCard
        greeting={`Welcome back, ${profile?.name || "Hospital"}`}
        subtitle="Coordinate blood requests and track fulfillment across the Pulse network."
        chips={chips}
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <ClipboardList size={16} strokeWidth={1.9} />
            New request
          </Button>
        }
      />

      {/* 4-up stat row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          tone="amber"
          label="Open requests"
          value={open.length}
        />
        <StatCard
          icon={Activity}
          tone="blue"
          label="Matched"
          value={matched.length}
        />
        <StatCard
          icon={CheckCircle2}
          tone="green"
          label="Fulfilled"
          value={fulfilled.length}
        />
        <StatCard
          icon={Layers}
          tone="red"
          label="Units requested"
          value={totalUnits}
          hint={`${requests.length} request${requests.length === 1 ? "" : "s"} total`}
        />
      </div>

      {/* Main + right rail */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <section>
            <SectionHeader
              title="Active Requests"
              subtitle="Your open and matched blood requests"
              to="/hospital/requests"
              actionLabel="Manage all"
            />
            {active.length === 0 ? (
              <Card>
                <EmptyState
                  icon={ClipboardList}
                  title="No active requests"
                  message="Create an emergency or routine blood request to start coordinating fulfillment."
                  action={
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                      Create a request
                    </Button>
                  }
                />
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {active.slice(0, 4).map((r, i) => (
                  <RequestCard key={r.id} request={r} elevated={i === 0}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => setDetail(r)}
                    >
                      View responses & status
                    </Button>
                  </RequestCard>
                ))}
              </div>
            )}
          </section>

          {fulfilled.length > 0 && (
            <section>
              <SectionHeader
                title="Recently Fulfilled"
                subtitle={`${fulfilled.length} request${
                  fulfilled.length === 1 ? "" : "s"
                } fulfilled`}
                to="/hospital/requests"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {fulfilled.slice(0, 2).map((r) => (
                  <RequestCard key={r.id} request={r}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setDetail(r)}
                    >
                      View Details
                    </Button>
                  </RequestCard>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <StatusCard
            tone={user?.verified ? "green" : "amber"}
            title={
              user?.verified
                ? "Your hospital is verified"
                : "Verification pending"
            }
            description={
              user?.verified
                ? "You have full access to create requests and coordinate fulfillment."
                : "An administrator must verify your hospital account before it gains full access."
            }
          />

          <Card>
            <CardBody>
              <div className="flex items-center gap-2">
                <Search size={18} strokeWidth={1.8} className="text-primary" />
                <h3 className="text-base font-bold text-secondary">
                  Find help fast
                </h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Search for donors and nearby blood banks to source units for
                your requests.
              </p>
              <div className="mt-4 space-y-2">
                <Link to="/hospital/donors" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users size={15} strokeWidth={1.9} />
                    Search donors
                  </Button>
                </Link>
                <Link to="/hospital/bloodbanks" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <Building2 size={15} strokeWidth={1.9} />
                    Search blood banks
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          <FeatureCard
            icon={Droplet}
            title="Faster Emergency Response"
            description="Emergency requests instantly alert matching donors and nearby blood banks in real time."
            bullets={[
              "Matched by blood group and proximity",
              "Live status as donors and banks respond",
              "Email fallback so alerts are never missed",
            ]}
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreateOpen(true)}
            >
              <ClipboardList size={15} strokeWidth={1.9} />
              Post a request
            </Button>
          </FeatureCard>
        </div>
      </div>

      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => load()}
      />
      <RequestDetailModal
        open={Boolean(detail)}
        request={detail}
        onClose={() => setDetail(null)}
        onUpdated={onUpdated}
      />
    </div>
  );
}

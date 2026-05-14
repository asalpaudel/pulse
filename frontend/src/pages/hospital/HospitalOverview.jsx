import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader, { StatCard } from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import RequestCard from "../../components/RequestCard";
import CreateRequestModal from "../../components/CreateRequestModal";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import * as requestsApi from "../../api/requests";

export default function HospitalOverview() {
  const { profile, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

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

  if (loading) return <Spinner label="Loading your dashboard…" />;

  const open = requests.filter((r) => r.status === "OPEN");
  const active = requests.filter(
    (r) => r.status === "OPEN" || r.status === "MATCHED",
  );
  const fulfilled = requests.filter((r) => r.status === "FULFILLED");

  return (
    <div>
      <PageHeader
        title={profile?.name || "Hospital Dashboard"}
        subtitle="Coordinate blood requests and fulfillment"
        action={<Button onClick={() => setCreateOpen(true)}>+ New request</Button>}
      />

      {!user?.verified && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Verification pending.</span> Your
          hospital account is awaiting administrator verification.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total requests" value={requests.length} />
        <StatCard label="Open" value={open.length} tone="amber" />
        <StatCard label="Active" value={active.length} tone="blue" />
        <StatCard label="Fulfilled" value={fulfilled.length} tone="green" />
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent requests"
            action={
              <Link to="/hospital/requests">
                <Button variant="ghost" size="sm">
                  Manage all
                </Button>
              </Link>
            }
          />
          <CardBody>
            {requests.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">
                No requests yet. Create your first blood request to get started.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {requests.slice(0, 6).map((r) => (
                  <RequestCard key={r.id} request={r} />
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/hospital/donors">
          <Card className="p-5 transition hover:shadow-md">
            <h3 className="font-semibold text-stone-900">Find donors →</h3>
            <p className="mt-1 text-sm text-stone-500">
              Proximity search for available donors by blood group.
            </p>
          </Card>
        </Link>
        <Link to="/hospital/bloodbanks">
          <Card className="p-5 transition hover:shadow-md">
            <h3 className="font-semibold text-stone-900">Find blood banks →</h3>
            <p className="mt-1 text-sm text-stone-500">
              Locate nearby blood banks and view their live stock.
            </p>
          </Card>
        </Link>
      </div>

      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import RequestCard from "../../components/RequestCard";
import Button from "../../components/ui/Button";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { Select } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as requestsApi from "../../api/requests";
import { REQUEST_STATUSES, bloodGroupLabel } from "../../lib/constants";

export default function DonorRequests() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [onlyMatching, setOnlyMatching] = useState(true);
  const [responding, setResponding] = useState(null);
  const [responded, setResponded] = useState(() => new Set());

  const load = async () => {
    setLoading(true);
    try {
      const data = await requestsApi.listRequests({
        status: statusFilter || undefined,
      });
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const respond = async (id) => {
    setResponding(id);
    try {
      await requestsApi.respondToRequest(id);
      setResponded((s) => new Set(s).add(id));
      toast.success("Response sent — the hospital has been notified.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResponding(null);
    }
  };

  const visible = requests.filter(
    (r) => !onlyMatching || !profile?.bloodGroup || r.bloodGroup === profile.bloodGroup,
  );

  return (
    <div>
      <PageHeader
        title="Blood Requests"
        subtitle="Respond to requests you can help fulfil"
        action={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={onlyMatching}
                onChange={(e) => setOnlyMatching(e.target.checked)}
                className="accent-pulse"
              />
              My group ({bloodGroupLabel(profile?.bloodGroup)})
            </label>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36"
            >
              <option value="">All statuses</option>
              {REQUEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No requests found"
          message="There are no blood requests matching your filters right now."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const done = responded.has(r.id);
            const canRespond = r.status === "OPEN" || r.status === "MATCHED";
            return (
              <RequestCard key={r.id} request={r}>
                {canRespond ? (
                  <Button
                    size="sm"
                    variant={done ? "outline" : "primary"}
                    disabled={done}
                    loading={responding === r.id}
                    onClick={() => respond(r.id)}
                  >
                    {done ? "Response sent" : "I can donate"}
                  </Button>
                ) : (
                  <span className="text-xs text-stone-400">
                    Closed for responses
                  </span>
                )}
              </RequestCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

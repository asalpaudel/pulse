import { useEffect, useState } from "react";
import { Droplet, Filter } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import RequestCard from "../../components/RequestCard";
import Button from "../../components/ui/Button";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import FilterChip from "../../components/ui/FilterChip";
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
  const [onlyUrgent, setOnlyUrgent] = useState(false);
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

  const visible = requests.filter((r) => {
    if (
      onlyMatching &&
      profile?.bloodGroup &&
      r.bloodGroup !== profile.bloodGroup
    )
      return false;
    if (onlyUrgent && r.urgency !== "EMERGENCY") return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Blood Requests"
        subtitle="Respond to requests you can help fulfil"
      />

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          active={onlyMatching}
          icon={Droplet}
          onClick={() => setOnlyMatching((v) => !v)}
        >
          My group ({bloodGroupLabel(profile?.bloodGroup)})
        </FilterChip>
        <FilterChip
          active={onlyUrgent}
          onClick={() => setOnlyUrgent((v) => !v)}
        >
          Urgent only
        </FilterChip>
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <FilterChip
          active={statusFilter === ""}
          onClick={() => setStatusFilter("")}
        >
          All statuses
        </FilterChip>
        {REQUEST_STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </FilterChip>
        ))}
        <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-neutral-600">
          <Filter size={15} strokeWidth={1.8} />
          {visible.length} result{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Droplet}
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
                    className="w-full"
                    variant={done ? "outline" : "primary"}
                    disabled={done}
                    loading={responding === r.id}
                    onClick={() => respond(r.id)}
                  >
                    {done ? "Response sent" : "Apply to Donate"}
                  </Button>
                ) : (
                  <span className="block text-center text-xs text-neutral-400">
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

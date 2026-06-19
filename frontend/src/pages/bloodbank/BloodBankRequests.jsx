import { useEffect, useState } from "react";
import { Filter, Inbox, Zap } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import RequestCard from "../../components/RequestCard";
import Button from "../../components/ui/Button";
import FilterChip from "../../components/ui/FilterChip";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import * as requestsApi from "../../api/requests";
import { REQUEST_STATUSES } from "../../lib/constants";

// Blood banks see open requests and offer to fulfil with live stock.
export default function BloodBankRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
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
      toast.success("Offer sent — the hospital has been notified.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResponding(null);
    }
  };

  const visible = requests.filter((r) => {
    if (onlyUrgent && r.urgency !== "EMERGENCY") return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Open Requests"
        subtitle="Respond to hospital blood requests with your live stock"
      />

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          active={onlyUrgent}
          icon={Zap}
          onClick={() => setOnlyUrgent((v) => !v)}
        >
          Emergency only
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
          icon={Inbox}
          title="No requests"
          message="There are no blood requests matching your filter right now."
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
                    {done ? "Offer sent" : "Offer to fulfil"}
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

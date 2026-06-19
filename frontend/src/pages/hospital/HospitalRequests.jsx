import { useEffect, useState } from "react";
import { ClipboardList, Filter } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import RequestCard from "../../components/RequestCard";
import CreateRequestModal from "../../components/CreateRequestModal";
import RequestDetailModal from "../../components/RequestDetailModal";
import Button from "../../components/ui/Button";
import FilterChip from "../../components/ui/FilterChip";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import * as requestsApi from "../../api/requests";
import { REQUEST_STATUSES } from "../../lib/constants";

export default function HospitalRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await requestsApi.listRequests({
        mine: true,
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

  const onCreated = (created) => {
    if (created) setRequests((r) => [created, ...r]);
    else load();
  };

  const onUpdated = (updated) => {
    setRequests((r) => r.map((x) => (x.id === updated.id ? updated : x)));
  };

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Create and track your hospital's blood requests"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <ClipboardList size={16} strokeWidth={1.9} />
            New request
          </Button>
        }
      />

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
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
          {requests.length} result{requests.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No requests yet"
          message="Create an emergency or routine blood request to start coordinating fulfillment."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              Create your first request
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r}>
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

      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onCreated}
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

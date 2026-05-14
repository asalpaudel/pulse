import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import RequestCard from "../../components/RequestCard";
import Button from "../../components/ui/Button";
import { Select } from "../../components/ui/Input";
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

  return (
    <div>
      <PageHeader
        title="Open Requests"
        subtitle="Respond to hospital blood requests with your stock"
        action={
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
        }
      />

      {loading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests"
          message="There are no blood requests matching your filter right now."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => {
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
                    {done ? "Offer sent" : "Offer to fulfil"}
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

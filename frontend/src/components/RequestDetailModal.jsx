import { useEffect, useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Select } from "./ui/Input";
import StatusPill, { UrgencyPill } from "./ui/StatusPill";
import Badge from "./ui/Badge";
import Spinner from "./ui/Spinner";
import { useToast } from "../context/ToastContext";
import * as requestsApi from "../api/requests";
import {
  bloodGroupLabel,
  formatDateTime,
  REQUEST_STATUSES,
  ROLE_LABELS,
} from "../lib/constants";

/**
 * Hospital-owner view of a single request: shows responses and lets the owner
 * advance the lifecycle status (OPEN -> MATCHED -> FULFILLED -> CLOSED).
 */
export default function RequestDetailModal({ open, request, onClose, onUpdated }) {
  const { toast } = useToast();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(request?.status || "OPEN");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !request) return;
    Promise.resolve().then(() => {
      setStatus(request.status);
      setLoading(true);
      requestsApi
        .getRequestResponses(request.id)
        .then((data) => setResponses(Array.isArray(data) ? data : []))
        .catch(() => setResponses([]))
        .finally(() => setLoading(false));
    });
  }, [open, request]);

  if (!request) return null;

  const updateStatus = async () => {
    setSaving(true);
    try {
      const updated = await requestsApi.updateRequestStatus(request.id, status);
      toast.success(`Request marked ${status}.`);
      onUpdated?.(updated || { ...request, status });
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request details"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={updateStatus}
            loading={saving}
            disabled={status === request.status}
          >
            Update status
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-lg bg-pulse/10">
            <span className="text-lg font-bold leading-none text-pulse">
              {bloodGroupLabel(request.bloodGroup)}
            </span>
            <span className="text-[10px] text-pulse/70">
              {request.units} units
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyPill urgency={request.urgency} />
            <StatusPill status={request.status} />
            <span className="text-xs text-stone-400">
              Posted {formatDateTime(request.createdAt)}
            </span>
          </div>
        </div>

        {request.note && (
          <p className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
            {request.note}
          </p>
        )}

        <div>
          <p className="mb-1 text-sm font-medium text-stone-700">
            Advance lifecycle
          </p>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">
            Responses{" "}
            <span className="text-stone-400">({responses.length})</span>
          </p>
          {loading ? (
            <Spinner label="Loading responses…" />
          ) : responses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-200 px-3 py-6 text-center text-sm text-stone-400">
              No responses yet. Donors and blood banks who offer to help will
              appear here.
            </p>
          ) : (
            <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
              {responses.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {ROLE_LABELS[r.responderRole] || r.responderRole} #
                      {r.responderUserId}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                  <Badge tone={r.status === "ACCEPTED" ? "green" : "blue"}>
                    {r.status || "OFFERED"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

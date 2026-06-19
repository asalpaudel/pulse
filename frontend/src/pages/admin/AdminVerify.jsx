import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Hospital,
  Building2,
  CalendarClock,
  Mail,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import FilterChip from "../../components/ui/FilterChip";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../../api/admin";
import { ROLE_LABELS, formatDate } from "../../lib/constants";

const ROLE_ICONS = { HOSPITAL: Hospital, BLOOD_BANK: Building2 };

/**
 * Verification queue — pulls unverified HOSPITAL and BLOOD_BANK accounts
 * (GET /admin/users?verified=false) and verifies them one by one.
 */
export default function AdminVerify() {
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({ verified: false });
      // Only institutional accounts need verification.
      const list = (Array.isArray(data) ? data : []).filter(
        (u) => u.role === "HOSPITAL" || u.role === "BLOOD_BANK",
      );
      setPending(list);
    } catch (err) {
      toast.error(err.message);
      setPending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (id) => {
    setVerifying(id);
    try {
      await adminApi.verifyUser(id);
      setPending((p) => p.filter((u) => u.id !== id));
      toast.success("Account verified — it now has full access.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifying(null);
    }
  };

  const visible = pending.filter((u) => !roleFilter || u.role === roleFilter);
  const hospitalCount = pending.filter((u) => u.role === "HOSPITAL").length;
  const bankCount = pending.filter((u) => u.role === "BLOOD_BANK").length;

  return (
    <div>
      <PageHeader
        title="Verifications"
        subtitle="Review and approve hospital and blood bank accounts"
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw size={15} strokeWidth={1.9} />
            Refresh
          </Button>
        }
      />

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          active={roleFilter === ""}
          onClick={() => setRoleFilter("")}
        >
          All institutions ({pending.length})
        </FilterChip>
        <FilterChip
          active={roleFilter === "HOSPITAL"}
          icon={Hospital}
          onClick={() => setRoleFilter("HOSPITAL")}
        >
          Hospitals ({hospitalCount})
        </FilterChip>
        <FilterChip
          active={roleFilter === "BLOOD_BANK"}
          icon={Building2}
          onClick={() => setRoleFilter("BLOOD_BANK")}
        >
          Blood Banks ({bankCount})
        </FilterChip>
      </div>

      {loading ? (
        <Spinner label="Loading verification queue…" />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="All caught up"
            message={
              pending.length === 0
                ? "There are no institutional accounts awaiting verification."
                : "No accounts match this filter."
            }
          />
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Pending verification"
            subtitle={`${visible.length} account${
              visible.length === 1 ? "" : "s"
            } waiting for review`}
          />
          <CardBody className="space-y-3">
            {visible.map((u) => {
              const Icon = ROLE_ICONS[u.role] || Hospital;
              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-blush-soft p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="inline-flex items-center gap-1.5 font-semibold text-secondary">
                          <Mail
                            size={14}
                            strokeWidth={1.8}
                            className="text-neutral-400"
                          />
                          {u.email}
                        </p>
                        <Badge tone={u.role === "HOSPITAL" ? "blue" : "amber"}>
                          {ROLE_LABELS[u.role]}
                        </Badge>
                      </div>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-600">
                        <CalendarClock size={13} strokeWidth={1.8} />
                        Registered {formatDate(u.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    loading={verifying === u.id}
                    onClick={() => verify(u.id)}
                    className="shrink-0"
                  >
                    <ShieldCheck size={15} strokeWidth={1.9} />
                    Verify account
                  </Button>
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

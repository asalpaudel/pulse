import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../../api/admin";
import { ROLE_LABELS, formatDate } from "../../lib/constants";

/**
 * Verification queue — pulls unverified HOSPITAL and BLOOD_BANK accounts
 * (GET /admin/users?verified=false) and verifies them one by one.
 */
export default function AdminVerify() {
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

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

  return (
    <div>
      <PageHeader
        title="Verifications"
        subtitle="Review and approve hospital and blood bank accounts"
        action={
          <Button variant="ghost" size="sm" onClick={load}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : pending.length === 0 ? (
        <EmptyState
          title="All caught up"
          message="There are no institutional accounts awaiting verification."
        />
      ) : (
        <Card>
          <CardHeader
            title="Pending verification"
            subtitle={`${pending.length} account${pending.length === 1 ? "" : "s"} waiting`}
          />
          <CardBody className="space-y-3">
            {pending.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-lg border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-900">{u.email}</p>
                    <Badge tone={u.role === "HOSPITAL" ? "blue" : "amber"}>
                      {ROLE_LABELS[u.role]}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-400">
                    Registered {formatDate(u.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  loading={verifying === u.id}
                  onClick={() => verify(u.id)}
                >
                  Verify account
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

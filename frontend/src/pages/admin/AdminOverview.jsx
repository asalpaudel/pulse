import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader, { StatCard } from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import StatusPill from "../../components/ui/StatusPill";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../../api/admin";
import { ROLE_LABELS, REQUEST_STATUSES } from "../../lib/constants";

// /admin/stats shape (pinned in API_CONTRACT.md):
// { usersByRole: {ROLE: count}, requestsByStatus: {STATUS: count}, totalStock: number }
const num = (obj, key) => Number(obj?.[key]) || 0;

export default function AdminOverview() {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data || {});
      } catch (err) {
        toast.error(err.message);
        setStats({});
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Spinner label="Loading platform stats…" />;

  const usersByRole = stats?.usersByRole || {};
  const requestsByStatus = stats?.requestsByStatus || {};
  const totalStock = num(stats, "totalStock");
  const totalUsers = Object.values(usersByRole).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Platform Overview"
        subtitle="Monitor activity across the Pulse network"
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value={totalUsers} />
        <StatCard
          label="Open requests"
          value={num(requestsByStatus, "OPEN")}
          tone="amber"
        />
        <StatCard
          label="Fulfilled requests"
          value={num(requestsByStatus, "FULFILLED")}
          tone="green"
        />
        <StatCard label="Total stock units" value={totalStock} tone="red" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Users by role" />
          <CardBody>
            <ul className="space-y-2">
              {Object.keys(ROLE_LABELS).map((role) => (
                <li
                  key={role}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-stone-600">{ROLE_LABELS[role]}</span>
                  <span className="font-semibold text-stone-900">
                    {num(usersByRole, role)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Requests by status" />
          <CardBody>
            <ul className="space-y-2">
              {REQUEST_STATUSES.map((s) => (
                <li
                  key={s}
                  className="flex items-center justify-between text-sm"
                >
                  <StatusPill status={s} />
                  <span className="font-semibold text-stone-900">
                    {num(requestsByStatus, s)}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/verify">
          <Card className="p-5 transition hover:shadow-md">
            <h3 className="font-semibold text-stone-900">
              Pending verifications →
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Review and verify hospital and blood bank accounts.
            </p>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card className="p-5 transition hover:shadow-md">
            <h3 className="font-semibold text-stone-900">Manage users →</h3>
            <p className="mt-1 text-sm text-stone-500">
              Browse and filter every account on the platform.
            </p>
          </Card>
        </Link>
      </div>

      <div className="mt-6">
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
          Refresh stats
        </Button>
      </div>
    </div>
  );
}

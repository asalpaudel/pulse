import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Droplet,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Hospital,
  HeartPulse,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";
import HeroCard from "../../components/ui/HeroCard";
import StatCard from "../../components/ui/StatCard";
import SectionHeader from "../../components/ui/SectionHeader";
import Card, { CardBody } from "../../components/ui/Card";
import StatusCard from "../../components/ui/StatusCard";
import FeatureCard from "../../components/ui/FeatureCard";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import StatusPill from "../../components/ui/StatusPill";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../../api/admin";
import { ROLE_LABELS, REQUEST_STATUSES } from "../../lib/constants";

// /admin/stats shape (pinned in API_CONTRACT.md):
// { usersByRole: {ROLE: count}, requestsByStatus: {STATUS: count}, totalStock: number }
const num = (obj, key) => Number(obj?.[key]) || 0;

const ROLE_ICONS = {
  DONOR: Droplet,
  HOSPITAL: Hospital,
  BLOOD_BANK: Building2,
  ADMIN: ShieldCheck,
};

const ROLE_BAR = {
  DONOR: "bg-primary",
  HOSPITAL: "bg-tertiary",
  BLOOD_BANK: "bg-amber-500",
  ADMIN: "bg-secondary-700",
};

const STATUS_BAR = {
  OPEN: "bg-amber-500",
  MATCHED: "bg-tertiary",
  FULFILLED: "bg-green-500",
  CLOSED: "bg-neutral-400",
};

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
  const totalRequests = Object.values(requestsByStatus).reduce(
    (a, b) => a + (Number(b) || 0),
    0,
  );
  const openRequests = num(requestsByStatus, "OPEN");
  const fulfilledRequests = num(requestsByStatus, "FULFILLED");
  const pendingVerifications =
    num(usersByRole, "HOSPITAL") + num(usersByRole, "BLOOD_BANK");

  const maxRole = Math.max(
    1,
    ...Object.keys(ROLE_LABELS).map((r) => num(usersByRole, r)),
  );
  const maxStatus = Math.max(
    1,
    ...REQUEST_STATUSES.map((s) => num(requestsByStatus, s)),
  );

  const chips = [
    { icon: Users, label: `${totalUsers} total users` },
    { icon: Activity, label: `${totalRequests} blood requests` },
    { icon: Droplet, label: `${totalStock} units in stock` },
  ];

  return (
    <div>
      <HeroCard
        greeting="Welcome back, Admin"
        subtitle="Monitor activity and keep the Pulse network running smoothly."
        chips={chips}
        action={
          <Link to="/admin/verify">
            <Button variant="primary">Review verifications</Button>
          </Link>
        }
      />

      {/* 4-up stat row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          tone="blue"
          label="Total users"
          value={totalUsers}
          hint={`${num(usersByRole, "DONOR")} donors`}
        />
        <StatCard
          icon={Activity}
          tone="amber"
          label="Open requests"
          value={openRequests}
          hint={`${totalRequests} all-time`}
        />
        <StatCard
          icon={CheckCircle2}
          tone="green"
          label="Fulfilled requests"
          value={fulfilledRequests}
        />
        <StatCard
          icon={Droplet}
          tone="red"
          label="Total stock units"
          value={totalStock}
        />
      </div>

      {/* Main + right rail */}
      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {/* Users by role */}
          <section>
            <SectionHeader
              title="Users by Role"
              subtitle="Account distribution across the platform"
              to="/admin/users"
              actionLabel="Manage users"
            />
            <Card>
              <CardBody className="space-y-4">
                {Object.keys(ROLE_LABELS).map((role) => {
                  const count = num(usersByRole, role);
                  const Icon = ROLE_ICONS[role] || Users;
                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium text-secondary">
                          <Icon
                            size={16}
                            strokeWidth={1.8}
                            className="text-neutral-400"
                          />
                          {ROLE_LABELS[role]}
                        </span>
                        <span className="font-semibold text-secondary">
                          {count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={`h-full rounded-full ${ROLE_BAR[role] || "bg-neutral-400"}`}
                          style={{ width: `${(count / maxRole) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </section>

          {/* Requests by status */}
          <section>
            <SectionHeader
              title="Requests by Status"
              subtitle="Where blood requests sit in their lifecycle"
            />
            <Card>
              <CardBody className="space-y-4">
                {REQUEST_STATUSES.map((s) => {
                  const count = num(requestsByStatus, s);
                  return (
                    <div key={s}>
                      <div className="flex items-center justify-between text-sm">
                        <StatusPill status={s} />
                        <span className="font-semibold text-secondary">
                          {count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={`h-full rounded-full ${STATUS_BAR[s] || "bg-neutral-400"}`}
                          style={{ width: `${(count / maxStatus) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </section>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          <StatusCard
            tone={pendingVerifications > 0 ? "amber" : "green"}
            icon={pendingVerifications > 0 ? ClipboardCheck : CheckCircle2}
            title={
              pendingVerifications > 0
                ? `${pendingVerifications} institutional account${
                    pendingVerifications === 1 ? "" : "s"
                  } to review`
                : "No accounts awaiting review"
            }
            description={
              pendingVerifications > 0
                ? "Hospitals and blood banks need admin verification before they gain full access."
                : "Every hospital and blood bank account is currently verified."
            }
            action={
              <Link to="/admin/verify">
                <Button
                  size="sm"
                  variant={pendingVerifications > 0 ? "primary" : "outline"}
                >
                  Go to verifications
                </Button>
              </Link>
            }
          />

          <Card>
            <CardBody>
              <div className="flex items-center gap-2">
                <BarChart3
                  size={18}
                  strokeWidth={1.8}
                  className="text-primary"
                />
                <h3 className="text-base font-bold text-secondary">
                  Platform Snapshot
                </h3>
              </div>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Hospitals</span>
                  <span className="font-semibold text-secondary">
                    {num(usersByRole, "HOSPITAL")}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Blood banks</span>
                  <span className="font-semibold text-secondary">
                    {num(usersByRole, "BLOOD_BANK")}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Donors</span>
                  <span className="font-semibold text-secondary">
                    {num(usersByRole, "DONOR")}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-neutral-600">Active requests</span>
                  <span className="font-semibold text-secondary">
                    {openRequests + num(requestsByStatus, "MATCHED")}
                  </span>
                </li>
              </ul>
              <Link to="/admin/users" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  Manage all users
                </Button>
              </Link>
            </CardBody>
          </Card>

          <FeatureCard
            icon={HeartPulse}
            title="Keeping Pulse Trusted"
            description="Verification and oversight keep every emergency request reliable."
            bullets={[
              "Verify hospitals and blood banks before they go live",
              "Monitor request lifecycle and stock levels",
              "Manage roles and keep platform data consistent",
            ]}
          >
            <Link to="/admin/verify">
              <Button variant="secondary" size="sm">
                <ShieldCheck size={15} strokeWidth={1.9} />
                Open verification queue
              </Button>
            </Link>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Droplet,
  Hospital,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import FilterChip from "../../components/ui/FilterChip";
import { VerifiedPill } from "../../components/ui/StatusPill";
import Badge from "../../components/ui/Badge";
import {
  Table,
  THead,
  TBody,
  TR,
  TD,
  EmptyRow,
} from "../../components/ui/Table";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../../api/admin";
import { ROLE_LABELS, formatDate } from "../../lib/constants";

const ROLE_TONE = {
  DONOR: "red",
  HOSPITAL: "blue",
  BLOOD_BANK: "amber",
  ADMIN: "neutral",
};

const ROLE_ICONS = {
  DONOR: Droplet,
  HOSPITAL: Hospital,
  BLOOD_BANK: Building2,
  ADMIN: ShieldCheck,
};

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [verifying, setVerifying] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({
        role: roleFilter || undefined,
        verified: verifiedFilter === "" ? undefined : verifiedFilter === "true",
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, verifiedFilter, toast]);

  useEffect(() => {
    Promise.resolve().then(load);
  }, [load]);

  const verify = async (id) => {
    setVerifying(id);
    try {
      await adminApi.verifyUser(id);
      setUsers((u) =>
        u.map((x) => (x.id === id ? { ...x, verified: true } : x)),
      );
      toast.success("Account verified.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Browse and manage every account on the platform"
      />

      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          active={roleFilter === ""}
          icon={Users}
          onClick={() => setRoleFilter("")}
        >
          All roles
        </FilterChip>
        {Object.keys(ROLE_LABELS).map((r) => (
          <FilterChip
            key={r}
            active={roleFilter === r}
            icon={ROLE_ICONS[r]}
            onClick={() => setRoleFilter(r)}
          >
            {ROLE_LABELS[r]}
          </FilterChip>
        ))}
        <span className="mx-1 h-5 w-px bg-neutral-200" />
        <FilterChip
          active={verifiedFilter === ""}
          onClick={() => setVerifiedFilter("")}
        >
          Any status
        </FilterChip>
        <FilterChip
          active={verifiedFilter === "true"}
          icon={CheckCircle2}
          onClick={() => setVerifiedFilter("true")}
        >
          Verified
        </FilterChip>
        <FilterChip
          active={verifiedFilter === "false"}
          icon={Clock}
          onClick={() => setVerifiedFilter("false")}
        >
          Unverified
        </FilterChip>
        {!loading && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-neutral-600">
            <Filter size={15} strokeWidth={1.8} />
            {users.length} result{users.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading users…" />
      ) : (
        <Card>
          <Table>
            <THead columns={["Email", "Role", "Status", "Joined", "Actions"]} />
            <TBody>
              {users.length === 0 ? (
                <EmptyRow colSpan={5} message="No users match these filters." />
              ) : (
                users.map((u) => {
                  const institutional =
                    u.role === "HOSPITAL" || u.role === "BLOOD_BANK";
                  const RoleIcon = ROLE_ICONS[u.role] || Users;
                  return (
                    <TR key={u.id}>
                      <TD className="font-medium text-secondary">{u.email}</TD>
                      <TD>
                        <Badge
                          tone={ROLE_TONE[u.role] || "neutral"}
                          icon={RoleIcon}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </TD>
                      <TD>
                        {institutional ? (
                          <VerifiedPill verified={u.verified} />
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </TD>
                      <TD className="text-neutral-600">
                        {formatDate(u.createdAt)}
                      </TD>
                      <TD>
                        {institutional && !u.verified ? (
                          <Button
                            size="sm"
                            loading={verifying === u.id}
                            onClick={() => verify(u.id)}
                          >
                            <ShieldCheck size={15} strokeWidth={1.9} />
                            Verify
                          </Button>
                        ) : (
                          <span className="text-xs text-neutral-300">—</span>
                        )}
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

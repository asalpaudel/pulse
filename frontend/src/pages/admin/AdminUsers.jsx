import { useEffect, useState, useCallback } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/ui/Card";
import { Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
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
  ADMIN: "slate",
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
        action={
          <div className="flex items-center gap-2">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-40"
            >
              <option value="">All roles</option>
              {Object.keys(ROLE_LABELS).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </Select>
            <Select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-36"
            >
              <option value="">Any status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </Select>
          </div>
        }
      />

      {loading ? (
        <Spinner />
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
                  return (
                    <TR key={u.id}>
                      <TD className="font-medium text-stone-900">{u.email}</TD>
                      <TD>
                        <Badge tone={ROLE_TONE[u.role] || "neutral"}>
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </TD>
                      <TD>
                        {institutional ? (
                          <VerifiedPill verified={u.verified} />
                        ) : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </TD>
                      <TD className="text-stone-500">
                        {formatDate(u.createdAt)}
                      </TD>
                      <TD>
                        {institutional && !u.verified ? (
                          <Button
                            size="sm"
                            loading={verifying === u.id}
                            onClick={() => verify(u.id)}
                          >
                            Verify
                          </Button>
                        ) : (
                          <span className="text-xs text-stone-300">—</span>
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

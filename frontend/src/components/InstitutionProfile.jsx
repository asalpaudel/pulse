import { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import Card, { CardHeader, CardBody } from "./ui/Card";
import { Input } from "./ui/Input";
import Button from "./ui/Button";
import LocationFields from "./LocationFields";
import Spinner from "./ui/Spinner";
import StatusCard from "./ui/StatusCard";
import { VerifiedPill } from "./ui/StatusPill";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

/**
 * Shared profile editor for HOSPITAL and BLOOD_BANK accounts — both use the
 * institutional shape { name, phone, latitude, longitude, address, verified }.
 *
 * @param {object}   props
 * @param {string}   props.kind        "Hospital" | "Blood Bank"
 * @param {Function} props.fetchFn     () => Promise<profile>
 * @param {Function} props.updateFn    (payload) => Promise<profile>
 */
export default function InstitutionProfile({ kind, fetchFn, updateFn }) {
  const { user, profile, setProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await fetchFn();
        if (active) setForm(me);
      } catch {
        if (active) setForm(profile || {});
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude !== "" ? Number(form.latitude) : null,
        longitude: form.longitude !== "" ? Number(form.longitude) : null,
      };
      const updated = await updateFn(payload);
      setForm(updated);
      setProfile(updated);
      toast.success(`${kind} profile updated.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Spinner />;

  const verified = form.verified ?? user?.verified;

  return (
    <div>
      <PageHeader
        title={`${kind} Profile`}
        subtitle={`Manage your ${kind.toLowerCase()} details`}
      />

      {!verified ? (
        <div className="mb-6">
          <StatusCard
            tone="amber"
            title="Verification pending"
            description="An administrator must verify this account before it gains full access."
          />
        </div>
      ) : (
        <div className="mb-6">
          <StatusCard
            tone="green"
            title="Account verified"
            description={`This ${kind.toLowerCase()} account is verified and has full access.`}
          />
        </div>
      )}

      <Card>
        <CardHeader
          title={form.name || kind}
          subtitle={user?.email}
          action={<VerifiedPill verified={verified} />}
        />
        <CardBody>
          <form onSubmit={save} className="space-y-4">
            <Input
              label={`${kind} name`}
              name="name"
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
              required
            />
            <Input
              label="Contact phone"
              name="phone"
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
            />
            <LocationFields values={form} onChange={set} />
            <div className="pt-2">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

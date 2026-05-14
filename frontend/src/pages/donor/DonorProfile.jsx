import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import LocationFields from "../../components/LocationFields";
import Spinner from "../../components/ui/Spinner";
import { VerifiedPill } from "../../components/ui/StatusPill";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as donorsApi from "../../api/donors";
import { BLOOD_GROUPS, bloodGroupLabel } from "../../lib/constants";

export default function DonorProfile() {
  const { user, profile, setProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await donorsApi.getMyDonorProfile();
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
      const updated = await donorsApi.updateMyDonorProfile(payload);
      setForm(updated);
      setProfile(updated);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Spinner />;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your donor details" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pulse text-2xl font-bold text-white">
                {(form.fullName || user?.email || "?").charAt(0).toUpperCase()}
              </div>
              <p className="mt-3 font-semibold text-stone-900">
                {form.fullName || "Donor"}
              </p>
              <p className="text-sm text-stone-500">{user?.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-pulse/10 px-3 py-1 text-sm font-semibold text-pulse">
                  {bloodGroupLabel(form.bloodGroup)}
                </span>
                <VerifiedPill verified={user?.verified} />
              </div>
              <div
                className={`mt-3 flex items-center gap-2 text-sm ${
                  form.available ? "text-emerald-600" : "text-stone-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    form.available ? "bg-emerald-500" : "bg-stone-400"
                  }`}
                />
                {form.available ? "Available" : "Unavailable"}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Edit details" />
          <CardBody>
            <form onSubmit={save} className="space-y-4">
              <Input
                label="Full name"
                name="fullName"
                value={form.fullName ?? ""}
                onChange={(e) => set("fullName", e.target.value)}
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Blood group"
                  name="bloodGroup"
                  value={form.bloodGroup ?? "O_POS"}
                  onChange={(e) => set("bloodGroup", e.target.value)}
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bloodGroupLabel(bg)} ({bg})
                    </option>
                  ))}
                </Select>
                <Input
                  label="Phone"
                  name="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>

              <LocationFields values={form} onChange={set} />

              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.available)}
                  onChange={(e) => set("available", e.target.checked)}
                  className="accent-pulse"
                />
                Available to donate
              </label>

              <div className="pt-2">
                <Button type="submit" loading={saving}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

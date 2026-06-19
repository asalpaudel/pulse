import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplet, Hospital, Building2, Check, AlertCircle } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Input, Select } from "../components/ui/Input";
import Button from "../components/ui/Button";
import LocationFields from "../components/LocationFields";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../lib/routes";
import { BLOOD_GROUPS, bloodGroupLabel } from "../lib/constants";

// Selectable roles at registration — ADMIN accounts are provisioned, not self-served.
const REGISTERABLE_ROLES = [
  { value: "DONOR", label: "Donor", desc: "Give blood, get matched alerts", icon: Droplet },
  { value: "HOSPITAL", label: "Hospital", desc: "Post requests, find donors", icon: Hospital },
  {
    value: "BLOOD_BANK",
    label: "Blood Bank",
    desc: "Manage stock, run events",
    icon: Building2,
  },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("DONOR");
  const [account, setAccount] = useState({ email: "", password: "", confirm: "" });
  const [profile, setProfile] = useState({
    fullName: "",
    name: "",
    bloodGroup: "O_POS",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAcc = (k) => (e) =>
    setAccount((a) => ({ ...a, [k]: e.target.value }));
  const setProf = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const goToProfile = (e) => {
    e.preventDefault();
    setError("");
    if (account.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (account.password !== account.confirm) {
      setError("Passwords do not match");
      return;
    }
    setStep(2);
  };

  // Build the role-specific `profile` object per API_CONTRACT.md entities.
  const buildProfile = () => {
    const lat = profile.latitude ? Number(profile.latitude) : null;
    const lng = profile.longitude ? Number(profile.longitude) : null;
    if (role === "DONOR") {
      return {
        fullName: profile.fullName,
        bloodGroup: profile.bloodGroup,
        phone: profile.phone,
        address: profile.address,
        latitude: lat,
        longitude: lng,
        available: true,
      };
    }
    // HOSPITAL & BLOOD_BANK share the institutional shape.
    return {
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      latitude: lat,
      longitude: lng,
    };
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({
        email: account.email,
        password: account.password,
        role,
        profile: buildProfile(),
      });
      navigate(homePathForRole(data.role), { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 1 ? "Create your account" : "Tell us about you"}
      subtitle={
        step === 1
          ? "Choose a role to get started"
          : "These details power matching and verification"
      }
      footer={
        step === 1 ? (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-tertiary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="font-medium text-tertiary hover:underline"
          >
            ← Back to account details
          </button>
        )
      }
    >
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-3" aria-hidden="true">
        {[1, 2].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${
                step >= s
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {step > s ? <Check size={14} strokeWidth={3} /> : s}
            </span>
            <span
              className={`text-xs font-medium ${
                step >= s ? "text-secondary" : "text-neutral-400"
              }`}
            >
              {s === 1 ? "Account" : "Profile"}
            </span>
            {s === 1 && (
              <span
                className={`h-px flex-1 transition ${
                  step > 1 ? "bg-primary/40" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-700">
          <AlertCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={goToProfile} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-secondary">I am a…</p>
            <div className="grid gap-2.5">
              {REGISTERABLE_ROLES.map((r) => {
                const selected = role === r.value;
                const Icon = r.icon;
                return (
                  <label
                    key={r.value}
                    className={`group flex cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-3 transition ${
                      selected
                        ? "border-primary bg-primary-50 shadow-sm ring-1 ring-primary/20"
                        : "border-neutral-200 bg-white hover:border-primary-200 hover:bg-blush-soft"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={selected}
                      onChange={() => setRole(r.value)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                        selected
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-neutral-500 group-hover:text-primary"
                      }`}
                    >
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-secondary">
                        {r.label}
                      </span>
                      <span className="block text-xs text-neutral-600">
                        {r.desc}
                      </span>
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-neutral-300"
                      }`}
                    >
                      {selected && <Check size={12} strokeWidth={3} />}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={account.email}
            onChange={setAcc("email")}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={account.password}
            onChange={setAcc("password")}
            placeholder="At least 6 characters"
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirm"
            value={account.confirm}
            onChange={setAcc("confirm")}
            placeholder="Re-enter password"
            required
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submit} className="space-y-4">
          {role === "DONOR" ? (
            <>
              <Input
                label="Full name"
                name="fullName"
                value={profile.fullName}
                onChange={(e) => setProf("fullName", e.target.value)}
                placeholder="Asha Sharma"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Blood group"
                  name="bloodGroup"
                  value={profile.bloodGroup}
                  onChange={(e) => setProf("bloodGroup", e.target.value)}
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
                  value={profile.phone}
                  onChange={(e) => setProf("phone", e.target.value)}
                  placeholder="98XXXXXXXX"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <Input
                label={role === "HOSPITAL" ? "Hospital name" : "Blood bank name"}
                name="name"
                value={profile.name}
                onChange={(e) => setProf("name", e.target.value)}
                placeholder={
                  role === "HOSPITAL"
                    ? "Bir Hospital"
                    : "Central Blood Bank"
                }
                required
              />
              <Input
                label="Contact phone"
                name="phone"
                value={profile.phone}
                onChange={(e) => setProf("phone", e.target.value)}
                placeholder="01-XXXXXXX"
                required
              />
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Institutional accounts require administrator verification
                before gaining full access.
              </p>
            </>
          )}

          <LocationFields values={profile} onChange={setProf} />

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

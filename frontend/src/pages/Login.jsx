import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../lib/routes";

export default function Login() {
  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      if (data.twoFactorRequired) {
        setChallenge(data);
        return;
      }
      const dest = location.state?.from?.pathname || homePathForRole(data.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await verifyTwoFactor({ challengeId: challenge.challengeId, code });
      const dest = location.state?.from?.pathname || homePathForRole(data.role);
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to verify the security code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={challenge ? "Security check" : "Ready to help?"}
      subtitle={challenge ? "Enter the code sent to your Super Admin email." : "Access your Pulse dashboard"}
      footer={
        <>
          New to Pulse?{" "}
          <Link to="/register" className="font-medium text-tertiary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={challenge ? submitCode : submit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-700">
            <AlertCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {challenge ? (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-tertiary-100 bg-tertiary-50 p-4 text-tertiary-800">
              <ShieldCheck size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">Your password was accepted. This second step protects access to platform-wide controls.</p>
            </div>
            <Input
              label="Six-digit security code"
              name="twoFactorCode"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </>
        ) : <><Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={set("password")}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-semibold text-tertiary hover:underline">Forgot password?</Link>
        </div></>}
        <Button type="submit" className="w-full" loading={loading}>
          {challenge ? "Verify and sign in" : "Sign in"}
        </Button>
        {challenge && (
          <button type="button" onClick={() => { setChallenge(null); setCode(""); setError(""); }} className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-neutral-600 hover:text-ink">
            <ArrowLeft size={15} /> Back to sign in
          </button>
        )}
      </form>
    </AuthShell>
  );
}

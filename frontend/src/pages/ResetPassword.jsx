import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import * as authApi from "../api/auth";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      setComplete(true);
    } catch (err) {
      setError(err.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title={complete ? "Password updated" : "Choose a new password"} subtitle={complete ? "Your account is secure and ready." : "Use a strong password you do not use anywhere else."}>
      {complete ? (
        <div className="space-y-5 rounded-2xl border border-tertiary-100 bg-tertiary-50 p-5">
          <CheckCircle2 size={30} className="text-tertiary" />
          <p className="text-sm leading-relaxed text-neutral-600">Your password has been changed. The recovery link cannot be used again.</p>
          <Link to="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 font-semibold text-white">Continue to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!token && <div className="flex gap-2 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700"><AlertCircle size={17} className="shrink-0" /> This recovery link is incomplete. Request a new one.</div>}
          {error && <div className="flex gap-2 rounded-xl border border-primary-200 bg-primary-50 p-3 text-sm text-primary-700"><AlertCircle size={17} className="shrink-0" /> {error}</div>}
          <Input label="New password" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="8+ characters with uppercase, lowercase, and a number" autoComplete="new-password" required />
          <Input label="Confirm new password" type="password" name="confirmPassword" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          <Button type="submit" className="w-full" loading={loading} disabled={!token}>Reset password</Button>
        </form>
      )}
    </AuthShell>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import AuthShell from "../components/AuthShell";
import { Input } from "../components/ui/Input";
import Button from "../components/ui/Button";
import * as authApi from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Recover your account" subtitle="A secure, single-use link will help you choose a new password." footer={<Link to="/login" className="inline-flex items-center gap-2 font-semibold text-tertiary hover:underline"><ArrowLeft size={15} /> Back to sign in</Link>}>
      {sent ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-tertiary-100 bg-tertiary-50 p-5">
            <CheckCircle2 size={28} className="text-tertiary" />
            <h2 className="mt-4 font-display text-xl font-bold text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">If an account exists for <strong className="text-ink">{email}</strong>, a reset link is on its way. It expires in 15 minutes.</p>
          </div>
          <button type="button" onClick={() => setSent(false)} className="w-full text-sm font-semibold text-tertiary hover:underline">Use a different email</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-hairline bg-white p-4 text-sm text-neutral-600">
            <Mail size={19} className="mt-0.5 shrink-0 text-primary" />
            <p>For privacy, Pulse always shows the same confirmation whether or not an account exists.</p>
          </div>
          <Input label="Account email" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}

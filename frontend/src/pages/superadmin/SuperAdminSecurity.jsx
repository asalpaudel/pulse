import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card, { CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import * as superAdminApi from "../../api/superadmin";

export default function SuperAdminSecurity() {
  const [status, setStatus] = useState(null);
  const [action, setAction] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    superAdminApi.getSecurityStatus().then(setStatus).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const begin = async () => {
    const nextAction = status.enabled ? "DISABLE" : "ENABLE";
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await superAdminApi.requestTwoFactorCode(nextAction);
      setAction(nextAction);
      setNotice(`A six-digit confirmation code was sent to ${status.email}.`);
    } catch (err) {
      setError(err.message || "Unable to send security code");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const next = await superAdminApi.confirmTwoFactor(action, code);
      setStatus(next);
      setAction(null);
      setCode("");
      setNotice(`Two-factor authentication is now ${next.enabled ? "enabled" : "disabled"}.`);
    } catch (err) {
      setError(err.message || "Unable to verify security code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader overline="Superadmin · Security" title="Protect the owner account" subtitle="Require a second, time-limited email code before platform-wide access is granted." />

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-ink/15">
          <div className={`h-1.5 ${status?.enabled ? "bg-tertiary" : "bg-primary"}`} />
          <CardBody className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${status?.enabled ? "bg-tertiary-50 text-tertiary" : "bg-primary-50 text-primary"}`}>
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <p className="font-display text-xl font-bold text-ink">Email two-factor authentication</p>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-600">After your password is accepted, Pulse sends a one-time code to the owner email. No Super Admin session exists until that code is verified.</p>
                  <span className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${status?.enabled ? "bg-tertiary-50 text-tertiary-800" : "bg-neutral-100 text-neutral-600"}`}>
                    {status?.enabled ? <CheckCircle2 size={14} /> : <LockKeyhole size={14} />}
                    {loading && !status ? "Checking" : status?.enabled ? "Protection active" : "Protection off"}
                  </span>
                </div>
              </div>
              {!action && status && <Button onClick={begin} loading={loading} variant={status.enabled ? "outline" : "primary"}>{status.enabled ? "Disable 2FA" : "Enable 2FA"}</Button>}
            </div>

            {(error || notice) && <div className={`mt-6 flex items-start gap-2 rounded-xl border p-3 text-sm ${error ? "border-primary-200 bg-primary-50 text-primary-700" : "border-tertiary-100 bg-tertiary-50 text-tertiary-800"}`}>{error ? <AlertCircle size={17} className="shrink-0" /> : <CheckCircle2 size={17} className="shrink-0" />}<span>{error || notice}</span></div>}

            {action && (
              <form onSubmit={confirm} className="mt-6 max-w-md space-y-4 rounded-2xl border border-hairline bg-paper p-5">
                <div className="flex items-center gap-3"><KeyRound size={20} className="text-primary" /><p className="font-semibold text-ink">Confirm {action === "ENABLE" ? "activation" : "deactivation"}</p></div>
                <Input label="Six-digit email code" name="securityCode" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" inputMode="numeric" autoComplete="one-time-code" required />
                <div className="flex gap-3"><Button type="submit" loading={loading} disabled={code.length !== 6}>Confirm change</Button><Button variant="ghost" onClick={() => { setAction(null); setCode(""); setError(""); }}>Cancel</Button></div>
              </form>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <Mail size={22} className="text-primary" />
            <p className="mt-4 font-display text-lg font-bold text-ink">Delivery account</p>
            <p className="mt-2 break-all text-sm font-semibold text-neutral-700">{status?.email || "Loading…"}</p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">Codes expire after 10 minutes and lock after repeated invalid attempts.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

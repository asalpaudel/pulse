import { useEffect, useState } from "react";
import { ArrowRight, Check, Droplets, X } from "lucide-react";
import { subscribe } from "../api/newsletter";

const STORAGE_KEY = "pulse_newsletter_prompt";
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (Date.now() - lastSeen < FOURTEEN_DAYS) return undefined;
    const timer = window.setTimeout(() => setVisible(true), 6500);
    return () => window.clearTimeout(timer);
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await subscribe({ email, source: "landing-popup" });
      setStatus("success");
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (err) {
      setError(err.message || "We couldn't subscribe you right now.");
      setStatus("idle");
    }
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="newsletter-title"
      className="fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#191615] text-white shadow-[0_28px_90px_rgba(31,18,18,0.36)] sm:left-auto sm:right-6"
    >
      <div className="h-1.5 bg-primary" />
      <button onClick={close} type="button" aria-label="Close newsletter prompt" className="absolute right-4 top-5 rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white">
        <X size={17} />
      </button>
      <div className="p-6 sm:p-7">
        {status === "success" ? (
          <div className="py-3">
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white"><Check size={21} /></span>
            <h2 id="newsletter-title" className="font-display text-2xl font-semibold">You’re on the pulse.</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">Important donation updates and community stories will find their way to your inbox.</p>
            <button type="button" onClick={close} className="mt-5 text-sm font-semibold text-primary-300 hover:text-white">Done</button>
          </div>
        ) : (
          <>
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary"><Droplets size={20} /></span>
            <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-primary-300">STORIES THAT MOVE BLOOD</p>
            <h2 id="newsletter-title" className="max-w-xs font-display text-2xl font-semibold leading-tight">Stay close to the moments that matter.</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">Occasional updates on urgent needs, donation events, and the people Pulse brings together.</p>
            <form onSubmit={submit} className="mt-5">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <div className="flex rounded-2xl bg-white p-1.5">
                <input id="newsletter-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400" />
                <button disabled={status === "loading"} type="submit" aria-label="Subscribe" className="flex h-10 w-11 shrink-0 items-center justify-center rounded-xl bg-primary transition hover:bg-primary-700 disabled:opacity-60">
                  <ArrowRight size={18} />
                </button>
              </div>
              {error && <p role="alert" className="mt-2 text-xs text-primary-200">{error}</p>}
              <p className="mt-3 text-[10px] leading-4 text-white/35">No noise. Unsubscribe whenever you like.</p>
            </form>
          </>
        )}
      </div>
    </aside>
  );
}

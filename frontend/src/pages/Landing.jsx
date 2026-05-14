import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/ui/Button";

const FEATURES = [
  {
    title: "Real-time emergency alerts",
    body: "When a hospital posts an emergency request, matching donors and nearby blood banks are alerted instantly over a live WebSocket channel.",
  },
  {
    title: "Donor matching by group & proximity",
    body: "Donors register with blood group, location and availability. Hospitals search and reach the right people fast.",
  },
  {
    title: "Live blood inventory",
    body: "Blood banks maintain stock by blood group. Hospitals see what's actually available nearby — no guesswork.",
  },
  {
    title: "Request lifecycle tracking",
    body: "Every request moves through OPEN → MATCHED → FULFILLED → CLOSED, with responses reflected live.",
  },
  {
    title: "Donation events",
    body: "Blood banks run collection drives and campaigns. Donors browse and enroll in a couple of taps.",
  },
  {
    title: "Verified institutions",
    body: "Administrators verify hospital and blood bank accounts, keeping the network trustworthy.",
  },
];

const ROLES = [
  { name: "Donors", desc: "Manage availability, receive matched alerts, track your donation history." },
  { name: "Hospitals", desc: "Post emergency & routine requests, search donors and blood banks, track fulfillment." },
  { name: "Blood Banks", desc: "Maintain live stock, respond to requests, organize donation events." },
  { name: "Administrators", desc: "Verify institutions, manage users, monitor platform activity." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo withText />
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pulse/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-pulse/10 px-3 py-1 text-xs font-semibold text-pulse">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pulse" />
              Real-time blood coordination
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-stone-900 lg:text-5xl">
              Get blood where it's needed,{" "}
              <span className="text-pulse">faster</span>.
            </h1>
            <p className="mt-5 text-lg text-stone-600">
              Pulse connects donors, hospitals, blood banks and emergency
              responders in one centralized real-time system — closing the gaps
              that slow down blood access during emergencies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button size="lg">Create an account</Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900">
            Why Pulse exists
          </h2>
          <p className="mt-3 max-w-3xl text-stone-600">
            Access to blood during emergencies is delayed by fragmented donor
            databases, manual phone calls, and weak coordination between
            hospitals and blood banks. Existing platforms list donors but don't
            integrate inventory, track availability, or alert in real time.
            Pulse handles emergency requests, donor matching, institutional
            integration and routine donation workflows together.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold text-stone-900">What Pulse does</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-pulse/10 text-pulse">
                <span className="h-2 w-2 rounded-full bg-pulse" />
              </div>
              <h3 className="font-semibold text-stone-900">{f.title}</h3>
              <p className="mt-2 text-sm text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold text-stone-900">
            Built for four roles
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r) => (
              <div key={r.name} className="border-l-2 border-pulse pl-4">
                <h3 className="font-semibold text-stone-900">{r.name}</h3>
                <p className="mt-1 text-sm text-stone-600">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl bg-pulse px-8 py-12 text-center text-white lg:px-16">
          <h2 className="text-2xl font-bold lg:text-3xl">
            Join the network. Save time. Save lives.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pulse-light/90 text-white/80">
            Whether you donate, run a hospital, manage a blood bank or
            administer the system — Pulse gives you the coordination layer
            you've been missing.
          </p>
          <div className="mt-6">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Get started — it's free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-stone-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5" />
            <span>Pulse — real-time blood coordination platform</span>
          </div>
          <span>Built for faster, more reliable emergency blood access.</span>
        </div>
      </footer>
    </div>
  );
}

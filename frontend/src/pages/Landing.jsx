import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "../assets/hero-donation.png";

// =========================================================================
//  Pulse — premium editorial landing
//  Palette is scoped here via arbitrary Tailwind values so the rest of the
//  app keeps its existing red/blush system untouched.
//
//    cream  #F4F0EA      ink     #171717     oxblood   #6E0F16
//    white  #FFFFFF      red     #D71920     blush     #F8E7E7
//    beige  #C9B79D      muted   #6F6F6F     border    #D8D2CB
//    green  #2E7D57      amber   #C77A1A
// =========================================================================

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({ children, className = "", delay = 0, amount = 0.2 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------- pill button with circular arrow ----------
function ArrowCircle({ tone = "white", size = "md" }) {
  const dim = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  const bg = tone === "white" ? "bg-white text-[#171717]" : "bg-[#171717] text-white";
  return (
    <span className={`flex ${dim} items-center justify-center rounded-full ${bg}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

function PillBtn({ children, variant = "dark", size = "md", as = "button", to, ...rest }) {
  const sizes = {
    md: "pl-5 pr-1.5 py-1.5 text-sm",
    lg: "pl-7 pr-2 py-2 text-base",
  };
  const variants = {
    dark: "bg-[#171717] text-white hover:bg-black",
    light: "bg-white text-[#171717] hover:bg-[#F4F0EA]",
    oxblood: "bg-[#6E0F16] text-white hover:bg-[#5a0c12]",
    red: "bg-[#D71920] text-white hover:bg-[#bf131a]",
    ghost: "bg-transparent text-[#171717] border border-[#171717]/30 hover:border-[#171717] hover:bg-[#171717]/5",
  };
  const innerCircle = variant === "light" || variant === "ghost" ? "dark" : "white";
  const cls = `inline-flex items-center gap-3 rounded-full font-medium tracking-tight transition ${sizes[size]} ${variants[variant]}`;
  const inner = (
    <>
      <span>{children}</span>
      <ArrowCircle tone={innerCircle} size={size} />
    </>
  );
  if (as === "link" && to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button className={cls} {...rest}>{inner}</button>;
}

// ---------- placeholder photo (warm cinematic gradient stand-in) ----------
function PhotoPlaceholder({ tone = "warm", className = "", label }) {
  const tones = {
    warm: "bg-[radial-gradient(120%_120%_at_30%_20%,#E8D5BC_0%,#A9876A_45%,#3F2A1E_100%)]",
    dusk: "bg-[radial-gradient(120%_120%_at_20%_30%,#C9B79D_0%,#7A5347_55%,#2A1612_100%)]",
    blood: "bg-[radial-gradient(110%_110%_at_70%_30%,#C28A6B_0%,#6E0F16_55%,#1A0507_100%)]",
    cream: "bg-[radial-gradient(110%_110%_at_30%_20%,#F4E7D4_0%,#C9B79D_50%,#8A6A4C_100%)]",
    ash: "bg-[radial-gradient(120%_120%_at_50%_20%,#3A2F2A_0%,#1A1311_60%,#000_100%)]",
  };
  return (
    <div className={`relative overflow-hidden ${tones[tone]} ${className}`}>
      <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}

// ---------- inline Pulse mark for the dark nav ----------
function PulseMark({ className = "h-7 w-7", color = "white" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M16 3C16 3 5.5 13.5 5.5 21a10.5 10.5 0 0021 0C26.5 13.5 16 3 16 3Z" fill={color === "white" ? "#fff" : "#6E0F16"} />
        <path d="M9 20.5h3l2-4 3 8 2.5-5H24" stroke={color === "white" ? "#171717" : "#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`text-lg font-semibold tracking-tight ${color === "white" ? "text-white" : "text-[#171717]"}`}>Pulse</span>
    </span>
  );
}

// =========================================================================
//  SECTION 1 — Hero
// =========================================================================
function Hero() {
  const navItems = ["What's included", "How it works", "For donors", "For hospitals", "Blood banks", "FAQ"];
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#1A100B] text-white">
      <motion.img
        src={heroImg}
        alt=""
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover object-right"
        loading="eager"
      />
      {/* Vertical wash so nav + bottom CTA stay legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/70" />
      {/* Strong left-side ink wash so the headline reads cleanly over imagery */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/0" />

      {/* Nav */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 lg:px-12">
        <PulseMark />
        <nav className="hidden items-center gap-1 text-[13px] text-white/80 lg:flex">
          {navItems.map((n, i) => (
            <span key={n} className="flex items-center gap-1">
              <a href={`#${n.replace(/\W+/g, "").toLowerCase()}`} className="px-2 py-1 hover:text-white">
                {n}
              </a>
              {i < navItems.length - 1 && <span className="text-white/30">•</span>}
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-[13px] text-white/80 hover:text-white sm:inline-block">
            Sign in
          </Link>
          <PillBtn as="link" to="/register" variant="dark" size="md">
            Request Blood
          </PillBtn>
        </div>
      </header>

      {/* Hero body */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-96px)] w-full max-w-[1440px] flex-col justify-between px-6 pb-12 pt-10 lg:px-12 lg:pb-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          className="max-w-3xl"
        >
          <motion.h1 variants={fadeUp} className="font-semibold tracking-[-0.04em] text-white text-[clamp(3rem,9vw,8.5rem)] leading-[0.92]">
            Find Blood.<br />
            <span className="text-white">Faster.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-md text-lg font-light text-white/85 lg:text-xl">
            When minutes matter — Pulse connects urgent requests to verified donors, hospitals, and blood banks in real time.
          </motion.p>
        </motion.div>

        {/* Bottom row */}
        <Reveal delay={0.45} className="mt-16 grid gap-10 lg:grid-cols-[1.1fr,1fr] lg:items-end">
          {/* Feature rows */}
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { t: "Real-Time Matching", b: "Find nearby compatible donors without endless calls." },
              { t: "Verified Requests", b: "Hospital-backed details keep every request clear and trusted." },
              { t: "Live Coordination", b: "Track donors, blood banks, and request status in one place." },
            ].map((f, i) => (
              <div key={f.t} className="border-t border-white/25 pt-4">
                <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-[11px] text-white/80">
                  0{i + 1}
                </div>
                <h3 className="text-sm font-semibold tracking-tight text-white">{f.t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-white/65">{f.b}</p>
              </div>
            ))}
          </div>

          {/* Right CTA */}
          <div className="lg:text-right">
            <p className="text-2xl font-semibold leading-tight tracking-tight text-white lg:text-[28px]">
              Your city has lifesavers —<br />
              <span className="text-white/70">we help you find them.</span>
            </p>
            <div className="mt-6 flex lg:justify-end">
              <PillBtn as="link" to="/register" variant="light" size="lg">
                Join the Donor Network
              </PillBtn>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 2 — Editorial intro
// =========================================================================
function EditorialIntro() {
  return (
    <section className="bg-[#F4F0EA]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-28 lg:px-12 lg:py-40">
        <Reveal>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#171717]" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15" />
            </svg>
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#171717]/80">
              Ready to respond when blood is needed most?
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-10 max-w-[18ch] text-[clamp(2.4rem,6.6vw,6.4rem)] font-semibold leading-[0.96] tracking-[-0.035em] text-[#171717]">
            A real-time blood donation platform<span className="text-[#6E0F16]">.</span><br />
            <span className="text-[#171717]/85">For people, donors, and healthcare teams.</span>
          </h2>
        </Reveal>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 3 — Horizontal blood-type cards
// =========================================================================
const BLOOD_CARDS = [
  { type: "O+", tag: "Most Requested", label: "Emergency Match", desc: "The most common request across active emergencies.", tone: "warm" },
  { type: "O-", tag: "Universal", label: "Critical Supply", desc: "Priority match for trauma and emergency care.", tone: "blood" },
  { type: "A+", tag: "Compatible", label: "Ready Donors", desc: "Compatible donors are typically available nearby.", tone: "cream" },
  { type: "B+", tag: "Active", label: "Active Request", desc: "Hospitals coordinate quickly for B+ matches.", tone: "warm" },
  { type: "AB-", tag: "Rare", label: "Priority Alert", desc: "Rare blood-type requests need faster discovery.", tone: "dusk" },
  { type: "A-", tag: "Low Stock", label: "Blood Bank Alert", desc: "Nearby supply runs low — donors fill the gap.", tone: "blood" },
];

function BloodTypeRow() {
  return (
    <section className="bg-[#F4F0EA]">
      <div className="mx-auto w-full max-w-[1440px] px-6 pt-4 lg:px-12">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#171717]/60">By blood type</span>
              <h3 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[#171717] lg:text-[40px]">
                Every group matters. Every match counts.
              </h3>
            </div>
            <div className="hidden text-xs text-[#6F6F6F] sm:block">Scroll →</div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.05}>
        <div className="mt-10 overflow-x-auto pb-20">
          <div className="flex gap-5 px-6 lg:px-12" style={{ width: "max-content" }}>
            {BLOOD_CARDS.map((c) => (
              <article key={c.type} className="group relative h-[460px] w-[300px] shrink-0 overflow-hidden rounded-3xl">
                <PhotoPlaceholder tone={c.tone} className="absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/70" />
                <div className="relative flex h-full flex-col justify-between p-5 text-white">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[64px] font-semibold leading-none tracking-tight">{c.type}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/75">{c.tag}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className={`h-1.5 w-1.5 ${i === 0 ? "bg-[#D71920]" : "bg-white/40"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 h-px w-full bg-white/40" />
                  </div>
                  <div>
                    <div className="text-base font-semibold tracking-tight">{c.label}</div>
                    <p className="mt-1.5 text-[13px] leading-snug text-white/80">{c.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// =========================================================================
//  SECTION 4 — Anyone. Anywhere. (dotted 4-col grid)
// =========================================================================
function AnyoneAnywhere() {
  const cols = [
    {
      icon: (
        <path d="M3 12a9 9 0 1 0 9-9M12 12l5-3" />
      ),
      title: "No Waiting. No Confusion.",
      body: "Create urgent blood requests with clear, verified details.",
    },
    {
      icon: <path d="M5 12h.01M12 12h.01M19 12h.01M5 12c0-3 3-5 7-5s7 2 7 5-3 5-7 5-7-2-7-5Z" />,
      title: "Smarter Than Social Posts",
      body: "Match by blood group, distance, urgency, and availability.",
    },
    {
      icon: <path d="M12 2v20M2 12h20" />,
      title: "Tailored to Every Role",
      body: "Built for patients, donors, hospitals, and blood banks.",
    },
    {
      icon: <path d="M12 21s-7-4.35-7-10a7 7 0 0 1 14 0c0 5.65-7 10-7 10Z M12 11v.01" />,
      title: "Always-On Awareness",
      body: "See request progress, donor responses, and supply status live.",
    },
  ];

  return (
    <section className="bg-[#F4F0EA]">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-32 lg:px-12">
        <Reveal>
          <h2 className="max-w-[20ch] text-[clamp(2rem,5.4vw,4.8rem)] font-semibold leading-[1] tracking-[-0.035em] text-[#171717]">
            Anyone. Anywhere.<br />
            <span className="text-[#171717]/70">Every blood type, every urgent request.</span>
          </h2>
        </Reveal>

        <div className="mt-20 border-t border-dashed border-[#D8D2CB]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {cols.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.06}>
                <div className={`relative px-2 py-10 lg:px-8 lg:py-14 ${i > 0 ? "lg:border-l lg:border-dashed lg:border-[#D8D2CB]" : ""}`}>
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#171717]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    {c.icon}
                  </svg>
                  <div className="mt-24 lg:mt-32">
                    <h3 className="text-xl font-semibold tracking-tight text-[#171717]">{c.title}</h3>
                    <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-[#6F6F6F]">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 5 — Black "What If" arc storytelling
// =========================================================================
const ARC_STATES = [
  { n: 1, label: "Instant", body: "Urgent requests reach matching donors in seconds." },
  { n: 2, label: "Verified", body: "Hospitals and admins help keep requests clear and trusted." },
  { n: 3, label: "Accessible", body: "Nearby donors and blood banks become easier to find." },
  { n: 4, label: "Intelligent", body: "Blood type, distance, urgency, and availability guide every match." },
  { n: 5, label: "Human", body: "Families, donors, and hospitals coordinate with less stress." },
];

function WhatIfArc() {
  const [active, setActive] = useState(0);
  const current = ARC_STATES[active];

  return (
    <section className="relative overflow-hidden bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-40 pt-32 lg:px-12 lg:pb-56 lg:pt-44">
        <Reveal>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">A new model</span>
          <h2 className="mt-4 text-[clamp(2.6rem,7.2vw,7rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            What if<br />
            <span className="text-white/55">blood donation was …</span>
          </h2>
        </Reveal>

        {/* Arc */}
        <div className="relative mt-28 lg:mt-36">
          <svg viewBox="0 0 1200 320" className="w-full" preserveAspectRatio="none">
            <path d="M -100 320 Q 600 -120 1300 320" fill="none" stroke="#2a2a2a" strokeWidth="1.4" />
          </svg>
          {/* Nodes — positioned along arc */}
          {ARC_STATES.map((s, i) => {
            const positions = [
              { left: "8%", top: "78%" },
              { left: "28%", top: "32%" },
              { left: "50%", top: "12%" },
              { left: "72%", top: "32%" },
              { left: "92%", top: "78%" },
            ];
            const p = positions[i];
            const isActive = i === active;
            return (
              <button
                key={s.n}
                onClick={() => setActive(i)}
                style={{ left: p.left, top: p.top }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-full border text-sm font-medium transition lg:h-14 lg:w-14 ${
                      isActive
                        ? "border-white bg-white text-[#050505]"
                        : "border-white/30 bg-[#0d0d0d] text-white/70 hover:border-white/60"
                    }`}
                  >
                    {s.n}
                    {isActive && (
                      <span className="absolute -inset-2 -z-10 rounded-full bg-[#6E0F16]/40 blur-xl" />
                    )}
                  </div>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#D71920]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active state copy */}
        <motion.div
          key={current.n}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto mt-16 max-w-xl text-center"
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">0{current.n} / 05</div>
          <div className="mt-4 text-[44px] font-semibold tracking-tight lg:text-[60px]">{current.label}</div>
          <p className="mt-3 text-base text-white/70 lg:text-lg">{current.body}</p>
        </motion.div>

        <div className="mt-12 flex justify-center gap-2">
          {ARC_STATES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1 w-8 rounded-full transition ${i === active ? "bg-white" : "bg-white/20"}`}
              aria-label={`State ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 6 — Emotional split (image left / beige right)
// =========================================================================
function EmotionalSplit() {
  return (
    <section className="bg-[#C9B79D]">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 lg:grid-cols-2">
        <PhotoPlaceholder tone="blood" className="min-h-[420px] lg:min-h-[680px]" label="hand reaching pulse line" />
        <div className="flex flex-col justify-between gap-16 px-6 py-20 lg:px-16 lg:py-28">
          <Reveal>
            <h2 className="text-[clamp(2.6rem,6.4vw,6.4rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[#171717]">
              Everyone<span className="text-[#6E0F16]">.</span><br />
              Everywhere<span className="text-[#6E0F16]">.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-md">
              <p className="text-base leading-relaxed text-[#2a2018]">
                Blood support shouldn't be limited by time, location, or scattered contacts. When a patient needs blood, the right people should be easier to reach.
              </p>
              <div className="mt-7">
                <PillBtn as="link" to="/register" variant="dark" size="lg">
                  Become a Donor
                </PillBtn>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 7 — Dashboard showcase
// =========================================================================
function StatusPill({ label, tone }) {
  const tones = {
    red: "bg-[#FCE7E8] text-[#D71920]",
    ox: "bg-[#F4D9DB] text-[#6E0F16]",
    green: "bg-[#E0F0E8] text-[#2E7D57]",
    amber: "bg-[#F8E9D6] text-[#C77A1A]",
    gray: "bg-[#EFEBE6] text-[#6F6F6F]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {label}
    </span>
  );
}

function DashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="rounded-[28px] bg-[#171717] p-3 shadow-[0_60px_120px_-40px_rgba(0,0,0,0.45)] ring-1 ring-black/30">
        <div className="overflow-hidden rounded-[20px] bg-white">
          <div className="grid grid-cols-[180px,1fr]">
            {/* Sidebar */}
            <div className="bg-[#0e0c0c] p-4 text-white/80">
              <div className="mb-6 flex items-center gap-2">
                <PulseMark className="h-5 w-5" />
              </div>
              {[
                ["Dashboard", true],
                ["Requests", false],
                ["Donors", false],
                ["Hospitals", false],
                ["Blood Banks", false],
                ["Messages", false],
                ["Settings", false],
              ].map(([name, active]) => (
                <div
                  key={name}
                  className={`mb-1 rounded-md px-2.5 py-1.5 text-[11px] ${
                    active ? "bg-[#6E0F16] text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="p-5">
              {/* Top tabs + actions */}
              <div className="flex items-center justify-between border-b border-[#EFEBE6] pb-3">
                <div className="flex gap-3 text-[11px] text-[#6F6F6F]">
                  {["Overview", "Requests", "Donors", "Blood Banks", "Messages"].map((t, i) => (
                    <span key={t} className={i === 0 ? "font-semibold text-[#171717]" : ""}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button className="rounded-md border border-[#D8D2CB] px-2 py-1 text-[10px] text-[#171717]">Export</button>
                  <button className="rounded-md border border-[#D8D2CB] px-2 py-1 text-[10px] text-[#171717]">Share</button>
                  <button className="rounded-md bg-[#171717] px-2 py-1 text-[10px] text-white">Create Request</button>
                </div>
              </div>

              <h4 className="mt-4 text-base font-semibold tracking-tight text-[#171717]">25 Active Blood Requests</h4>

              <div className="mt-3 grid grid-cols-[1fr,1.3fr] gap-3">
                {/* Left request card */}
                <div className="rounded-xl border border-[#EFEBE6] p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#6E0F16] px-1.5 py-0.5 text-[10px] font-semibold text-white">O+</span>
                    <StatusPill label="Critical" tone="red" />
                  </div>
                  <div className="mt-3 text-[11px] font-medium text-[#171717]">Emergency Request</div>
                  <div className="mt-1 space-y-0.5 text-[10px] text-[#6F6F6F]">
                    <div>Blood Type · O+</div>
                    <div>Units Needed · 2</div>
                    <div>Urgency · Critical</div>
                    <div>Status · Verified</div>
                  </div>
                  <button className="mt-3 w-full rounded-md bg-[#171717] py-1.5 text-[10px] text-white">Find Donors</button>
                </div>

                {/* Right — breakdown */}
                <div className="rounded-xl border border-[#EFEBE6] p-3">
                  <div className="text-[11px] font-semibold text-[#171717]">Request Breakdown</div>
                  <div className="mt-2 space-y-2">
                    {[
                      ["Donor matches", 92, "#2E7D57"],
                      ["Hospital verification", 88, "#6E0F16"],
                      ["Blood bank availability", 74, "#C77A1A"],
                      ["Distance coverage", 67, "#D71920"],
                      ["Response readiness", 61, "#171717"],
                    ].map(([label, pct, color]) => (
                      <div key={label}>
                        <div className="flex justify-between text-[10px] text-[#6F6F6F]">
                          <span>{label}</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-0.5 h-1 rounded-full bg-[#EFEBE6]">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="mt-4 overflow-hidden rounded-xl border border-[#EFEBE6]">
                <div className="grid grid-cols-5 bg-[#F7F4EF] px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-[#6F6F6F]">
                  <span>Type</span>
                  <span>Units</span>
                  <span>Hospital</span>
                  <span>Distance</span>
                  <span>Status</span>
                </div>
                {[
                  ["O+", 2, "City Care Hospital", "2.4 km", ["Matching", "amber"]],
                  ["A-", 1, "Valley Medical", "4.8 km", ["Verified", "ox"]],
                  ["B+", 3, "Metro Clinic", "6.1 km", ["Donor Confirmed", "green"]],
                  ["O-", 1, "Emergency Center", "3.2 km", ["Critical", "red"]],
                ].map(([type, u, h, d, [s, tone]]) => (
                  <div key={h} className="grid grid-cols-5 items-center border-t border-[#EFEBE6] px-3 py-2 text-[11px] text-[#171717]">
                    <span className="font-semibold text-[#6E0F16]">{type}</span>
                    <span>{u}</span>
                    <span className="text-[#6F6F6F]">{h}</span>
                    <span className="text-[#6F6F6F]">{d}</span>
                    <StatusPill label={s} tone={tone} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Floating accent */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-full bg-black/20 blur-2xl" />
    </div>
  );
}

function DashboardShowcase() {
  return (
    <section className="bg-[#F4F0EA]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-28 text-center lg:px-12 lg:py-40">
        <Reveal>
          <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#171717]/60">The dashboard</span>
          <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2.2rem,5.2vw,4.6rem)] font-semibold leading-[1] tracking-[-0.035em] text-[#171717]">
            Your blood coordination hub<span className="text-[#6E0F16]">.</span><br />
            <span className="text-[#171717]/70">Reimagined.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#6F6F6F]">
            Pulse brings urgent requests, donor matches, hospital verification, blood bank stock, and live request tracking into one simple dashboard.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-16">
            <DashboardMock />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 8 — Role-based tools
// =========================================================================
const ROLE_TABS = {
  "Request Blood": {
    title: "Request Blood",
    bullets: [
      "Create verified urgent requests",
      "Add blood type and units",
      "Choose hospital or location",
      "Track request status live",
      "See matched donors and blood bank options",
    ],
    phone: { title: "Urgent O+ Request", lines: ["2 units needed", "12 matching donors", "Status: Verified"], cta: "Find Donors" },
  },
  "Donate Blood": {
    title: "Donate Blood",
    bullets: [
      "Set blood group and availability",
      "Get matched to nearby urgent needs",
      "One-tap accept and confirmation",
      "See your donation history",
      "Eligibility reminders that respect timing",
    ],
    phone: { title: "Donor Match Alert", lines: ["O+ urgent · 1.8 km away", "Verified by City Care", "Status: Awaiting you"], cta: "Accept Match" },
  },
  "Hospital Tools": {
    title: "Hospital Tools",
    bullets: [
      "Verified request dashboard",
      "Donor response tracking",
      "Coordinate across departments",
      "Live status across active cases",
      "Audit-friendly request history",
    ],
    phone: { title: "ICU Coordination", lines: ["3 active requests", "Donor verified · 06:42", "Bank ETA · 18 min"], cta: "Open Case" },
  },
  "Blood Bank Tools": {
    title: "Blood Bank Tools",
    bullets: [
      "Live stock per blood group",
      "Respond to hospital requests",
      "Schedule donation drives",
      "Low-stock and rare-group alerts",
      "Distance-aware demand view",
    ],
    phone: { title: "Stock — Today", lines: ["O+ · 42 units", "A- · 8 units (low)", "AB- · 3 units (rare)"], cta: "Update Stock" },
  },
};

function RoleTabs() {
  const tabs = Object.keys(ROLE_TABS);
  const [active, setActive] = useState(tabs[0]);
  const data = ROLE_TABS[active];

  return (
    <section className="bg-[#F8E7E7]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-28 lg:px-12 lg:py-40">
        <Reveal>
          <h2 className="max-w-[20ch] text-[clamp(2.2rem,5.4vw,4.8rem)] font-semibold leading-[1] tracking-[-0.035em] text-[#171717]">
            Choose what you need<span className="text-[#6E0F16]">,</span><br />
            <span className="text-[#171717]/70">when you need it.</span>
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition ${
                active === t
                  ? "bg-[#6E0F16] text-white"
                  : "border border-[#171717]/20 bg-white text-[#171717] hover:border-[#171717]/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 grid gap-10 rounded-3xl bg-white p-8 lg:grid-cols-[1.2fr,1fr] lg:p-14"
        >
          <div>
            <h3 className="text-3xl font-semibold tracking-tight text-[#171717] lg:text-[42px]">{data.title}</h3>
            <ul className="mt-8 space-y-4">
              {data.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15px] text-[#171717]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6E0F16]" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Phone mock */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-[260px] rounded-[36px] bg-[#171717] p-2.5 shadow-2xl">
              <div className="overflow-hidden rounded-[28px] bg-[#F4F0EA]">
                <div className="flex items-center justify-between bg-[#6E0F16] px-4 py-3 text-white">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Pulse</span>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D71920]" />
                </div>
                <div className="space-y-3 p-4">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D71920]" />
                      <span className="text-[10px] uppercase tracking-wider text-[#6F6F6F]">Live</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#171717]">{data.phone.title}</div>
                    <div className="mt-2 space-y-1 text-[11px] text-[#6F6F6F]">
                      {data.phone.lines.map((l) => (
                        <div key={l}>{l}</div>
                      ))}
                    </div>
                    <button className="mt-4 w-full rounded-full bg-[#171717] py-2 text-[11px] text-white">{data.phone.cta}</button>
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <div className="text-[10px] text-[#6F6F6F]">Compatible types</div>
                    <div className="mt-1.5 flex gap-1.5">
                      {["O+", "A+", "B+", "AB+"].map((t) => (
                        <span key={t} className="rounded-md bg-[#F8E7E7] px-1.5 py-0.5 text-[10px] font-semibold text-[#6E0F16]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 9 — FAQ
// =========================================================================
const FAQS = [
  ["How does Pulse match blood donors?", "Pulse matches by blood group compatibility, distance, donor availability, and request urgency — all updated in real time as donors respond."],
  ["Can anyone become a donor?", "Anyone meeting basic eligibility criteria can register. Pulse sends timing-based reminders so you only donate when it's safe to do so."],
  ["Are emergency requests verified?", "Hospital-issued and admin-reviewed requests carry a verified badge so donors know who they're responding to."],
  ["Is my exact location private?", "Donors share approximate distance only. Exact location is never exposed to other users."],
  ["Can hospitals create verified requests?", "Yes — verified hospital accounts can post requests directly into the network with full case context."],
  ["Can blood banks update stock?", "Blood banks maintain live inventory per blood group, visible to nearby hospitals coordinating supply."],
  ["How quickly are alerts sent?", "Matching donors and nearby blood banks are alerted within seconds over a live WebSocket channel."],
  ["What happens after a donor accepts?", "The donor and hospital coordinate next steps in-app. Request status updates live for everyone involved."],
  ["Is Pulse free for donors?", "Yes. Pulse is free for individual donors. Hospital and blood bank tooling is offered to verified institutions."],
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-[#F4F0EA]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-28 lg:px-12 lg:py-40">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[1fr,1.5fr]">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#171717]/60">FAQ</span>
              <h2 className="mt-4 text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#171717]">
                Quick answers<span className="text-[#6E0F16]">.</span>
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#6F6F6F]">
                The details people most often ask before joining the network.
              </p>
            </div>
            <div className="divide-y divide-[#D8D2CB] border-y border-[#D8D2CB]">
              {FAQS.map(([q, a], i) => (
                <button
                  key={q}
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full bg-white px-5 py-5 text-left transition hover:bg-[#FBF9F5]"
                >
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-[15px] font-medium tracking-tight text-[#171717]">{q}</span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D8D2CB] text-[#171717] transition ${open === i ? "rotate-45 bg-[#171717] text-white" : ""}`}>
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pt-3 text-sm leading-relaxed text-[#6F6F6F]">{a}</p>
                  </motion.div>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// =========================================================================
//  SECTION 10 — Final CTA + footer
// =========================================================================
function FinalCTA() {
  return (
    <section className="bg-[#C9B79D]">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-28 lg:px-12 lg:py-40">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#171717]/60">Join Pulse</span>
            <h2 className="mt-4 text-[clamp(2.2rem,5.4vw,5rem)] font-semibold leading-[1] tracking-[-0.035em] text-[#171717]">
              Be ready before the<br />
              next emergency happens<span className="text-[#6E0F16]">.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-[#2a2018]">
              Join Pulse and become part of a faster, safer, and more connected blood donation network.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-12 max-w-3xl rounded-3xl bg-white p-6 shadow-sm lg:p-10"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Full Name", "Asal Paudel"],
                ["Email Address", "you@example.com"],
                ["Phone Number", "+977 98xxxxxxxx"],
              ].map(([label, placeholder]) => (
                <label key={label} className={`flex flex-col gap-1.5 ${label === "Full Name" ? "sm:col-span-2" : ""}`}>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6F6F6F]">{label}</span>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="rounded-xl border border-[#D8D2CB] bg-[#FBF9F5] px-4 py-3 text-sm text-[#171717] focus:border-[#6E0F16] focus:outline-none"
                  />
                </label>
              ))}
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#6F6F6F]">I am a</span>
                <select className="rounded-xl border border-[#D8D2CB] bg-[#FBF9F5] px-4 py-3 text-sm text-[#171717] focus:border-[#6E0F16] focus:outline-none">
                  <option>Donor</option>
                  <option>Patient / Family</option>
                  <option>Hospital</option>
                  <option>Blood Bank</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[#6F6F6F]">We'll only contact you with important updates. No spam.</p>
              <div className="flex gap-2">
                <PillBtn variant="ghost" size="md">Request a Demo</PillBtn>
                <PillBtn variant="dark" size="md">Join Pulse</PillBtn>
              </div>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Platform", links: ["What's Included", "How It Works", "For Donors", "For Hospitals", "Blood Banks"] },
    { title: "Company", links: ["About", "Contact", "Partners", "Careers"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Data Protection"] },
    { title: "Social", links: ["Instagram", "LinkedIn", "Facebook"] },
  ];
  return (
    <footer className="bg-[#171717] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr,2fr]">
          <div>
            <PulseMark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
              Pulse connects urgent blood requests with verified donors, hospitals, and blood banks in real time.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{c.title}</div>
                <ul className="mt-4 space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-white/55 hover:text-white">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <span>© 2026 Pulse. All rights reserved.</span>
          <span>Built for faster, more reliable emergency blood access.</span>
        </div>
      </div>
    </footer>
  );
}

// =========================================================================
//  Page
// =========================================================================
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F4F0EA] text-[#171717] antialiased">
      <Hero />
      <EditorialIntro />
      <BloodTypeRow />
      <AnyoneAnywhere />
      <WhatIfArc />
      <EmotionalSplit />
      <DashboardShowcase />
      <RoleTabs />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

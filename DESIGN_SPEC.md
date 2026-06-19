# Pulse — Dashboard Design Spec

The visual system for ALL authenticated dashboards (Donor, Hospital, Blood Bank, Admin). Derived from approved reference designs. Every agent restyling a role's pages MUST follow this so all four roles look like one product.

Colors/fonts are already defined in `tailwind.config.js` (`primary` red, `secondary` navy, `tertiary` blue, `neutral` taupe, `blush` surfaces) and Manrope is the base font. Icons: **`lucide-react`** (installed) — use it everywhere, ~18–20px, `strokeWidth ~1.8`.

---

## Layout

Full-height **sidebar + content** shell (replaces the current top-navbar layout):

- **Sidebar** — fixed, full viewport height, `w-64`, background `bg-blush-card` (light pink), thin right border `border-neutral-200`.
  - Top: the Pulse logo (red heart/shield droplet mark) + "Pulse" wordmark, with a small role subtitle under it — "Donor Portal" / "Hospital Portal" / "Blood Bank Portal" / "Admin Portal".
  - Nav items: lucide icon + label, generous padding, `rounded-lg`.
    - **Active item:** white background pill, **red left-accent bar** (`border-l-4 border-primary`), red text + red icon, subtle shadow.
    - **Inactive:** `text-neutral-600`, hover `bg-blush-soft`.
  - Pinned to the bottom (above a `border-neutral-200` divider): **Profile** and **Settings** links, same item style.
  - Mobile: slides in/out, backdrop `bg-secondary-900/50`.
- **Content area** — `bg-white` (or `bg-blush-soft` very light), its OWN top bar:
  - Top bar: white, bottom border `border-neutral-200`, holds a left page-area, and on the right a **search icon button** + **notification bell** (red unread dot). On mobile, a hamburger to toggle the sidebar.
  - Page content below: comfortable padding (`px-6 py-6` / `lg:px-8`), max width ~`max-w-7xl`.

---

## Core components to build in `src/components/ui/` (or `components/`)

### Card (base)
White (`bg-white`), `rounded-2xl`, `border border-neutral-200`, soft shadow (`shadow-sm`), padding `p-5`/`p-6`. This is the default surface for everything.

### FeatureCard (dark)
Deep navy/near-black background (`bg-secondary-800` or a `secondary-900→secondary-800` gradient), white text, `rounded-2xl`, `p-6`. Used for highlight/marketing-style cards inside dashboards (e.g. "Your Safety Matters", "Your Eligibility Status"). Bullet rows use small green check icons.

### StatusCard (tinted)
Soft-tinted card for positive/status states — e.g. green-tinted (`bg-green-50 border-green-200`) "Available / Eligible" card with a green check icon, a bold status line, supporting text, and an action button. Tint color follows the status (green = good).

### StatCard
Small white card: a colored icon in a soft `rounded-xl` tinted square at top-left, a small uppercase-ish `text-neutral-500` label, then a large bold value (`text-2xl/3xl text-secondary`). Used in 4-up rows on overview pages.

### StatusPill / PriorityPill
Small rounded-full pill, `text-xs font-semibold`, icon optional. Color mapping:
- **URGENT / EMERGENCY** → red (`bg-primary-50 text-primary-700`, or solid `bg-primary text-white` for strong emphasis)
- **HIGH PRIORITY / WARNING / PENDING** → amber (`bg-amber-50 text-amber-700`)
- **ACTIVE / MATCHED / INFO** → blue (`bg-tertiary-50 text-tertiary-700`)
- **ELIGIBLE / VERIFIED / FULFILLED / ACCEPTED / SUCCESS** → green (`bg-green-50 text-green-700`)
- **CLOSED / INACTIVE / NEUTRAL** → neutral (`bg-neutral-100 text-neutral-600`)

### BloodGroupBadge
Circular badge showing a blood group (O+, A−, etc.). Two styles: solid red filled circle with white text, and red-outlined circle with red text. Small droplet accent optional.

### RequestCard
White card for a blood request: top row = BloodGroupBadge (left) + priority/status pill (right); then the hospital/requester name (bold, `text-secondary`); then meta rows with lucide icons — distance ("3.2km away", map-pin icon), units required (droplet icon), travel time (clock icon), and a green "Verified Request" row (shield-check icon) when applicable; footer = a primary action button ("Apply to Donate") or an outline "View Details" button. One card in a row may be visually elevated (`shadow-md ring-1 ring-primary/10`).

### FilterChip
Rounded-full pill button for filters (Urgent / Matching / Within 5km / Filters). Active = `bg-primary text-white`; inactive = `bg-white border border-neutral-200 text-neutral-700`.

### SectionHeader
A row with a bold section title (`text-xl font-bold text-secondary`) + optional small muted subtitle, and an optional right-aligned "View All →" link in red (`text-primary`).

### Toggle (segmented)
Two-option segmented control (e.g. "Map View / List View"): a `bg-blush-card` rounded container, active segment = white card with shadow, inactive = `text-tertiary`.

Also update existing `Button`, `Badge`, `Table`, `Modal`, `Input` to sit cleanly in this system (rounded-xl, neutral borders, Manrope, the pill/tint conventions above).

---

## Page patterns

**Overview / dashboard pages** (every role has one):
- A **welcome/hero card** at top — bold "Welcome back, {name}" (or role-appropriate greeting), a row of small meta chips under it (e.g. blood group, location, last-donation), a faint medical-cross watermark / soft red tint in the corner.
- A **4-up row of StatCards** with role-relevant metrics.
- A primary content section (e.g. "Urgent Blood Requests" with RequestCards, or role-equivalent) using SectionHeader + a responsive grid.
- Secondary sections below (tables, lists with avatars + status pills).
- A **right rail** (on `xl` screens) stacking a StatusCard, a smaller info Card, and a dark FeatureCard.

**List/search pages:** SectionHeader + FilterChips row + a results grid/list of cards. Where there's a map view (donor/hospital search), include a Map/List segmented Toggle — the map itself can stay as whatever placeholder currently exists; focus on the surrounding chrome.

**Tables:** white Card container, `text-neutral-500` column headers, row dividers `border-neutral-100`, status cells use StatusPill.

---

## Rules

- Keep ALL existing functionality, props, routing, API calls, data wiring intact — this is visual only. If a page currently shows real data from the API, it must still show real data.
- Don't invent fake data. The reference screenshots have sample content ("Sarah", "Kathmandu Medical Center") — use the REAL data the page already loads; the design is the point, not the copy.
- Empty/loading/error states must still work and look on-brand (use Spinner, on-brand EmptyState).
- Manrope everywhere (it's the base font — just don't override it).
- `npm run build` and `npm run lint` must pass clean.

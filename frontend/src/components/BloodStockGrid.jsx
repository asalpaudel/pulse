import { BLOOD_GROUPS, bloodGroupLabel } from "../lib/constants";

/**
 * Read-only 8-cell grid of blood stock by group.
 * @param {Array<{bloodGroup, units}>} stock
 */
export default function BloodStockGrid({ stock = [], compact = false }) {
  const byGroup = Object.fromEntries(
    stock.map((s) => [s.bloodGroup, s.units]),
  );

  return (
    <div
      className={`grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-8"}`}
    >
      {BLOOD_GROUPS.map((bg) => {
        const units = byGroup[bg] ?? 0;
        const empty = units === 0;
        return (
          <div
            key={bg}
            className={`rounded-lg border px-2 py-3 text-center ${
              empty
                ? "border-neutral-200 bg-blush-soft"
                : "border-primary/20 bg-primary/5"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                empty ? "text-neutral-400" : "text-primary"
              }`}
            >
              {bloodGroupLabel(bg)}
            </p>
            <p
              className={`mt-1 text-lg font-bold ${
                empty ? "text-neutral-300" : "text-secondary"
              }`}
            >
              {units}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">
              units
            </p>
          </div>
        );
      })}
    </div>
  );
}

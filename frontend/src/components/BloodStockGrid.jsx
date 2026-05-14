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
                ? "border-stone-200 bg-stone-50"
                : "border-pulse/20 bg-pulse/5"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                empty ? "text-stone-400" : "text-pulse"
              }`}
            >
              {bloodGroupLabel(bg)}
            </p>
            <p
              className={`mt-1 text-lg font-bold ${
                empty ? "text-stone-300" : "text-stone-900"
              }`}
            >
              {units}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-stone-400">
              units
            </p>
          </div>
        );
      })}
    </div>
  );
}

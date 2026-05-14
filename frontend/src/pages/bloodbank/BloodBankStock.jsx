import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as bloodBanksApi from "../../api/bloodbanks";
import { BLOOD_GROUPS, bloodGroupLabel } from "../../lib/constants";

/**
 * Blood bank stock editor. Loads current stock, lets the bank edit units per
 * group, and upserts via PUT /api/bloodbanks/me/stock with [{bloodGroup, units}].
 */
export default function BloodBankStock() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [units, setUnits] = useState(() =>
    Object.fromEntries(BLOOD_GROUPS.map((bg) => [bg, 0])),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // The contract exposes GET /bloodbanks/{id}/stock; use own id.
        const id = profile?.id;
        if (id == null) {
          if (active) setLoading(false);
          return;
        }
        const stock = await bloodBanksApi.getBloodBankStock(id);
        if (!active) return;
        const map = Object.fromEntries(BLOOD_GROUPS.map((bg) => [bg, 0]));
        (Array.isArray(stock) ? stock : []).forEach((s) => {
          map[s.bloodGroup] = s.units;
        });
        setUnits(map);
      } catch {
        // keep zeros
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [profile?.id]);

  const setGroup = (bg, val) => {
    const n = Math.max(0, Number(val) || 0);
    setUnits((u) => ({ ...u, [bg]: n }));
  };

  const adjust = (bg, delta) => {
    setUnits((u) => ({ ...u, [bg]: Math.max(0, (u[bg] || 0) + delta) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = BLOOD_GROUPS.map((bg) => ({
        bloodGroup: bg,
        units: units[bg],
      }));
      await bloodBanksApi.updateMyStock(payload);
      toast.success("Blood stock updated.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading stock…" />;

  const total = Object.values(units).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageHeader
        title="Blood Stock"
        subtitle="Maintain your live inventory by blood group"
        action={
          <Button onClick={save} loading={saving}>
            Save stock
          </Button>
        }
      />

      <Card>
        <CardHeader
          title="Inventory"
          subtitle={`${total} units total across all groups`}
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BLOOD_GROUPS.map((bg) => (
              <div
                key={bg}
                className="rounded-xl border border-stone-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-pulse">
                    {bloodGroupLabel(bg)}
                  </span>
                  <span className="text-xs text-stone-400">{bg}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjust(bg, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition hover:bg-stone-100"
                    aria-label={`Decrease ${bg}`}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={units[bg]}
                    onChange={(e) => setGroup(bg, e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-center text-sm focus:border-pulse focus:outline-none focus:ring-2 focus:ring-pulse/30"
                  />
                  <button
                    type="button"
                    onClick={() => adjust(bg, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition hover:bg-stone-100"
                    aria-label={`Increase ${bg}`}
                  >
                    +
                  </button>
                </div>
                <p className="mt-1 text-center text-[10px] uppercase tracking-wide text-stone-400">
                  units
                </p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

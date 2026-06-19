import { useEffect, useState } from "react";
import { Boxes, Layers, Minus, Plus, Droplet } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import StatusCard from "../../components/ui/StatusCard";
import Button from "../../components/ui/Button";
import BloodGroupBadge from "../../components/ui/BloodGroupBadge";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as bloodBanksApi from "../../api/bloodbanks";
import { BLOOD_GROUPS } from "../../lib/constants";

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
  const stockedGroups = Object.values(units).filter((n) => n > 0).length;
  const emptyGroups = BLOOD_GROUPS.length - stockedGroups;

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

      {/* Summary stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Boxes}
          tone="red"
          label="Total units"
          value={total}
        />
        <StatCard
          icon={Layers}
          tone={emptyGroups > 0 ? "amber" : "green"}
          label="Groups in stock"
          value={`${stockedGroups}/${BLOOD_GROUPS.length}`}
        />
        <StatCard
          icon={Droplet}
          tone={emptyGroups > 0 ? "amber" : "green"}
          label="Empty groups"
          value={emptyGroups}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Inventory"
              subtitle={`${total} units total across all groups`}
            />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {BLOOD_GROUPS.map((bg) => {
                  const empty = units[bg] === 0;
                  return (
                    <div
                      key={bg}
                      className={`rounded-xl border p-4 ${
                        empty
                          ? "border-neutral-200 bg-blush-soft"
                          : "border-primary/20 bg-primary/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <BloodGroupBadge
                          group={bg}
                          variant={empty ? "outline" : "solid"}
                          size="sm"
                        />
                        <span
                          className={`text-xs font-semibold ${
                            empty ? "text-neutral-400" : "text-primary"
                          }`}
                        >
                          {empty ? "Out of stock" : "In stock"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => adjust(bg, -1)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-100"
                          aria-label={`Decrease ${bg}`}
                        >
                          <Minus size={15} strokeWidth={2} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={units[bg]}
                          onChange={(e) => setGroup(bg, e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-sm font-semibold text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button
                          type="button"
                          onClick={() => adjust(bg, 1)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-600 transition hover:bg-neutral-100"
                          aria-label={`Increase ${bg}`}
                        >
                          <Plus size={15} strokeWidth={2} />
                        </button>
                      </div>
                      <p className="mt-1.5 text-center text-[10px] uppercase tracking-wide text-neutral-400">
                        units in stock
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Side guidance */}
        <div className="space-y-6">
          <StatusCard
            tone={emptyGroups > 0 ? "amber" : "green"}
            title={
              emptyGroups > 0
                ? `${emptyGroups} group${emptyGroups === 1 ? "" : "s"} out of stock`
                : "All blood groups stocked"
            }
            description={
              emptyGroups > 0
                ? "Hospitals rely on accurate stock figures. Keep counts current and consider a donation drive for empty groups."
                : "Great — every blood group has units available. Remember to save after any changes."
            }
            action={
              <Button size="sm" variant="outline" onClick={save} loading={saving}>
                Save stock
              </Button>
            }
          />
          <Card>
            <CardBody>
              <h3 className="text-base font-bold text-secondary">
                Keeping stock accurate
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                <li>Use the + / − controls or type a count directly.</li>
                <li>
                  Changes are not live until you press{" "}
                  <span className="font-semibold text-secondary">
                    Save stock
                  </span>
                  .
                </li>
                <li>
                  Saved figures are visible to hospitals searching nearby blood
                  banks.
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

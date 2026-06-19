import { useState } from "react";
import {
  MapPin,
  Phone,
  Building2,
  Map as MapIcon,
  List,
  Search,
  Filter,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card, { CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import BloodStockGrid from "../../components/BloodStockGrid";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as bloodBanksApi from "../../api/bloodbanks";
import { DEFAULT_COORDS } from "../../lib/constants";

export default function HospitalBloodBankSearch() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useState({
    lat: profile?.latitude ?? DEFAULT_COORDS.latitude,
    lng: profile?.longitude ?? DEFAULT_COORDS.longitude,
    radiusKm: 15,
  });
  const [results, setResults] = useState(null);
  const [stockById, setStockById] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStock, setLoadingStock] = useState(null);
  const [view, setView] = useState("list");

  const set = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const search = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await bloodBanksApi.searchBloodBanks({
        lat: Number(params.lat),
        lng: Number(params.lng),
        radiusKm: Number(params.radiusKm),
      });
      setResults(Array.isArray(data) ? data : []);
      setStockById({});
    } catch (err) {
      toast.error(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStock = async (id) => {
    setLoadingStock(id);
    try {
      const stock = await bloodBanksApi.getBloodBankStock(id);
      setStockById((s) => ({ ...s, [id]: Array.isArray(stock) ? stock : [] }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingStock(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Find Blood Banks"
        subtitle="Locate nearby blood banks and view their live stock"
        action={
          <Toggle
            options={[
              { value: "list", label: "List", icon: List },
              { value: "map", label: "Map", icon: MapIcon },
            ]}
            value={view}
            onChange={setView}
          />
        }
      />

      {/* Search controls */}
      <Card className="mb-6">
        <CardBody>
          <form
            onSubmit={search}
            className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={params.lat}
              onChange={(e) => set("lat", e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={params.lng}
              onChange={(e) => set("lng", e.target.value)}
            />
            <Input
              label="Radius (km)"
              type="number"
              min="1"
              value={params.radiusKm}
              onChange={(e) => set("radiusKm", e.target.value)}
            />
            <Button type="submit" loading={loading}>
              <Search size={16} strokeWidth={1.9} />
              Search blood banks
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <Spinner label="Searching blood banks…" />
      ) : results === null ? (
        <EmptyState
          icon={Search}
          title="Search for blood banks"
          message="Run a proximity search to find blood banks near you and check their live inventory."
        />
      ) : view === "map" ? (
        <Card>
          <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-2xl bg-blush-soft text-center">
            <MapIcon size={28} strokeWidth={1.6} className="text-primary" />
            <p className="text-sm font-semibold text-secondary">
              Map view coming soon
            </p>
            <p className="max-w-sm text-sm text-neutral-600">
              {results.length} blood bank{results.length === 1 ? "" : "s"} found
              within {params.radiusKm}km. Switch to List view to see details and
              stock.
            </p>
          </div>
        </Card>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No blood banks found"
          message="No blood banks within that radius. Try widening your search."
        />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-1.5 text-sm text-neutral-600">
            <Filter size={15} strokeWidth={1.8} />
            {results.length} blood bank{results.length === 1 ? "" : "s"} within{" "}
            {params.radiusKm}km
          </div>
          <div className="space-y-4">
            {results.map((bank) => (
              <Card key={bank.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                      <Building2 size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="font-bold text-secondary">{bank.name}</p>
                      <div className="mt-1 space-y-0.5 text-sm text-neutral-600">
                        {bank.address && (
                          <p className="flex items-center gap-2">
                            <MapPin
                              size={15}
                              strokeWidth={1.8}
                              className="text-neutral-400"
                            />
                            {bank.address}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <Phone
                            size={15}
                            strokeWidth={1.8}
                            className="text-neutral-400"
                          />
                          {bank.phone || "No phone"}
                          {bank.distanceKm != null && (
                            <span className="text-neutral-400">
                              · {Number(bank.distanceKm).toFixed(1)}km away
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={loadingStock === bank.id}
                    onClick={() => loadStock(bank.id)}
                  >
                    {stockById[bank.id] ? "Refresh stock" : "View stock"}
                  </Button>
                </div>
                {stockById[bank.id] && (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <BloodStockGrid stock={stockById[bank.id]} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

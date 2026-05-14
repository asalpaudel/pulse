import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
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

  const set = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const search = async (e) => {
    e.preventDefault();
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
      />

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
              Search blood banks
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <Spinner label="Searching blood banks…" />
      ) : results === null ? (
        <EmptyState
          title="Search for blood banks"
          message="Run a proximity search to find blood banks near you and check their inventory."
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No blood banks found"
          message="No blood banks within that radius. Try widening your search."
        />
      ) : (
        <div className="space-y-4">
          {results.map((bank) => (
            <Card key={bank.id}>
              <CardHeader
                title={bank.name}
                subtitle={bank.address || `${bank.phone || "No phone"}`}
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={loadingStock === bank.id}
                    onClick={() => loadStock(bank.id)}
                  >
                    {stockById[bank.id] ? "Refresh stock" : "View stock"}
                  </Button>
                }
              />
              {stockById[bank.id] && (
                <CardBody>
                  <BloodStockGrid stock={stockById[bank.id]} />
                </CardBody>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

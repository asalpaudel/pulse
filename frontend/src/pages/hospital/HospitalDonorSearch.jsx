import { useState } from "react";
import {
  MapPin,
  Phone,
  Map as MapIcon,
  List,
  Search,
  Filter,
  Users,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card, { CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import FilterChip from "../../components/ui/FilterChip";
import Toggle from "../../components/ui/Toggle";
import BloodGroupBadge from "../../components/ui/BloodGroupBadge";
import StatusPill from "../../components/ui/StatusPill";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as donorsApi from "../../api/donors";
import {
  BLOOD_GROUPS,
  bloodGroupLabel,
  DEFAULT_COORDS,
} from "../../lib/constants";

export default function HospitalDonorSearch() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useState({
    bloodGroup: "O_POS",
    lat: profile?.latitude ?? DEFAULT_COORDS.latitude,
    lng: profile?.longitude ?? DEFAULT_COORDS.longitude,
    radiusKm: 10,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");

  const set = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const search = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await donorsApi.searchDonors({
        bloodGroup: params.bloodGroup,
        lat: Number(params.lat),
        lng: Number(params.lng),
        radiusKm: Number(params.radiusKm),
      });
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Find Donors"
        subtitle="Proximity search for available donors by blood group"
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
          <form onSubmit={search} className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-600">
                Blood group
              </p>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <FilterChip
                    key={bg}
                    active={params.bloodGroup === bg}
                    onClick={() => set("bloodGroup", bg)}
                  >
                    {bloodGroupLabel(bg)}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                Search donors
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <Spinner label="Searching donors…" />
      ) : results === null ? (
        <EmptyState
          icon={Search}
          title="Search for donors"
          message="Pick a blood group and radius, then run a proximity search to find available donors near you."
        />
      ) : view === "map" ? (
        <Card>
          <div className="flex h-80 flex-col items-center justify-center gap-2 rounded-2xl bg-blush-soft text-center">
            <MapIcon size={28} strokeWidth={1.6} className="text-primary" />
            <p className="text-sm font-semibold text-secondary">
              Map view coming soon
            </p>
            <p className="max-w-sm text-sm text-neutral-600">
              {results.length} donor{results.length === 1 ? "" : "s"} found
              within {params.radiusKm}km. Switch to List view to see details.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-1.5 text-sm text-neutral-600">
            <Filter size={15} strokeWidth={1.8} />
            {results.length} donor{results.length === 1 ? "" : "s"} within{" "}
            {params.radiusKm}km
          </div>
          {results.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No donors found"
              message="No available donors within that radius. Try widening your search."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((d) => (
                <Card key={d.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <BloodGroupBadge group={d.bloodGroup} size="md" />
                    <StatusPill
                      status={d.available ? "AVAILABLE" : "UNAVAILABLE"}
                    />
                  </div>
                  <p className="mt-3 font-bold text-secondary">
                    {d.fullName || "Donor"}
                  </p>
                  <div className="mt-3 space-y-1.5 text-sm text-neutral-600">
                    {d.distanceKm != null && (
                      <p className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          strokeWidth={1.8}
                          className="text-neutral-400"
                        />
                        {Number(d.distanceKm).toFixed(1)}km away
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Phone
                        size={16}
                        strokeWidth={1.8}
                        className="text-neutral-400"
                      />
                      {d.phone || "—"}
                    </p>
                    {d.address && (
                      <p className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          strokeWidth={1.8}
                          className="text-neutral-400"
                        />
                        {d.address}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

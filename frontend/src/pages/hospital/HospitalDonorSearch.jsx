import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card, { CardBody } from "../../components/ui/Card";
import { Input, Select } from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import {
  Table,
  THead,
  TBody,
  TR,
  TD,
  EmptyRow,
} from "../../components/ui/Table";
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

  const set = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const search = async (e) => {
    e.preventDefault();
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
      />

      <Card className="mb-6">
        <CardBody>
          <form
            onSubmit={search}
            className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >
            <Select
              label="Blood group"
              value={params.bloodGroup}
              onChange={(e) => set("bloodGroup", e.target.value)}
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bloodGroupLabel(bg)} ({bg})
                </option>
              ))}
            </Select>
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
              Search donors
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading ? (
        <Spinner label="Searching donors…" />
      ) : results === null ? (
        <EmptyState
          title="Search for donors"
          message="Set a blood group and radius, then run a proximity search to find available donors near you."
        />
      ) : (
        <Card>
          <Table>
            <THead columns={["Donor", "Blood group", "Phone", "Address", "Status"]} />
            <TBody>
              {results.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  message="No donors found within that radius."
                />
              ) : (
                results.map((d) => (
                  <TR key={d.id}>
                    <TD className="font-medium text-stone-900">
                      {d.fullName}
                    </TD>
                    <TD>
                      <span className="font-semibold text-pulse">
                        {bloodGroupLabel(d.bloodGroup)}
                      </span>
                    </TD>
                    <TD>{d.phone || "—"}</TD>
                    <TD className="text-stone-500">{d.address || "—"}</TD>
                    <TD>
                      {d.available ? (
                        <Badge tone="green">Available</Badge>
                      ) : (
                        <Badge tone="slate">Unavailable</Badge>
                      )}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

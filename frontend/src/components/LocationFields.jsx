import { Input } from "./ui/Input";
import Button from "./ui/Button";

/**
 * Address + latitude/longitude inputs shared by all profile/request forms.
 * "Use my location" fills coords from the browser geolocation API.
 * (Server-side geocoding via Nominatim is the backend's job — see pulse.md.)
 */
export default function LocationFields({ values, onChange, errors = {} }) {
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      onChange("latitude", pos.coords.latitude.toFixed(6));
      onChange("longitude", pos.coords.longitude.toFixed(6));
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Address"
        name="address"
        value={values.address ?? ""}
        onChange={(e) => onChange("address", e.target.value)}
        placeholder="Street, city, district"
        error={errors.address}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude"
          name="latitude"
          type="number"
          step="any"
          value={values.latitude ?? ""}
          onChange={(e) => onChange("latitude", e.target.value)}
          placeholder="27.7172"
          error={errors.latitude}
        />
        <Input
          label="Longitude"
          name="longitude"
          type="number"
          step="any"
          value={values.longitude ?? ""}
          onChange={(e) => onChange("longitude", e.target.value)}
          placeholder="85.3240"
          error={errors.longitude}
        />
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={useMyLocation}>
        Use my current location
      </Button>
    </div>
  );
}

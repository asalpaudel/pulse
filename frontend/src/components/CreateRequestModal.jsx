import { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { Input, Select, Textarea } from "./ui/Input";
import LocationFields from "./LocationFields";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import * as requestsApi from "../api/requests";
import { BLOOD_GROUPS, bloodGroupLabel, DEFAULT_COORDS } from "../lib/constants";

// Hospital-only modal for POST /api/requests.
export default function CreateRequestModal({ open, onClose, onCreated }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const initialForm = {
    bloodGroup: "O_POS",
    units: 1,
    urgency: "EMERGENCY",
    note: "",
    latitude: "",
    longitude: "",
    address: "",
    radiusKm: 15,
  };
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => setForm(initialForm);

  // Prefill location from the hospital's own profile when opened empty.
  const prefill = () => {
    if (form.latitude === "" && profile?.latitude != null) {
      set("latitude", String(profile.latitude));
      set("longitude", String(profile.longitude));
      if (profile.address) set("address", profile.address);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const lat =
        form.latitude !== ""
          ? Number(form.latitude)
          : profile?.latitude ?? DEFAULT_COORDS.latitude;
      const lng =
        form.longitude !== ""
          ? Number(form.longitude)
          : profile?.longitude ?? DEFAULT_COORDS.longitude;
      const payload = {
        bloodGroup: form.bloodGroup,
        units: Number(form.units),
        urgency: form.urgency,
        note: form.note || null,
        latitude: lat,
        longitude: lng,
      };
      // radiusKm only affects EMERGENCY alert matching; backend defaults to 15.
      if (form.urgency === "EMERGENCY" && form.radiusKm !== "") {
        payload.radiusKm = Number(form.radiusKm);
      }
      const created = await requestsApi.createRequest(payload);
      toast.success(
        form.urgency === "EMERGENCY"
          ? "Emergency request posted — matching donors and blood banks have been alerted."
          : "Routine request posted.",
      );
      reset();
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New blood request"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="create-request-form" type="submit" loading={saving}>
            Post request
          </Button>
        </>
      }
    >
      <form id="create-request-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {["EMERGENCY", "ROUTINE"].map((u) => (
            <label
              key={u}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                form.urgency === u
                  ? u === "EMERGENCY"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-neutral-400 bg-blush-soft text-secondary"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value={u}
                checked={form.urgency === u}
                onChange={() => set("urgency", u)}
                className="sr-only"
              />
              {u === "EMERGENCY" && (
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-primary ${
                    form.urgency === u ? "animate-pulse" : ""
                  }`}
                />
              )}
              {u}
            </label>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Blood group"
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={(e) => set("bloodGroup", e.target.value)}
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bloodGroupLabel(bg)} ({bg})
              </option>
            ))}
          </Select>
          <Input
            label="Units required"
            name="units"
            type="number"
            min="1"
            value={form.units}
            onChange={(e) => set("units", e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Note (optional)"
          name="note"
          rows={2}
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="Patient context, ward, contact person…"
        />

        <div onFocus={prefill}>
          <p className="mb-2 text-sm font-medium text-secondary">
            Request location
          </p>
          <LocationFields values={form} onChange={set} />
          <p className="mt-2 text-xs text-neutral-400">
            Used to alert nearby donors and blood banks. Defaults to your
            hospital location if left blank.
          </p>
        </div>

        {form.urgency === "EMERGENCY" && (
          <>
            <Input
              label="Alert radius (km)"
              name="radiusKm"
              type="number"
              min="1"
              value={form.radiusKm}
              onChange={(e) => set("radiusKm", e.target.value)}
              placeholder="15"
            />
            <div className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
              Posting an emergency request immediately alerts matching donors and
              nearby blood banks within the radius in real time.
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

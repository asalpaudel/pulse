import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import EventCard from "../../components/EventCard";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import LocationFields from "../../components/LocationFields";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import * as eventsApi from "../../api/events";
import { formatDateTime } from "../../lib/constants";

const blankEvent = {
  title: "",
  description: "",
  eventDate: "",
  address: "",
  latitude: "",
  longitude: "",
};

export default function BloodBankEvents() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(blankEvent);
  const [saving, setSaving] = useState(false);
  const [enrollFor, setEnrollFor] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnroll, setLoadingEnroll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.listEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only events owned by this blood bank (best-effort match on bloodBankId).
  const myEvents = profile?.id
    ? events.filter((e) => e.bloodBankId === profile.id)
    : events;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        eventDate: form.eventDate
          ? new Date(form.eventDate).toISOString()
          : null,
        address: form.address || null,
        latitude: form.latitude !== "" ? Number(form.latitude) : null,
        longitude: form.longitude !== "" ? Number(form.longitude) : null,
      };
      const created = await eventsApi.createEvent(payload);
      toast.success("Donation event created.");
      setForm(blankEvent);
      setCreateOpen(false);
      if (created) setEvents((ev) => [created, ...ev]);
      else load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const viewEnrollments = async (event) => {
    setEnrollFor(event);
    setLoadingEnroll(true);
    try {
      const data = await eventsApi.getEventEnrollments(event.id);
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
      setEnrollments([]);
    } finally {
      setLoadingEnroll(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Donation Events"
        subtitle="Create and manage collection drives and campaigns"
        action={
          <Button onClick={() => setCreateOpen(true)}>+ New event</Button>
        }
      />

      {loading ? (
        <Spinner />
      ) : myEvents.length === 0 ? (
        <EmptyState
          title="No events yet"
          message="Create a donation event to start collecting blood and engaging donors."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              Create your first event
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myEvents.map((ev) => (
            <EventCard key={ev.id} event={ev}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => viewEnrollments(ev)}
              >
                View enrollments
              </Button>
            </EventCard>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New donation event"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button form="create-event-form" type="submit" loading={saving}>
              Create event
            </Button>
          </>
        }
      >
        <form id="create-event-form" onSubmit={create} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Community Blood Drive"
            required
          />
          <Textarea
            label="Description"
            name="description"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Who it's for, what to bring, timing details…"
          />
          <Input
            label="Event date & time"
            name="eventDate"
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => set("eventDate", e.target.value)}
            required
          />
          <LocationFields values={form} onChange={set} />
        </form>
      </Modal>

      {/* Enrollments modal */}
      <Modal
        open={Boolean(enrollFor)}
        onClose={() => setEnrollFor(null)}
        title={enrollFor ? `Enrollments — ${enrollFor.title}` : "Enrollments"}
      >
        {loadingEnroll ? (
          <Spinner label="Loading enrollments…" />
        ) : enrollments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-stone-200 px-3 py-8 text-center text-sm text-stone-400">
            No donors have enrolled yet.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200">
            {enrollments.map((en) => (
              <li
                key={en.id}
                className="flex items-center justify-between px-3 py-2.5 text-sm"
              >
                <span className="font-medium text-stone-800">
                  Donor #{en.donorId}
                </span>
                <span className="text-xs text-stone-400">
                  {formatDateTime(en.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </div>
  );
}

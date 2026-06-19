import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EventCard from "../../components/EventCard";
import Button from "../../components/ui/Button";
import Spinner, { EmptyState } from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import * as eventsApi from "../../api/events";

export default function DonorEvents() {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [joined, setJoined] = useState(() => new Set());
  // Captured once on mount — avoids calling Date.now() during render.
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await eventsApi.listEvents();
        if (active) setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const join = async (id) => {
    setJoining(id);
    try {
      await eventsApi.joinEvent(id);
      setJoined((s) => new Set(s).add(id));
      toast.success("You're enrolled in this donation event.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setJoining(null);
    }
  };

  // Keep only events that haven't passed yet (computed once per events change).
  const upcoming = useMemo(
    () =>
      events.filter(
        (e) => !e.eventDate || new Date(e.eventDate).getTime() >= mountedAt,
      ),
    [events, mountedAt],
  );

  return (
    <div>
      <PageHeader
        title="Donation Events"
        subtitle="Browse and enroll in collection drives and campaigns"
      />
      {loading ? (
        <Spinner />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events"
          message="Blood banks haven't scheduled any donation events yet. Check back soon."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((e) => {
            const isJoined = joined.has(e.id);
            return (
              <EventCard key={e.id} event={e}>
                <Button
                  size="sm"
                  variant={isJoined ? "outline" : "primary"}
                  disabled={isJoined}
                  loading={joining === e.id}
                  onClick={() => join(e.id)}
                >
                  {isJoined ? "Enrolled" : "Join event"}
                </Button>
              </EventCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

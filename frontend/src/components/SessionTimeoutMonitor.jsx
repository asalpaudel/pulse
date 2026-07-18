import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import * as authApi from "../api/auth";

const TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 2 * 60 * 1000;
const TOUCH_THROTTLE_MS = 60 * 1000;

export default function SessionTimeoutMonitor({ onTimeout }) {
  const warningTimer = useRef(null);
  const timeoutTimer = useRef(null);
  const lastTouch = useRef(0);
  const deadline = useRef(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_MS / 1000);

  const clearTimers = useCallback(() => {
    window.clearTimeout(warningTimer.current);
    window.clearTimeout(timeoutTimer.current);
  }, []);

  const expire = useCallback(() => {
    clearTimers();
    setWarningOpen(false);
    onTimeout?.();
  }, [clearTimers, onTimeout]);

  const schedule = useCallback(() => {
    clearTimers();
    deadline.current = Date.now() + TIMEOUT_MS;
    setWarningOpen(false);
    setSecondsLeft(WARNING_MS / 1000);
    warningTimer.current = window.setTimeout(() => setWarningOpen(true), TIMEOUT_MS - WARNING_MS);
    timeoutTimer.current = window.setTimeout(expire, TIMEOUT_MS);
  }, [clearTimers, expire]);

  const markActive = useCallback(() => {
    schedule();
    const now = Date.now();
    if (now - lastTouch.current >= TOUCH_THROTTLE_MS) {
      lastTouch.current = now;
      authApi.touchSession().catch(() => {});
    }
  }, [schedule]);

  useEffect(() => {
    const initialTimer = window.setTimeout(schedule, 0);
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, markActive, { passive: true }));
    return () => {
      clearTimers();
      window.clearTimeout(initialTimer);
      events.forEach((event) => window.removeEventListener(event, markActive));
    };
  }, [clearTimers, markActive, schedule]);

  useEffect(() => {
    if (!warningOpen) return undefined;
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [warningOpen]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <Modal
      open={warningOpen}
      onClose={markActive}
      title="Your session is about to expire"
      size="sm"
      footer={<Button onClick={markActive}>Stay signed in</Button>}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
          <Clock3 size={21} strokeWidth={1.9} />
        </div>
        <div>
          <p className="text-sm leading-6 text-neutral-700">
            For your security, Pulse signs you out after 30 minutes without activity.
          </p>
          <p className="mt-3 font-mono text-lg font-semibold tabular-nums text-ink" aria-live="polite">
            {minutes}:{seconds} remaining
          </p>
        </div>
      </div>
    </Modal>
  );
}

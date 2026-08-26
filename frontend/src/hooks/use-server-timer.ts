"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Phase 24: Server-Authoritative Timer
 *
 * The expiresAt timestamp comes from the backend and is never modified
 * by the frontend. This hook simply counts down to that server-set time.
 *
 * The client timer is DISPLAY ONLY — the backend enforces expiry on
 * every API call and at submission time.
 *
 * @param expiresAt  ISO string from server (e.g. "2026-08-26T14:30:00")
 * @param onExpire   callback when display timer reaches zero
 */
export function useServerTimer(
  expiresAt: string | null,
  onExpire?: () => void
) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!expiresAt) return;

    const compute = () => {
      const diff = Math.floor(
        (new Date(expiresAt).getTime() - Date.now()) / 1000
      );
      return Math.max(0, diff);
    };

    setSecondsLeft(compute());

    const interval = setInterval(() => {
      const remaining = compute();
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const hours   = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isWarning  = secondsLeft <= 300 && secondsLeft > 60;   // last 5 min
  const isCritical = secondsLeft <= 60;                         // last 1 min

  return { secondsLeft, formatted, isWarning, isCritical };
}

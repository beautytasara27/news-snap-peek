import { api, getToken } from "./api";

export type EventData = {
  event_type: string;
  story_id: number;
  timestamp: string;
  duration_ms?: number;
  session_id?: string;
};

export type EventExtras = {
  durationMs?: number;
  sessionId?: string;
};

let eventQueue: EventData[] = [];
let flushInterval: number | undefined;
let flushing = false;

function apiOrigin(): string {
  const base = api.defaults.baseURL || "/api";
  if (base.startsWith("http")) return base.replace(/\/$/, "");
  return `${window.location.origin}${base.startsWith("/") ? base : `/${base}`}`.replace(/\/$/, "");
}

async function flushEvents(keepalive = false): Promise<void> {
  if (eventQueue.length === 0 || flushing) return;

  const batch = [...eventQueue];
  eventQueue = [];
  flushing = true;

  try {
    if (keepalive && typeof fetch === "function") {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`${apiOrigin()}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify(batch),
        credentials: "include",
        keepalive: true,
      });
    } else {
      await api.post("/events", batch);
    }
  } catch (err) {
    console.error("Error sending event batch:", err);
    eventQueue.push(...batch);
  } finally {
    flushing = false;
  }
}

/** Queue an interaction event. No-op for signed-out visitors. */
export function queueEvent(
  userId: number | undefined,
  eventType: string,
  storyId: number,
  extras?: EventExtras,
) {
  if (!userId || !storyId) return;

  const payload: EventData = {
    event_type: eventType,
    story_id: storyId,
    timestamp: new Date().toISOString(),
  };
  if (extras?.durationMs != null) payload.duration_ms = extras.durationMs;
  if (extras?.sessionId) payload.session_id = extras.sessionId;

  eventQueue.push(payload);
}

export function startEventBatcher(intervalMs = 5000) {
  if (!flushInterval) {
    flushInterval = window.setInterval(() => void flushEvents(), intervalMs);
  }
}

export function stopEventBatcher() {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = undefined;
  }
  void flushEvents(true);
}

/** Immediate send — used when leaving an article so dwell is not lost. */
export function flushEventsNow(keepalive = false) {
  void flushEvents(keepalive);
}

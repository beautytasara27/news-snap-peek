import axios from "axios";
type EventData = {
  user_id: number;
  event_type: string;
  story_id: number;
  timestamp: string; // ISO string format
};

let eventQueue: EventData[] = [];
let flushInterval: number | undefined;


// Send batched events to backend
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;

  const batch = [...eventQueue];
  eventQueue = [];

  try {
    const res = await axios.post("http://127.0.0.1:5050/api/events", batch, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true, // 👈 send JWT cookie along with request
    });

    if (res.status < 200 || res.status >= 300) {
      console.error("Failed to send event batch");
      eventQueue.push(...batch); // retry later
    }
  } catch (err) {
    console.error("Error sending event batch:", err);
    eventQueue.push(...batch); // retry later
  }
}

// Public function to add events to the queue
export function queueEvent(
  user_id: number,
  event_type: string,
  story_id: number
) {
  eventQueue.push({
    user_id,
    event_type,
    story_id,
    timestamp: new Date().toISOString(),
  });
}

// Start batch sending at an interval (e.g., every 5 seconds)
export function startEventBatcher(intervalMs = 5000) {
  if (!flushInterval) {
    flushInterval = window.setInterval(flushEvents, intervalMs);
  }
}

// Stop batch sending (optional)
export function stopEventBatcher() {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = undefined;
  }
}

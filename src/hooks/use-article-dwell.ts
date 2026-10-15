import { useEffect } from "react";
import { flushEventsNow, queueEvent } from "@/lib/eventBatcher";

const MIN_DWELL_MS = 1000;
const MAX_DWELL_MS = 30 * 60 * 1000;

/**
 * Records how long a signed-in reader actually looks at an article.
 * Hidden-tab time is not counted. One `dwell` event is sent when they leave.
 */
export function useArticleDwell(
  storyId: number | undefined,
  userId: number | undefined,
  sessionId?: string,
) {
  useEffect(() => {
    if (!storyId || !userId) return;

    let accumulated = 0;
    let sliceStart = document.visibilityState === "hidden" ? 0 : Date.now();
    let sent = false;

    const pause = () => {
      if (sliceStart === 0) return;
      accumulated += Date.now() - sliceStart;
      sliceStart = 0;
    };

    const resume = () => {
      if (sliceStart !== 0) return;
      sliceStart = Date.now();
    };

    const report = (keepalive: boolean) => {
      pause();
      if (sent) return;
      const durationMs = Math.min(accumulated, MAX_DWELL_MS);
      if (durationMs < MIN_DWELL_MS) return;
      sent = true;
      queueEvent(userId, "dwell", storyId, { durationMs, sessionId });
      flushEventsNow(keepalive);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") pause();
      else resume();
    };

    const onPageHide = () => report(true);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      report(true);
    };
  }, [storyId, userId, sessionId]);
}

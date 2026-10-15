import { useEffect, useRef } from "react";
import { flushEventsNow, queueEvent } from "@/lib/eventBatcher";

/** Fire one impression when a signed-in reader actually sees the card. */
export function useImpression(
  storyId: number,
  userId: number | undefined,
  sessionId: string | undefined,
  enabled: boolean,
) {
  const ref = useRef<HTMLElement | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    sent.current = false;
    if (!enabled || !userId || !storyId || !ref.current) return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (sent.current) return;
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          sent.current = true;
          queueEvent(userId, "impression", storyId, { sessionId });
          flushEventsNow();
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [storyId, userId, sessionId, enabled]);

  return ref;
}

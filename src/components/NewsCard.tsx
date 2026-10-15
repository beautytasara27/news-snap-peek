import { useEffect, useState } from "react";
import { ArrowUpRight, Clock, MoreHorizontal, UserRound } from "lucide-react";
import { LikeButton } from "@/components/LikeButton";
import { useImpression } from "@/hooks/use-impression";
import type { NewsArticle } from "@/lib/stories";
import type { LikeState } from "@/lib/likeStory";
import { queueEvent, flushEventsNow } from "@/lib/eventBatcher";

export type { NewsArticle };

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
  onLikeChange: (state: LikeState) => void;
  onRequireAuth?: () => void;
  onHide?: (article: NewsArticle) => void;
  onFeedback?: (type: "more_like" | "less_topic", article: NewsArticle) => void;
  index?: number;
  userId?: number;
  sessionId?: string;
  trackImpressions?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const NewsCard = ({
  article,
  onClick,
  onLikeChange,
  onRequireAuth,
  onHide,
  onFeedback,
  index = 0,
  userId,
  sessionId,
  trackImpressions = false,
}: NewsCardProps) => {
  const open = () => onClick(article);
  const byline = article.author || article.source;
  const cardRef = useImpression(article.id, userId, sessionId, trackImpressions);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuOpen]);

  const sendFeedback = (type: "hide" | "more_like" | "less_topic") => {
    if (!userId) {
      onRequireAuth?.();
      return;
    }
    queueEvent(userId, type, article.id, { sessionId });
    flushEventsNow();
    setMenuOpen(false);
    if (type === "hide") onHide?.(article);
    else onFeedback?.(type, article);
  };

  return (
    <article
      ref={cardRef}
      className="glass-card group relative flex h-full cursor-pointer flex-col overflow-hidden animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      onClick={open}
    >
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.category && (
            <span className="glass-pill px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-foreground/90">
              {article.category}
            </span>
          )}
          <span className="glass-pill px-2.5 py-1 text-xs text-foreground/85">
            <Clock className="size-3.5" />
            {article.readTime} min read
          </span>
        </div>

        <div className="mb-2.5 flex items-center gap-2.5 text-xs text-news-subtle">
          {byline && (
            <>
              <span className="flex min-w-0 items-center gap-1.5">
                <UserRound className="size-3.5 shrink-0" />
                <span className="truncate">{byline}</span>
              </span>
              <span aria-hidden>·</span>
            </>
          )}
          <time dateTime={article.date}>{formatDate(article.date)}</time>
        </div>

        <h3 className="text-balance text-lg font-semibold leading-snug text-news-header transition-colors duration-200 line-clamp-3 group-hover:text-primary">
          {article.title}
        </h3>

        {article.summary && (
          <p className="mt-2.5 text-sm leading-relaxed text-news-text line-clamp-4">{article.summary}</p>
        )}

        {article.reason?.label && (
          <p className="mt-3 text-xs text-news-subtle">{article.reason.label}</p>
        )}

        <div className="flex-1" />

        <div className="hairline mt-4 flex items-center justify-between gap-3 border-t pt-4">
          <LikeButton
            storyId={article.id}
            likeCount={article.likeCount}
            liked={article.likedByMe}
            onChange={onLikeChange}
            onRequireAuth={onRequireAuth}
          />

          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                aria-label="More actions"
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((openMenu) => !openMenu);
                }}
                className="focus-ring grid size-8 place-items-center rounded-full text-news-subtle hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <MoreHorizontal className="size-4" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 bottom-9 z-20 min-w-[11rem] rounded-xl border border-border/60 bg-background/95 p-1 text-sm shadow-none"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left hover:bg-foreground/[0.06]"
                    onClick={() => sendFeedback("more_like")}
                  >
                    More like this
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left hover:bg-foreground/[0.06]"
                    onClick={() => sendFeedback("less_topic")}
                  >
                    Less of this topic
                  </button>
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left hover:bg-foreground/[0.06]"
                    onClick={() => sendFeedback("hide")}
                  >
                    Hide this story
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                open();
              }}
              className="focus-ring group/read inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Read
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/read:translate-x-0.5 group-hover/read:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

import { useState, type MouseEvent } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { isUnauthorized, errorMessage } from "@/lib/api";
import { toggleLike, type LikeState } from "@/lib/likeStory";

interface LikeButtonProps {
  storyId: number;
  likeCount: number;
  liked: boolean;
  onChange: (state: LikeState) => void;
  /** Called when a signed-out visitor tries to like, e.g. to open the login modal. */
  onRequireAuth?: () => void;
  size?: "sm" | "lg";
  className?: string;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}k`;
  return String(count);
}

export const LikeButton = ({
  storyId,
  likeCount,
  liked,
  onChange,
  onRequireAuth,
  size = "sm",
  className,
}: LikeButtonProps) => {
  const { isAuthenticated, refresh } = useAuth();
  const [pending, setPending] = useState(false);
  const [popping, setPopping] = useState(false);

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      // The sign-in modal says the same thing, so only toast without one.
      if (onRequireAuth) onRequireAuth();
      else
        toast("Sign in to like articles", {
          description: "Your likes shape the stories we recommend to you.",
        });
      return;
    }

    if (pending) return;
    setPending(true);

    // Optimistic flip so the heart responds instantly.
    onChange({
      storyId,
      likedByMe: !liked,
      likeCount: Math.max(0, likeCount + (liked ? -1 : 1)),
    });
    if (!liked) {
      setPopping(true);
      window.setTimeout(() => setPopping(false), 450);
    }

    try {
      onChange(await toggleLike(storyId, liked));
    } catch (error) {
      onChange({ storyId, likedByMe: liked, likeCount });
      if (isUnauthorized(error)) {
        await refresh();
        toast("Your session expired", { description: "Sign in again to like this article." });
        onRequireAuth?.();
      } else {
        toast.error(errorMessage(error, "Could not save your like"));
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Remove like" : "Like this article"}
      title={isAuthenticated ? (liked ? "Remove like" : "Like this article") : "Sign in to like articles"}
      className={cn(
        "glass-pill focus-ring group/like select-none font-medium tabular-nums transition-all duration-300",
        "hover:border-news-like/40 hover:bg-news-like/10 active:scale-95",
        size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-base",
        liked ? "border-news-like/40 bg-news-like/15 text-news-like" : "text-news-subtle hover:text-news-like",
        pending && "cursor-wait opacity-80",
        className,
      )}
    >
      {pending ? (
        <Loader2 className={cn("animate-spin", size === "sm" ? "size-4" : "size-5")} />
      ) : (
        <Heart
          className={cn(
            "transition-transform duration-300",
            size === "sm" ? "size-4" : "size-5",
            liked ? "fill-current" : "group-hover/like:scale-110",
            popping && "animate-heart-pop",
          )}
        />
      )}
      <span className="min-w-[1ch]">{formatCount(likeCount)}</span>
      <span className="sr-only">{likeCount === 1 ? "person likes" : "people like"} this article</span>
    </button>
  );
};

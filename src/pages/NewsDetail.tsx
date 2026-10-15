import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, ExternalLink, UserRound } from "lucide-react";
import { LikeButton } from "@/components/LikeButton";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import { errorMessage } from "@/lib/api";
import { fetchStory, peekFeedSession, type NewsArticle } from "@/lib/stories";
import type { LikeState } from "@/lib/likeStory";
import { useAuth } from "@/context/AuthContext";
import { useArticleDwell } from "@/hooks/use-article-dwell";

export type { NewsArticle };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, initializing } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!id || initializing) return;

    let active = true;
    setLoading(true);

    fetchStory(id)
      .then((story) => {
        if (!active) return;
        setArticle(story);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error fetching article:", err);
        setError(errorMessage(err, "Article not found"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user?.id, initializing]);

  useArticleDwell(article?.id, user?.id, peekFeedSession() ?? undefined);

  const handleLikeChange = (state: LikeState) =>
    setArticle((current) =>
      current ? { ...current, likeCount: state.likeCount, likedByMe: state.likedByMe } : current,
    );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-sm text-news-subtle">Loading article…</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-card max-w-md p-10 text-center">
          <h1 className="mb-2 font-display text-2xl text-news-header">Article not found</h1>
          <p className="mb-6 text-sm text-news-subtle">{error ?? "This story may have been removed."}</p>
          <Link
            to="/"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            <ArrowLeft className="size-4" />
            Back to news
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = (article.text ?? "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <header className="glass-chrome sticky top-0 z-50 border-b">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-news-text transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to news
          </button>

          <LikeButton
            storyId={article.id}
            likeCount={article.likeCount}
            liked={article.likedByMe}
            onChange={handleLikeChange}
            onRequireAuth={() => setShowLogin(true)}
          />
        </div>
      </header>

      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Welcome back">
        <LoginForm onSuccess={() => setShowLogin(false)} />
      </Modal>

      <main className="container mx-auto max-w-3xl px-4 pb-24 pt-10">
        <span className="glass-pill mb-5 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-foreground/90">
          {article.category}
        </span>

        <h1 className="text-balance font-display text-[2.125rem] font-medium leading-[1.15] text-news-header md:text-[2.875rem]">
          {article.title}
        </h1>

        <div className="hairline mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-b pb-6 text-sm text-news-subtle">
          {(article.author || article.source) && (
            <span className="flex items-center gap-2">
              <UserRound className="size-4" />
              <span className="font-medium text-news-text">{article.author || article.source}</span>
            </span>
          )}
          <span className="flex items-center gap-2">
            <Calendar className="size-4" />
            {formatDate(article.date)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="size-4" />
            {article.readTime} min read
          </span>
        </div>

        {article.summary && (
          <aside className="glass-card mt-8 border-l-2 border-l-primary/70 p-6">
            <p className="font-serif text-lg leading-relaxed text-news-header">{article.summary}</p>
          </aside>
        )}

        <div className="prose-reader mt-10">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="hairline mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8">
          <LikeButton
            storyId={article.id}
            likeCount={article.likeCount}
            liked={article.likedByMe}
            onChange={handleLikeChange}
            onRequireAuth={() => setShowLogin(true)}
            size="lg"
          />

          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer noopener"
              className="focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Read the original
              <ExternalLink className="size-4" />
            </a>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewsDetail;

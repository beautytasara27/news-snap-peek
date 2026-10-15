import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, LogOut, Newspaper, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { NewsCard } from "@/components/NewsCard";
import { NewsCardSkeleton } from "@/components/NewsCardSkeleton";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/api";
import { queueEvent } from "@/lib/eventBatcher";
import {
  fetchFeed,
  fetchPreferences,
  fetchStories,
  peekFeedSession,
  resetPersonalization,
  savePreferences,
  type NewsArticle,
} from "@/lib/stories";
import type { LikeState } from "@/lib/likeStory";
import { useAuth } from "@/context/AuthContext";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

type FeedMode = "foryou" | "latest";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, initializing, logout } = useAuth();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [likedOnly, setLikedOnly] = useState(false);
  const [feedMode, setFeedMode] = useState<FeedMode>("foryou");
  const [sessionId, setSessionId] = useState<string | null>(() => peekFeedSession());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [chosenTopics, setChosenTopics] = useState<string[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const searching = query.length > 0;
  const useRankedFeed = feedMode === "foryou" && !searching && !likedOnly;

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (initializing) return;

    let active = true;
    setLoading(true);

    const load = useRankedFeed
      ? fetchFeed({ page: 0, pageSize: 10, refresh: reloadKey > 0, sessionId })
          .then((feed) => {
            if (!active) return;
            setArticles(feed.items);
            setSessionId(feed.sessionId);
            setPage(0);
            setHasMore(feed.hasMore);
            setLoadError(null);
          })
      : fetchStories(query)
          .then((stories) => {
            if (!active) return;
            setArticles(stories);
            setHasMore(false);
            setLoadError(null);
          });

    load
      .catch((error) => {
        if (!active) return;
        console.error("Error fetching articles", error);
        setArticles([]);
        setLoadError(errorMessage(error, "We could not load the latest stories"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // reloadKey stands in for an explicit refresh; sessionId is written by fetchFeed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, user?.id, initializing, reloadKey, feedMode, likedOnly]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLikedOnly(false);
      setPrefsOpen(false);
    }
  }, [isAuthenticated]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((article) => article.category || "General")))],
    [articles],
  );

  const visibleArticles = useMemo(
    () =>
      articles.filter((article) => {
        const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
        return matchesCategory && (!likedOnly || article.likedByMe);
      }),
    [articles, selectedCategory, likedOnly],
  );

  const totalLikes = useMemo(
    () => articles.reduce((sum, article) => sum + article.likeCount, 0),
    [articles],
  );

  const handleArticleClick = (article: NewsArticle) => {
    queueEvent(user?.id, "click", article.id, { sessionId: sessionId ?? undefined });
    navigate(`/article/${article.id}`);
  };

  const handleLikeChange = useCallback((state: LikeState) => {
    setArticles((current) =>
      current.map((article) =>
        article.id === state.storyId
          ? { ...article, likeCount: state.likeCount, likedByMe: state.likedByMe }
          : article,
      ),
    );
  }, []);

  const handleFeedback = useCallback((type: "more_like" | "less_topic", article: NewsArticle) => {
    if (type === "more_like") {
      toast("Noted", { description: "We'll look for more stories like this." });
    } else {
      toast("Noted", { description: `We'll show less ${article.category || "of this topic"}.` });
    }
  }, []);

  const handleHide = useCallback((article: NewsArticle) => {
    setArticles((current) => current.filter((item) => item.id !== article.id));
    toast("Story hidden", { description: "It will stay out of your For you feed." });
  }, []);

  const handleLogout = async () => {
    await logout();
    toast("Signed out", { description: "You can keep reading anytime." });
  };

  const loadMore = async () => {
    if (!useRankedFeed || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const feed = await fetchFeed({ page: page + 1, pageSize: 10, sessionId });
      setSessionId(feed.sessionId);
      setPage(feed.page);
      setHasMore(feed.hasMore);
      setArticles((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...feed.items.filter((item) => !seen.has(item.id))];
      });
    } catch (error) {
      toast.error(errorMessage(error, "Could not load more stories"));
    } finally {
      setLoadingMore(false);
    }
  };

  const openPreferences = async () => {
    if (!isAuthenticated) {
      setAuthView("login");
      return;
    }
    try {
      const prefs = await fetchPreferences();
      setAvailableTopics(prefs.availableTopics);
      setChosenTopics(prefs.onboarding);
      setPrefsOpen(true);
    } catch (error) {
      toast.error(errorMessage(error, "Could not load topics"));
    }
  };

  const saveTopics = async () => {
    setSavingPrefs(true);
    try {
      await savePreferences(chosenTopics);
      setPrefsOpen(false);
      setReloadKey((value) => value + 1);
      toast("Topics saved", { description: "Your For you feed will refresh." });
    } catch (error) {
      toast.error(errorMessage(error, "Could not save topics"));
    } finally {
      setSavingPrefs(false);
    }
  };

  const resetTopics = async () => {
    setSavingPrefs(true);
    try {
      await resetPersonalization();
      setChosenTopics([]);
      setPrefsOpen(false);
      setReloadKey((value) => value + 1);
      toast("Personalization reset", { description: "Recommendation data for this account was deleted." });
    } catch (error) {
      toast.error(errorMessage(error, "Could not reset preferences"));
    } finally {
      setSavingPrefs(false);
    }
  };

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "";

  const heading = likedOnly
    ? "Your liked stories"
    : searching
      ? `Results for "${query}"`
      : useRankedFeed
        ? "For you"
        : selectedCategory === "All"
          ? "Latest stories"
          : selectedCategory;

  return (
    <div className="min-h-screen">
      <header className="glass-chrome sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3 md:gap-4">
            <a href="/" className="focus-ring flex shrink-0 items-center gap-2.5 rounded-xl">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Newspaper className="size-[1.125rem]" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-news-header md:text-xl">NewsHub</span>
            </a>

            <div className="relative order-last basis-full md:order-none md:basis-auto md:max-w-sm md:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-news-subtle" />
              <input
                type="search"
                placeholder="Search stories..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="focus-ring h-10 w-full rounded-full border border-border/70 bg-foreground/[0.04] pl-10 pr-10 text-sm text-foreground placeholder:text-news-subtle/80 transition-colors hover:bg-foreground/[0.06] focus-visible:border-primary/50"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-news-subtle transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="focus-ring hidden rounded-full px-3 py-2 text-sm font-medium text-news-text transition-colors hover:bg-foreground/[0.06] hover:text-foreground sm:inline"
                  >
                    Topics
                  </button>
                  <div className="glass-pill px-1.5 py-1.5 sm:pr-3">
                    <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
                      {initials || "·"}
                    </span>
                    <span className="hidden max-w-[9rem] truncate text-sm text-news-text sm:inline">
                      {user?.firstName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="focus-ring grid size-9 place-items-center rounded-full text-news-subtle transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setAuthView("login")}
                    className="focus-ring rounded-full px-3 py-2 text-sm font-medium text-news-text transition-colors hover:bg-foreground/[0.06] hover:text-foreground md:px-4"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthView("register")}
                    className="focus-ring whitespace-nowrap rounded-full bg-foreground px-3 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 md:px-4"
                  >
                    <span className="sm:hidden">Sign up</span>
                    <span className="hidden sm:inline">Create account</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <Modal isOpen={authView === "login"} onClose={() => setAuthView(null)} title="Welcome back">
        <LoginForm onSuccess={() => setAuthView(null)} onSwitch={() => setAuthView("register")} />
      </Modal>

      <Modal isOpen={authView === "register"} onClose={() => setAuthView(null)} title="Create your account">
        <RegisterForm onSuccess={() => setAuthView(null)} onSwitch={() => setAuthView("login")} />
      </Modal>

      <Modal isOpen={prefsOpen} onClose={() => setPrefsOpen(false)} title="Topics you follow">
        <p className="mb-4 text-sm text-news-subtle">
          Optional. You can keep reading without picking anything. These topics seed your For you feed.
        </p>
        <div className="mb-5 flex flex-wrap gap-2">
          {availableTopics.length === 0 && (
            <p className="text-sm text-news-subtle">No topics in the catalog yet.</p>
          )}
          {availableTopics.map((topic) => {
            const selected = chosenTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() =>
                  setChosenTopics((current) =>
                    selected ? current.filter((item) => item !== topic) : [...current, topic],
                  )
                }
                className={cn(
                  "focus-ring rounded-full border px-3.5 py-1.5 text-sm",
                  selected
                    ? "border-transparent bg-foreground text-background"
                    : "border-border/60 bg-foreground/[0.03] text-news-text hover:bg-foreground/[0.07]",
                )}
              >
                {topic}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={resetTopics}
            disabled={savingPrefs}
            className="focus-ring rounded-full px-3 py-2 text-sm text-news-subtle hover:text-foreground"
          >
            Reset personalization
          </button>
          <button
            type="button"
            onClick={saveTopics}
            disabled={savingPrefs}
            className="focus-ring rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Save topics
          </button>
        </div>
      </Modal>

      <main className="container mx-auto px-4 pb-20 pt-12">
        <section className="mx-auto mb-12 max-w-3xl text-center">
          <span className="glass-pill mb-5 px-3 py-1.5 text-xs font-medium text-news-text">
            <span className="size-1.5 rounded-full bg-primary" />
            Updated continuously
          </span>
          <h1 className="text-balance font-display text-4xl font-medium leading-[1.1] text-news-header md:text-[3.5rem]">
            The day's stories, <span className="text-gradient">distilled</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-news-text md:text-lg">
            Short, readable summaries across technology, science, business and health. Like the ones that
            resonate and your feed learns what you care about.
          </p>
        </section>

        <section className="mb-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFeedMode("foryou");
                setLikedOnly(false);
                setSelectedCategory("All");
              }}
              className={cn(
                "focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200",
                feedMode === "foryou" && !searching
                  ? "border-transparent bg-foreground text-background"
                  : "border-border/60 bg-foreground/[0.03] text-news-text hover:bg-foreground/[0.07]",
              )}
            >
              <Sparkles className="size-3.5" />
              For you
            </button>
            <button
              type="button"
              onClick={() => setFeedMode("latest")}
              className={cn(
                "focus-ring rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200",
                (feedMode === "latest" || searching) && !likedOnly
                  ? "border-transparent bg-foreground text-background"
                  : "border-border/60 bg-foreground/[0.03] text-news-text hover:bg-foreground/[0.07]",
              )}
            >
              Latest
            </button>
            {useRankedFeed && (
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-3.5 py-1.5 text-sm text-news-text hover:bg-foreground/[0.07]"
              >
                <RefreshCw className="size-3.5" />
                Refresh
              </button>
            )}
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="focus-ring rounded-full border border-border/60 bg-foreground/[0.03] px-3.5 py-1.5 text-sm text-news-text hover:bg-foreground/[0.07] sm:hidden"
                >
                  Topics
                </button>
                <button
                  type="button"
                  onClick={() => setLikedOnly((value) => !value)}
                  className={cn(
                    "focus-ring ml-auto shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200",
                    likedOnly
                      ? "border-news-like/40 bg-news-like/15 text-news-like"
                      : "border-border/60 bg-foreground/[0.03] text-news-text hover:bg-foreground/[0.07]",
                  )}
                >
                  <Heart className={cn("mr-1.5 inline size-3.5", likedOnly && "fill-current")} />
                  Liked by me
                </button>
              </>
            )}
          </div>

          {feedMode === "latest" && !searching && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SlidersHorizontal className="size-4 shrink-0 text-news-subtle" />
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "focus-ring shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200",
                    selectedCategory === category
                      ? "border-transparent bg-foreground text-background"
                      : "border-border/60 bg-foreground/[0.03] text-news-text hover:bg-foreground/[0.07] hover:text-foreground",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-news-header">{heading}</h2>
            {!loading && (
              <p className="text-sm text-news-subtle">
                {visibleArticles.length} {visibleArticles.length === 1 ? "story" : "stories"}
                {totalLikes > 0 && !likedOnly && ` · ${totalLikes} likes`}
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <NewsCardSkeleton key={index} index={index} />
              ))}
            </div>
          ) : loadError ? (
            <div className="glass-card mx-auto max-w-md p-10 text-center">
              <h3 className="mb-2 text-lg font-semibold text-news-header">Couldn't load stories</h3>
              <p className="mb-5 text-sm text-news-subtle">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="focus-ring rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
              >
                Try again
              </button>
            </div>
          ) : visibleArticles.length === 0 ? (
            <div className="glass-card mx-auto max-w-md p-12 text-center">
              <Newspaper className="mx-auto mb-4 size-8 text-news-subtle" />
              <h3 className="mb-2 text-lg font-semibold text-news-header">Nothing here yet</h3>
              <p className="text-sm text-news-subtle">
                {likedOnly
                  ? "Stories you like will collect here."
                  : "Try a different search or category."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleArticles.map((article, index) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    index={index}
                    userId={user?.id}
                    sessionId={sessionId ?? undefined}
                    trackImpressions={isAuthenticated && !searching}
                    onClick={handleArticleClick}
                    onLikeChange={handleLikeChange}
                    onHide={handleHide}
                    onFeedback={handleFeedback}
                    onRequireAuth={() => setAuthView("login")}
                  />
                ))}
              </div>
              {useRankedFeed && hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="focus-ring rounded-full border border-border/60 bg-foreground/[0.03] px-5 py-2 text-sm font-medium text-news-text hover:bg-foreground/[0.07]"
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="hairline border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-news-subtle md:flex-row">
          <p>&copy; {new Date().getFullYear()} NewsHub. Stay informed, stay ahead.</p>
          <p>Summaries generated from public news feeds.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

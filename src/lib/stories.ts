import { api, isUnauthorized, type ApiEnvelope } from "./api";

export interface NewsArticle {
  id: number;
  title: string;
  summary: string | null;
  text: string;
  url?: string;
  author: string | null;
  /** Publisher label derived from the url, e.g. "BBC". */
  source: string | null;
  date: string;
  category: string | null;
  imageUrl?: string | null;
  readTime: number;
  likeCount: number;
  likedByMe: boolean;
  reason?: { code: string; label: string; pool?: string };
}

const WORDS_PER_MINUTE = 220;

/** Keeps older rows (saved before the backend stored a read time) usable. */
export function readTimeOf(article: Pick<NewsArticle, "readTime" | "text" | "summary">): number {
  if (article.readTime > 0) return article.readTime;
  const source = article.text || article.summary || "";
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function normalize(raw: NewsArticle): NewsArticle {
  return {
    ...raw,
    category: raw.category || "General",
    likeCount: raw.likeCount ?? 0,
    likedByMe: raw.likedByMe ?? false,
    readTime: readTimeOf(raw),
  };
}

export async function fetchStories(search?: string): Promise<NewsArticle[]> {
  const path =
    search && search.trim() !== ""
      ? `/summaries/search/${encodeURIComponent(search.trim())}`
      : "/summaries";

  const { data } = await api.get<ApiEnvelope<NewsArticle[]>>(path);
  return (data.data ?? []).map(normalize);
}

export async function fetchStory(id: string | number): Promise<NewsArticle> {
  const { data } = await api.get<ApiEnvelope<NewsArticle>>(`/summaries/${id}`);
  return normalize(data.data);
}

export interface FeedPage {
  sessionId: string;
  page: number;
  pageSize: number;
  hasMore: boolean;
  total: number;
  serverMs: number;
  items: NewsArticle[];
}

const FEED_SESSION_KEY = "newshub.feedSession";

export function peekFeedSession(): string | null {
  try {
    return sessionStorage.getItem(FEED_SESSION_KEY);
  } catch {
    return null;
  }
}

export function storeFeedSession(id: string) {
  try {
    sessionStorage.setItem(FEED_SESSION_KEY, id);
  } catch {
    /* ignore */
  }
}

export function clearFeedSession() {
  try {
    sessionStorage.removeItem(FEED_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export async function fetchFeed(options: {
  page?: number;
  pageSize?: number;
  refresh?: boolean;
  sessionId?: string | null;
}): Promise<FeedPage> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 0));
  params.set("pageSize", String(options.pageSize ?? 10));
  if (options.refresh) params.set("refresh", "1");
  const session = options.sessionId ?? peekFeedSession();
  if (session && !options.refresh) params.set("session", session);
  try {
    const { data } = await api.get<ApiEnvelope<FeedPage>>(`/feed?${params.toString()}`);
    const page = {
      ...data.data,
      items: (data.data.items ?? []).map((item) => normalize(item as NewsArticle)),
    };
    if (page.sessionId) storeFeedSession(page.sessionId);
    return page;
  } catch (error) {
    if (isUnauthorized(error) && session) {
      clearFeedSession();
      const retry = new URLSearchParams();
      retry.set("page", String(options.page ?? 0));
      retry.set("pageSize", String(options.pageSize ?? 10));
      const { data } = await api.get<ApiEnvelope<FeedPage>>(`/feed?${retry.toString()}`);
      const page = {
        ...data.data,
        items: (data.data.items ?? []).map((item) => normalize(item as NewsArticle)),
      };
      if (page.sessionId) storeFeedSession(page.sessionId);
      return page;
    }
    throw error;
  }
}

export async function fetchPreferences(): Promise<{
  onboarding: string[];
  availableTopics: string[];
  less: string[];
}> {
  const { data } = await api.get<ApiEnvelope<{ onboarding: string[]; availableTopics: string[]; less: string[] }>>(
    "/me/preferences",
  );
  return data.data;
}

export async function savePreferences(topics: string[]) {
  const { data } = await api.put<ApiEnvelope<{ onboarding: string[] }>>("/me/preferences", { topics });
  return data.data;
}

export async function resetPersonalization() {
  await api.post("/me/preferences/reset");
}


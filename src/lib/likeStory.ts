import { api, type ApiEnvelope } from "./api";

export interface LikeState {
  storyId: number;
  likeCount: number;
  likedByMe: boolean;
}

/**
 * The user is never sent from the client - the backend reads it from the auth
 * cookie/token, so every like is tied to the signed-in account.
 */
export async function likeStory(storyId: number): Promise<LikeState> {
  const { data } = await api.post<ApiEnvelope<LikeState>>("/like", { story_id: storyId });
  return data.data;
}

export async function unlikeStory(storyId: number): Promise<LikeState> {
  const { data } = await api.delete<ApiEnvelope<LikeState>>(`/like/${storyId}`);
  return data.data;
}

export function toggleLike(storyId: number, currentlyLiked: boolean): Promise<LikeState> {
  return currentlyLiked ? unlikeStory(storyId) : likeStory(storyId);
}

/** Story ids the signed-in user has liked - the signal for recommendations. */
export async function fetchMyLikedStoryIds(): Promise<number[]> {
  const { data } = await api.get<ApiEnvelope<{ storyIds: number[] }>>("/likes/me");
  return data.data?.storyIds ?? [];
}

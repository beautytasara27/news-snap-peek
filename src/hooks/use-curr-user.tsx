import { useAuth, type User } from "@/context/AuthContext";

export type { User };

/**
 * Thin wrapper kept for existing call sites; the session itself lives in
 * AuthContext so every component sees the same user.
 */
export function useCurrentUser() {
  const { user, initializing, refresh } = useAuth();

  return {
    user,
    loading: initializing,
    fetchUser: refresh,
  };
}

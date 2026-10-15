// AuthContext.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, errorMessage, setToken, type ApiEnvelope } from "@/lib/api";
import { clearFeedSession } from "@/lib/stories";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegistrationDetails extends Credentials {
  firstName: string;
  lastName: string;
}

interface AuthSession {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  /** True until the stored session has been checked against the backend. */
  initializing: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  refresh: () => Promise<User | null>;
  login: (credentials: Credentials) => Promise<User>;
  register: (details: RegistrationDetails) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<ApiEnvelope<User>>("/me");
      setUser(data.data);
      return data.data;
    } catch {
      setUser(null);
      setToken(null);
      return null;
    }
  }, []);

  // Restore the session on boot so a refresh does not silently sign you out.
  useEffect(() => {
    let active = true;
    (async () => {
      await refresh();
      if (active) setInitializing(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const authenticate = useCallback(
    async (path: "/login" | "/register", body: Credentials | RegistrationDetails, fallback: string) => {
      try {
        const { data } = await api.post<ApiEnvelope<AuthSession>>(path, body);
        const session = data.data;
        if (session?.token) setToken(session.token);
        if (session?.user) {
          setUser(session.user);
          return session.user;
        }
        const me = await refresh();
        if (!me) throw new Error(fallback);
        return me;
      } catch (error) {
        throw new Error(errorMessage(error, fallback));
      }
    },
    [refresh],
  );

  const login = useCallback(
    (credentials: Credentials) => authenticate("/login", credentials, "Could not sign you in"),
    [authenticate],
  );

  const register = useCallback(
    (details: RegistrationDetails) => authenticate("/register", details, "Could not create your account"),
    [authenticate],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      /* clearing local state matters more than the round trip */
    }
    setToken(null);
    setUser(null);
    clearFeedSession();
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      setUser,
      refresh,
      login,
      register,
      logout,
    }),
    [user, initializing, refresh, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

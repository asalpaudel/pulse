import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as authApi from "../api/auth";
import * as storage from "../api/storage";
import { TOKEN_KEY, USER_KEY } from "../api/storage";
import { setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  // Start in loading until we've read secure storage once.
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (nextToken, nextUser) => {
    if (nextToken) await storage.setItem(TOKEN_KEY, nextToken);
    else await storage.removeItem(TOKEN_KEY);
    if (nextUser) await storage.setItem(USER_KEY, JSON.stringify(nextUser));
    else await storage.removeItem(USER_KEY);
    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const logout = useCallback(async () => {
    await persist(null, null);
    setProfile(null);
  }, [persist]);

  // Refresh full user + profile from /auth/me.
  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      const nextUser = me.user;
      setProfile(me.profile ?? null);
      setUser((prev) => {
        const merged = { ...prev, ...nextUser };
        storage.setItem(USER_KEY, JSON.stringify(merged));
        return merged;
      });
      return me;
    } catch {
      return null;
    }
  }, []);

  // On mount: hydrate session from secure storage, wire up the 401 handler.
  useEffect(() => {
    let active = true;
    setUnauthorizedHandler(() => {
      // Hard 401 — clear everything and let the navigator switch to the
      // auth stack (driven by `token` falling to null).
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setProfile(null);
    });

    (async () => {
      try {
        const [storedToken, storedUserRaw] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
        ]);
        if (!active) return;
        if (storedToken) {
          setToken(storedToken);
          try {
            setUser(storedUserRaw ? JSON.parse(storedUserRaw) : null);
          } catch {
            setUser(null);
          }
          await refreshMe();
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      await persist(data.token, { id: data.userId, role: data.role });
      await refreshMe();
      return data;
    },
    [persist, refreshMe],
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      await persist(data.token, { id: data.userId, role: data.role });
      await refreshMe();
      return data;
    },
    [persist, refreshMe],
  );

  const value = {
    token,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(token),
    role: user?.role || null,
    login,
    register,
    logout,
    refreshMe,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

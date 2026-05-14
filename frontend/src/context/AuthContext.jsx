import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "pulse_token";
const USER_KEY = "pulse_user";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
    setProfile(null);
  }, [persist]);

  // Refresh full user + profile from /auth/me.
  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      // /auth/me returns { user, profile } — see API_CONTRACT.md.
      const nextUser = me.user;
      setProfile(me.profile ?? null);
      setUser((prev) => {
        const merged = { ...prev, ...nextUser };
        localStorage.setItem(USER_KEY, JSON.stringify(merged));
        return merged;
      });
      return me;
    } catch {
      // Leave existing state; interceptor handles hard 401.
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    // Resolve the session asynchronously so we never setState synchronously
    // inside the effect body.
    Promise.resolve()
      .then(() => (token ? refreshMe() : null))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      persist(data.token, { id: data.userId, role: data.role });
      await refreshMe();
      return data;
    },
    [persist, refreshMe],
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      persist(data.token, { id: data.userId, role: data.role });
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth";
import SessionTimeoutMonitor from "../components/SessionTimeoutMonitor";

const AuthContext = createContext(null);

const TOKEN_KEY = "pulse_token";
const USER_KEY = "pulse_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // An expired server session is already logged out.
    } finally {
      persist(null, null);
      setProfile(null);
    }
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
      persist(null, null);
      setProfile(null);
      return null;
    }
  }, [persist]);

  useEffect(() => {
    let active = true;
    // Resolve the session asynchronously so we never setState synchronously
    // inside the effect body.
    Promise.resolve()
      .then(refreshMe)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshMe]);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      if (data.twoFactorRequired) return data;
      persist(null, { id: data.userId, role: data.role });
      await refreshMe();
      return data;
    },
    [persist, refreshMe],
  );

  const verifyTwoFactor = useCallback(
    async (payload) => {
      const data = await authApi.verifyTwoFactor(payload);
      persist(null, { id: data.userId, role: data.role });
      await refreshMe();
      return data;
    },
    [persist, refreshMe],
  );

  const register = useCallback(
    async (payload) => authApi.register(payload),
    [],
  );

  const verifyEmail = useCallback(
    async ({ email, code, password }) => {
      await authApi.verifyEmail({ email, code });
      const session = await authApi.login({ email, password });
      persist(null, { id: session.userId, role: session.role });
      await refreshMe();
      return session;
    },
    [persist, refreshMe],
  );

  const resendVerification = useCallback(
    async (email) => authApi.resendVerification({ email }),
    [],
  );

  const value = {
    token,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    login,
    verifyTwoFactor,
    register,
    verifyEmail,
    resendVerification,
    logout,
    refreshMe,
    setProfile,
  };

  const handleInactivityTimeout = useCallback(async () => {
    await logout();
    window.location.assign("/login?reason=inactive");
  }, [logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {Boolean(user) && <SessionTimeoutMonitor onTimeout={handleInactivityTimeout} />}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

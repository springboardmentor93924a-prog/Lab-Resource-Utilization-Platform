import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "../api/authApi";
import { registerUser, getUserByEmail } from "../api/userApi";
import { decodeJwt } from "../utils/jwt";
import { extractErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  // On mount, if we already have a token, make sure it's still valid by
  // re-fetching the user profile (also fills `user` in on a hard refresh).
  useEffect(() => {
    const existingToken = localStorage.getItem("token");
    if (!existingToken) {
      setLoading(false);
      return;
    }
    const claims = decodeJwt(existingToken);
    const email = claims?.sub || claims?.email;
    if (!email) {
      setLoading(false);
      return;
    }
    getUserByEmail(email)
      .then((profile) => {
        persistUser(profile);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { token: jwt } = await loginRequest(email, password);
    localStorage.setItem("token", jwt);
    setToken(jwt);
    // The JWT only carries email + role; pull the full profile (institution,
    // department, isActive, etc.) so the rest of the app has real data to work with.
    const profile = await getUserByEmail(email).catch(() => {
      const claims = decodeJwt(jwt);
      return { email, role: claims?.role };
    });
    persistUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    persistUser(null);
  }, []);

  const role = user?.role || decodeJwt(token || "")?.role || null;

  const value = {
    token,
    user,
    role,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
    refreshUser: async () => {
      if (!user?.email) return;
      const profile = await getUserByEmail(user.email);
      persistUser(profile);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { extractErrorMessage };

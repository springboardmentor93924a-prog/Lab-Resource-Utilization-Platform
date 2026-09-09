/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore existing session when the app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to restore user session:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  // Save normal login/register session
  const persistSession = useCallback((response) => {
    const userData = {
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    };

    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  }, []);

  // Save Google registration response
  const persistGoogleResponse = useCallback(
    (response) => {
      persistSession(response);
    },
    [persistSession]
  );

  // Normal email/password login
  const login = useCallback(
    async (email, password) => {
      const response = await loginUser({
        email,
        password,
      });

      persistSession(response);

      return response;
    },
    [persistSession]
  );

  // Normal registration
  const register = useCallback(
    async (formData) => {
      const response = await registerUser(formData);

      persistSession(response);

      return response;
    },
    [persistSession]
  );

  // Existing Google user login
  const setGoogleSession = useCallback(async (token) => {
    localStorage.setItem("token", token);

    const response = await getCurrentUser();

    const userData = {
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    };

    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    return response;
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setGoogleSession,
        persistGoogleResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}
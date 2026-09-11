/* eslint-disable react-hooks/set-state-in-effect, react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  function persistSession(response) {
    localStorage.setItem("token", response.token);
    localStorage.setItem(
      "user",
      JSON.stringify({ email: response.email, fullName: response.fullName, role: response.role })
    );
    setUser({ email: response.email, fullName: response.fullName, role: response.role });
  }

  async function login(email, password) {
    const response = await loginUser({ email, password });
    persistSession(response);
    return response;
  }

  async function register(formData) {
    const response = await registerUser(formData);
    persistSession(response);
    return response;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchMe } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("ems_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchMe(token);
        setUser(data.user);
      } catch {
        // Token invalid or expired — clear it
        localStorage.removeItem("ems_token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    validate();
  }, [token]);

  const login = useCallback((authData) => {
    const { token: newToken, user: newUser } = authData;
    localStorage.setItem("ems_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ems_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

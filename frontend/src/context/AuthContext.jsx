import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchMe } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("ems_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Track whether the token came from a fresh login (skip re-validation in that case)
  const freshLogin = useRef(false);

  useEffect(() => {
    // If login() just set the token, skip fetchMe — user is already set
    if (freshLogin.current) {
      freshLogin.current = false;
      setIsLoading(false);
      return;
    }

    // No token → not logged in
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Validate existing token from localStorage
    const validate = async () => {
      try {
        const data = await fetchMe(token);
        setUser(data.user);
      } catch {
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
    freshLogin.current = true;
    localStorage.setItem("ems_token", authData.token);
    setToken(authData.token);
    setUser(authData.user);
    setIsLoading(false);
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

import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setCurrentUser(res.data.user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    setCurrentUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    setCurrentUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (e) {
      // session may already be gone, proceed anyway
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, setCurrentUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

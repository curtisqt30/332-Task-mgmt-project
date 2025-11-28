import React, { createContext, useState, useContext, useEffect } from "react";

const API = process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8000";

type User = {
  userId: number;
  userName: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API}/api/auth/me`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Map backend userID to frontend userId
        setUser({
          userId: userData.userID,
          userName: userData.userName,
        });
      }
    } catch (error) {
      // Not logged in or server error - that's fine
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    // Map backend userID to frontend userId
    setUser({
      userId: data.user.userID,
      userName: data.user.userName,
    });
  };

  const register = async (username: string, password: string) => {
    const response = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: username, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }

    const data = await response.json();
    // Map backend userID to frontend userId
    setUser({
      userId: data.user.userID,
      userName: data.user.userName,
    });
  };

  const logout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore logout errors
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
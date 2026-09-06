import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const AUTH_STORAGE_KEY = "sentio-authenticated";
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "sentio";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredAuthentication() {
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(getStoredAuthentication);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login: (username, password) => {
        const configuredUsername = import.meta.env.VITE_AUTH_USERNAME || DEFAULT_USERNAME;
        const configuredPassword = import.meta.env.VITE_AUTH_PASSWORD || DEFAULT_PASSWORD;
        const matches = username === configuredUsername && password === configuredPassword;

        if (matches) {
          window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
          setIsAuthenticated(true);
        }

        return matches;
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

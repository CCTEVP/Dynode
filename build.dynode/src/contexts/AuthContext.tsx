import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import authService from "../services/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  domains: string[];
  setDomains: (domains: string[]) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [domains, setDomainsState] = useState<string[]>([]);

  const checkAuth = () => {
    const authenticated = authService.isAuthenticated();
    console.debug("[AuthContext] checkAuth -> isAuthenticated:", authenticated);
    setIsAuthenticated(authenticated);
    // load persisted domains (if any)
    const persisted = authService.getUserDomains();
    setDomainsState(persisted || []);
    setIsLoading(false);
  };

  const login = (token: string) => {
    authService.setToken(token);
    setIsAuthenticated(true);
    // try to get domains from service (token may have been parsed there)
    const persisted = authService.getUserDomains();
    setDomainsState(persisted || []);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setDomainsState([]);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        domains,
        setDomains: (d: string[]) => {
          setDomainsState(d);
          authService.setUserDomains(d);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// `useAuth` moved to its own module `src/contexts/useAuth.ts` to improve HMR stability.

// Backwards-compatible re-export so existing imports continue to work
export { useAuth } from "./useAuth";

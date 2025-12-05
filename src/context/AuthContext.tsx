import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import apiClient from '../lib/apiClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  // UPDATE: Accept an optional redirect path
  login: (token: string, redirectPath?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiClient.get('/profile/me');
          setUser(response.data);
        } catch (error) {
          console.error('Session expired or invalid', error);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  // UPDATE: Use the redirectPath if provided
  const login = (token: string, redirectPath: string = '/dashboard') => {
    localStorage.setItem('authToken', token);
    window.location.href = redirectPath;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);

    // --- FIX: CLEAR TAWK.TO SESSION ---
    if (window.Tawk_API) {
      try {
        // 1. End the current chat session to clear history view
        if (typeof window.Tawk_API.endChat === 'function') {
          window.Tawk_API.endChat();
        }

        // 2. Wipe the visitor data so the next login starts fresh
        // (Note: setAttributes with empty data forces a reset)
        if (typeof window.Tawk_API.setAttributes === 'function') {
          window.Tawk_API.setAttributes({
            name: '',
            email: '',
            id: ''
          }, function (error: any) { });
        }
      } catch (e) {
        console.warn("Tawk cleanup failed", e);
      }
    }
    // ----------------------------------

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
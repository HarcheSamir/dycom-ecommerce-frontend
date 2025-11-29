import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react'; // Use type-only import for ReactNode
import apiClient from '../lib/apiClient';

// Define the shape of your user object
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
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

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    // You could fetch the user profile here immediately or let the app do it
    window.location.href = '/dashboard'; // Redirect to a protected page
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/login'; // Redirect to login
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
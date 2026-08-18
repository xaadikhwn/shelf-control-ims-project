import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../services/authApi';
import { setAccessToken, setOnAuthFailure } from '../services/apiClient';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  initials?: string;
  studentId?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUser(u: any): AuthUser {
  const fullName = u.full_name || u.name || 'User';
  const generatedInitials = fullName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'US';

  return {
    id: String(u.id || u._id || ''),
    name: fullName,
    email: u.email,
    role: u.role || 'User',
    initials: u.initials || generatedInitials,
    studentId: u.studentId || u.student_id || `USR-${u.id || '001'}`,
    avatarUrl: u.avatar_url || u.avatarUrl,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Attempt silent refresh on app startup
  const initAuth = useCallback(async () => {
    try {
      const refreshRes = await authApi.refresh();
      if (refreshRes.success && refreshRes.data?.accessToken) {
        setAccessToken(refreshRes.data.accessToken);
        const meRes = await authApi.getMe();
        if (meRes.success && meRes.data) {
          setUser(mapUser(meRes.data));
        }
      }
    } catch {
      // Session absent or expired; user will remain logged out
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnAuthFailure(() => {
      setUser(null);
      setAccessToken(null);
    });
    initAuth();
  }, [initAuth]);

  const login = async (credentials: any) => {
    const res = await authApi.login(credentials);
    if (!res?.success) {
      throw new Error(res?.error?.message || 'Login failed');
    }

    const token = res.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }
    const userData = res.data?.user || res.data;
    setUser(mapUser(userData));
    toast.success('Successfully logged in!');
  };

  const registerUser = async (data: any) => {
    const res = await authApi.register(data);
    if (!res?.success) {
      throw new Error(res?.error?.message || 'Registration failed');
    }

    const token = res.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }
    const userData = res.data?.user || res.data;
    setUser(mapUser(userData));
    toast.success('Successfully registered!');
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

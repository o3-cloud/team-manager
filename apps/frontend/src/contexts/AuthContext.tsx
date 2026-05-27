import { createContext, type ReactNode, useContext, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  register: (email: string, displayName: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = getToken();
    return { user: null, token };
  });

  async function register(email: string, displayName: string, password: string) {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/register', {
      email,
      displayName,
      password,
    });
    setToken(res.accessToken);
    setState({ user: res.user, token: res.accessToken });
  }

  async function login(email: string, password: string) {
    const res = await api.post<{ accessToken: string; user: User }>('/auth/login', {
      email,
      password,
    });
    setToken(res.accessToken);
    setState({ user: res.user, token: res.accessToken });
  }

  function logout() {
    clearToken();
    setState({ user: null, token: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

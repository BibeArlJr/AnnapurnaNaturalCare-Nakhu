'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  async function fetchUser() {
    try {
      const res = await apiGet('/auth/me');
      setUser(res.data || null);
      setError('');
    } catch (err) {
      setUser(null);
      setError('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await apiPost('/auth/login', { email, password });
      setUser(res.data || null);
      setError('');
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await apiPost('/auth/logout');
    } catch (err) {
      // ignore errors on logout
    }
    setUser(null);
    router.push('/admin/login');
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refresh: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

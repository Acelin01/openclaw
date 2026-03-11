/**
 * 认证状态 Hook
 * 用于在 React 组件中管理登录状态
 */

import { useState, useEffect, useCallback } from 'react';
import { authService, User } from '../services/auth';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (email: string, name: string, password: string, role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN') => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  guestLogin: () => Promise<{ success: boolean; message: string }>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  // 监听认证状态变化
  useEffect(() => {
    const checkAuth = () => {
      setUser(authService.getCurrentUser());
    };
    
    // 初始检查
    checkAuth();

    // 监听 storage 事件（多标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });
      if (result.success) {
        setUser(authService.getCurrentUser());
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (
    email: string,
    name: string,
    password: string,
    role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
  ) => {
    setIsLoading(true);
    try {
      const result = await authService.register({ email, name, password, role });
      if (result.success) {
        setUser(authService.getCurrentUser());
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const guestLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authService.guestLogin();
      if (result.success) {
        setUser(authService.getCurrentUser());
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    guestLogin,
  };
}

export default useAuth;

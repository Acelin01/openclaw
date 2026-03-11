/**
 * 认证路由组件
 * 集成到主应用的路由系统
 */

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthPage } from './AuthPage';
import { VerifyForm } from './VerifyForm';
import { SettingsForm } from './SettingsForm';
import { useAuth } from '../../hooks/useAuth';

/**
 * 受保护的路由组件
 * 未登录用户重定向到认证页面
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--cream)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--copper-bg)',
            borderTopColor: 'var(--copper)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          <div style={{ color: 'var(--ink3)', fontSize: '14px' }}>加载中...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

/**
 * 公开路由组件
 * 已登录用户重定向到首页
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * 认证路由配置
 * 用法：<AuthRoutes />
 */
export function AuthRoutes() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/verify"
        element={
          <PublicRoute>
            <VerifyForm />
          </PublicRoute>
        }
      />

      {/* 受保护的路由 */}
      <Route
        path="/auth/settings"
        element={
          <ProtectedRoute>
            <SettingsForm />
          </ProtectedRoute>
        }
      />

      {/* 默认重定向 */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

/**
 * 主应用路由集成示例
 * 
 * 在 App.tsx 中使用:
 * 
 * ```tsx
 * import { AuthRoutes } from './components/auth/AuthRoutes';
 * 
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/*" element={<AuthRoutes />} />
 *       <Route path="/dashboard" element={<Dashboard />} />
 *       <Route path="/chat" element={<Chat />} />
 *     </Routes>
 *   );
 * }
 * ```
 */

export default AuthRoutes;

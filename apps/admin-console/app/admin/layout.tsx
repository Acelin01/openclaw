import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Console</div>
        <nav className="admin-nav">
          <a href="/admin">概览</a>
          <a href="/admin/metrics">指标</a>
          <a href="/admin/tenants">租户</a>
          <a href="/admin/users">用户</a>
          <a href="/admin/members">成员</a>
          <a href="/admin/projects">项目</a>
          <a href="/admin/tasks">任务</a>
          <a href="/admin/permissions">权限</a>
          <a href="/admin/gateway">网关调用</a>
          <a href="/admin/alerts">告警</a>
          <a href="/admin/external">对外MCP</a>
        </nav>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

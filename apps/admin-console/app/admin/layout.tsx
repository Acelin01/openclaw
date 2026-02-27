import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          padding: 24,
          borderRight: "1px solid #e5e7eb",
          background: "#fafafa",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 16 }}>Admin Console</div>
        <nav style={{ display: "grid", gap: 8 }}>
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
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}

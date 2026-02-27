"use client";

import { useState } from "react";

type RequestRow = {
  id: string;
  method: string;
  status: string;
  tenantId: string;
  projectId: string | null;
  channel: string | null;
  requestedAt: string;
  approvedAt: string | null;
  executedAt: string | null;
};

type TenantOption = { id: string; name: string };

export default function GatewayRequestTable({
  initial,
  tenants,
  defaultTenantId,
}: {
  initial: RequestRow[];
  tenants: TenantOption[];
  defaultTenantId?: string;
}) {
  const [rows, setRows] = useState<RequestRow[]>(initial);
  const [error, setError] = useState<string>("");
  const [tenantId, setTenantId] = useState<string>(defaultTenantId ?? "");

  const action = async (id: string, kind: "approve" | "reject" | "execute") => {
    setError("");
    const res = await fetch(`/api/admin/gateway-requests/${id}/${kind}`, { method: "POST" });
    if (!res.ok) {
      const payload = (await res.json()) as { error?: string };
      setError(payload.error ?? "操作失败");
      return;
    }
    const updated = await fetch(
      `/api/admin/gateway-requests?limit=20&tenantId=${encodeURIComponent(tenantId)}`,
    );
    const payload = (await updated.json()) as { requests?: RequestRow[] };
    setRows(payload.requests ?? []);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2>审批队列</h2>
      <div style={{ marginBottom: 12 }}>
        <select value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
          <option value="">选择租户</option>
          {tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            const updated = await fetch(
              `/api/admin/gateway-requests?limit=20&tenantId=${encodeURIComponent(tenantId)}`,
            );
            const payload = (await updated.json()) as { requests?: RequestRow[] };
            setRows(payload.requests ?? []);
          }}
          style={{ marginLeft: 8 }}
        >
          刷新
        </button>
      </div>
      {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>ID</th>
            <th style={{ textAlign: "left" }}>方法</th>
            <th style={{ textAlign: "left" }}>状态</th>
            <th style={{ textAlign: "left" }}>租户</th>
            <th style={{ textAlign: "left" }}>项目</th>
            <th style={{ textAlign: "left" }}>渠道</th>
            <th style={{ textAlign: "left" }}>请求时间</th>
            <th style={{ textAlign: "left" }}>审批时间</th>
            <th style={{ textAlign: "left" }}>执行时间</th>
            <th style={{ textAlign: "left" }}>动作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.method}</td>
              <td>{row.status}</td>
              <td>{row.tenantId}</td>
              <td>{row.projectId ?? "-"}</td>
              <td>{row.channel ?? "-"}</td>
              <td>{row.requestedAt}</td>
              <td>{row.approvedAt ?? "-"}</td>
              <td>{row.executedAt ?? "-"}</td>
              <td>
                {row.status === "pending" ? (
                  <>
                    <button onClick={() => action(row.id, "approve")}>批准</button>
                    <button onClick={() => action(row.id, "reject")} style={{ marginLeft: 8 }}>
                      拒绝
                    </button>
                  </>
                ) : null}
                {row.status === "approved" ? (
                  <button onClick={() => action(row.id, "execute")}>执行</button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

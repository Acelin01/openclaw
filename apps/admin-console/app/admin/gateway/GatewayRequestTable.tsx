"use client";

import { useState } from "react";

type RequestRow = {
  id: string;
  method: string;
  status: string;
  tenantId: string;
  projectId: string | null;
  channel: string | null;
  approvalLevelRequired: number;
  approvalLevelCurrent: number;
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
  const statusBadge = (status: string) => {
    const value = status.toLowerCase();
    if (value === "approved" || value === "executed") return "badge badge-success";
    if (value === "pending" || value === "second_pending") return "badge badge-warning";
    if (value === "rejected" || value === "failed") return "badge badge-danger";
    return "badge";
  };
  const levelBadge = (current: number, required: number) => {
    if (current >= required) return "badge badge-success";
    if (current === 0) return "badge badge-warning";
    return "badge";
  };
  const normalizeRows = (input: RequestRow[]) =>
    input.map((row) => ({
      id: row.id,
      method: row.method,
      status: row.status,
      tenantId: row.tenantId,
      projectId: row.projectId ?? null,
      channel: row.channel ?? null,
      approvalLevelRequired: row.approvalLevelRequired ?? 1,
      approvalLevelCurrent: row.approvalLevelCurrent ?? 0,
      requestedAt: row.requestedAt,
      approvedAt: row.approvedAt ?? null,
      executedAt: row.executedAt ?? null,
    }));

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
    setRows(normalizeRows(payload.requests ?? []));
  };

  return (
    <div className="mt-24 stack">
      <h2>审批队列</h2>
      <div className="toolbar-row mb-12">
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
            setRows(normalizeRows(payload.requests ?? []));
          }}
          className="btn"
        >
          刷新
        </button>
      </div>
      {error ? <div className="text-error">{error}</div> : null}
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>ID</th>
            <th>方法</th>
            <th>状态</th>
            <th>租户</th>
            <th>项目</th>
            <th>渠道</th>
            <th>审批</th>
            <th>请求时间</th>
            <th>审批时间</th>
            <th>执行时间</th>
            <th>动作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.method}</td>
              <td>
                <span className={statusBadge(row.status)}>{row.status}</span>
              </td>
              <td>{row.tenantId}</td>
              <td>{row.projectId ?? "-"}</td>
              <td>{row.channel ?? "-"}</td>
              <td>
                <span className={levelBadge(row.approvalLevelCurrent, row.approvalLevelRequired)}>
                  {row.approvalLevelCurrent}/{row.approvalLevelRequired}
                </span>
              </td>
              <td>{row.requestedAt}</td>
              <td>{row.approvedAt ?? "-"}</td>
              <td>{row.executedAt ?? "-"}</td>
              <td>
                {row.status === "pending" || row.status === "second_pending" ? (
                  <div className="table-actions">
                    <button onClick={() => action(row.id, "approve")} className="btn btn-primary">
                      {row.approvalLevelCurrent === 0 ? "一级通过" : "二级通过"}
                    </button>
                    <button onClick={() => action(row.id, "reject")} className="btn btn-danger">
                      拒绝
                    </button>
                  </div>
                ) : null}
                {row.status === "approved" ? (
                  <button onClick={() => action(row.id, "execute")} className="btn btn-secondary">
                    执行
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

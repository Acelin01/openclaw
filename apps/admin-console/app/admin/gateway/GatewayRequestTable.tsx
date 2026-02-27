"use client";

import { useState } from "react";

type RequestRow = {
  id: string;
  method: string;
  status: string;
  requestedAt: string;
  approvedAt: string | null;
  executedAt: string | null;
};

export default function GatewayRequestTable({ initial }: { initial: RequestRow[] }) {
  const [rows, setRows] = useState<RequestRow[]>(initial);
  const [error, setError] = useState<string>("");

  const action = async (id: string, kind: "approve" | "reject" | "execute") => {
    setError("");
    const res = await fetch(`/api/admin/gateway-requests/${id}/${kind}`, { method: "POST" });
    if (!res.ok) {
      const payload = (await res.json()) as { error?: string };
      setError(payload.error ?? "操作失败");
      return;
    }
    const updated = await fetch("/api/admin/gateway-requests?limit=20");
    const payload = (await updated.json()) as { requests?: RequestRow[] };
    setRows(payload.requests ?? []);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h2>审批队列</h2>
      {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>ID</th>
            <th style={{ textAlign: "left" }}>方法</th>
            <th style={{ textAlign: "left" }}>状态</th>
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

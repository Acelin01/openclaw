"use client";

import { useState } from "react";

export default function GatewayCallForm() {
  const [method, setMethod] = useState("health");
  const [params, setParams] = useState("{}");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setResult("");
    let body: unknown = undefined;
    try {
      body = params.trim() ? JSON.parse(params) : undefined;
    } catch {
      setError("参数不是合法 JSON");
      return;
    }
    const res = await fetch(`/api/admin/gateway-requests`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method, params: body }),
    });
    const payload = (await res.json()) as { ok: boolean; request?: unknown; error?: string };
    if (!payload.ok) {
      setError(payload.error ?? "调用失败");
      return;
    }
    setResult(JSON.stringify(payload.request, null, 2));
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
      <label>
        方法
        <input value={method} onChange={(event) => setMethod(event.target.value)} />
      </label>
      <label>
        参数(JSON)
        <textarea
          rows={8}
          value={params}
          onChange={(event) => setParams(event.target.value)}
          style={{ width: "100%" }}
        />
      </label>
      <button type="submit">提交审批</button>
      {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
      {result ? (
        <pre style={{ background: "#111", color: "#eee", padding: 16, borderRadius: 8 }}>
          {result}
        </pre>
      ) : null}
    </form>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type ApiClient = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  rateLimitPerMin: number;
  defaultProjectId: string | null;
  defaultTeamId: string | null;
  toolAllowlist: string[] | null;
  permissionAllowlist: string[] | null;
};

type ApiToken = {
  id: string;
  name: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
};

export default function ExternalClientsPanel() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [rawToken, setRawToken] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    rateLimitPerMin: "60",
    defaultProjectId: "",
    defaultTeamId: "",
    toolAllowlist: "",
    permissionAllowlist: "",
  });
  const [tokenForm, setTokenForm] = useState({ name: "default", expiresAt: "" });

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId],
  );

  const refreshClients = async () => {
    const res = await fetch("/api/admin/external/clients");
    const payload = (await res.json()) as { data?: ApiClient[] };
    setClients(payload.data ?? []);
    if (!selectedClientId && payload.data && payload.data.length > 0) {
      setSelectedClientId(payload.data[0].id);
    }
  };

  const refreshTokens = async (clientId: string) => {
    if (!clientId) {
      return;
    }
    const res = await fetch(`/api/admin/external/clients/${clientId}/tokens`);
    const payload = (await res.json()) as { data?: ApiToken[] };
    setTokens(payload.data ?? []);
  };

  useEffect(() => {
    void refreshClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      void refreshTokens(selectedClientId);
    }
  }, [selectedClientId]);

  const createClient = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("");
    const res = await fetch("/api/admin/external/clients", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        rateLimitPerMin: Number(form.rateLimitPerMin || 60),
      }),
    });
    const payload = (await res.json()) as { data?: ApiClient; message?: string };
    if (!res.ok) {
      setStatus(payload.message ?? "创建失败");
      return;
    }
    setStatus("创建成功");
    setForm({
      name: "",
      description: "",
      rateLimitPerMin: "60",
      defaultProjectId: "",
      defaultTeamId: "",
      toolAllowlist: "",
      permissionAllowlist: "",
    });
    await refreshClients();
    if (payload.data?.id) {
      setSelectedClientId(payload.data.id);
    }
  };

  const updateClient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClientId) {
      return;
    }
    setStatus("");
    const res = await fetch(`/api/admin/external/clients/${selectedClientId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        rateLimitPerMin: Number(form.rateLimitPerMin || 60),
        status: selectedClient?.status,
      }),
    });
    if (!res.ok) {
      const payload = (await res.json()) as { message?: string };
      setStatus(payload.message ?? "更新失败");
      return;
    }
    setStatus("更新成功");
    await refreshClients();
  };

  const createToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClientId) {
      return;
    }
    setRawToken("");
    const res = await fetch(`/api/admin/external/clients/${selectedClientId}/tokens`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tokenForm),
    });
    const payload = (await res.json()) as { data?: { raw?: string } };
    if (res.ok && payload.data?.raw) {
      setRawToken(payload.data.raw);
      await refreshTokens(selectedClientId);
    }
  };

  const fillFromSelected = () => {
    if (!selectedClient) {
      return;
    }
    setForm({
      name: selectedClient.name,
      description: selectedClient.description ?? "",
      rateLimitPerMin: String(selectedClient.rateLimitPerMin ?? 60),
      defaultProjectId: selectedClient.defaultProjectId ?? "",
      defaultTeamId: selectedClient.defaultTeamId ?? "",
      toolAllowlist: (selectedClient.toolAllowlist ?? []).join(","),
      permissionAllowlist: (selectedClient.permissionAllowlist ?? []).join(","),
    });
  };

  return (
    <section>
      <h1>对外 MCP 管理</h1>
      <div style={{ display: "grid", gap: 20, maxWidth: 960 }}>
        <div>
          <h2>创建 Client</h2>
          <form onSubmit={createClient} style={{ display: "grid", gap: 8 }}>
            <input
              placeholder="名称"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <input
              placeholder="描述"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <input
              placeholder="每分钟限流"
              value={form.rateLimitPerMin}
              onChange={(event) => setForm({ ...form, rateLimitPerMin: event.target.value })}
            />
            <input
              placeholder="默认项目ID"
              value={form.defaultProjectId}
              onChange={(event) => setForm({ ...form, defaultProjectId: event.target.value })}
            />
            <input
              placeholder="默认团队ID"
              value={form.defaultTeamId}
              onChange={(event) => setForm({ ...form, defaultTeamId: event.target.value })}
            />
            <input
              placeholder="工具白名单(逗号分隔)"
              value={form.toolAllowlist}
              onChange={(event) => setForm({ ...form, toolAllowlist: event.target.value })}
            />
            <input
              placeholder="权限白名单(逗号分隔)"
              value={form.permissionAllowlist}
              onChange={(event) => setForm({ ...form, permissionAllowlist: event.target.value })}
            />
            <button type="submit">创建</button>
          </form>
          {status ? <div style={{ color: "#2563eb" }}>{status}</div> : null}
        </div>

        <div>
          <h2>现有 Clients</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              <option value="">选择 Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={fillFromSelected}>
              回填配置
            </button>
            <button type="button" onClick={refreshClients}>
              刷新
            </button>
          </div>
          {selectedClient ? (
            <div style={{ marginTop: 12 }}>
              <div>ID: {selectedClient.id}</div>
              <div>状态: {selectedClient.status}</div>
              <div>限流: {selectedClient.rateLimitPerMin}/min</div>
            </div>
          ) : null}
          <form onSubmit={updateClient} style={{ display: "grid", gap: 8, marginTop: 12 }}>
            <input
              placeholder="名称"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <input
              placeholder="描述"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <input
              placeholder="每分钟限流"
              value={form.rateLimitPerMin}
              onChange={(event) => setForm({ ...form, rateLimitPerMin: event.target.value })}
            />
            <input
              placeholder="默认项目ID"
              value={form.defaultProjectId}
              onChange={(event) => setForm({ ...form, defaultProjectId: event.target.value })}
            />
            <input
              placeholder="默认团队ID"
              value={form.defaultTeamId}
              onChange={(event) => setForm({ ...form, defaultTeamId: event.target.value })}
            />
            <input
              placeholder="工具白名单(逗号分隔)"
              value={form.toolAllowlist}
              onChange={(event) => setForm({ ...form, toolAllowlist: event.target.value })}
            />
            <input
              placeholder="权限白名单(逗号分隔)"
              value={form.permissionAllowlist}
              onChange={(event) => setForm({ ...form, permissionAllowlist: event.target.value })}
            />
            <button type="submit">更新</button>
          </form>
        </div>

        <div>
          <h2>Token 管理</h2>
          <form onSubmit={createToken} style={{ display: "grid", gap: 8, maxWidth: 480 }}>
            <input
              placeholder="Token 名称"
              value={tokenForm.name}
              onChange={(event) => setTokenForm({ ...tokenForm, name: event.target.value })}
            />
            <input
              placeholder="过期时间(ISO)"
              value={tokenForm.expiresAt}
              onChange={(event) => setTokenForm({ ...tokenForm, expiresAt: event.target.value })}
            />
            <button type="submit">生成 Token</button>
          </form>
          {rawToken ? (
            <div style={{ marginTop: 8 }}>
              <div>新 Token</div>
              <pre style={{ background: "#111", color: "#eee", padding: 12 }}>{rawToken}</pre>
            </div>
          ) : null}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>名称</th>
                <th style={{ textAlign: "left" }}>上次使用</th>
                <th style={{ textAlign: "left" }}>过期</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id}>
                  <td>{token.name}</td>
                  <td>{token.lastUsedAt ?? "-"}</td>
                  <td>{token.expiresAt ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

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

type ApiUsage = {
  id: string;
  tool: string | null;
  endpoint: string;
  statusCode: number;
  latencyMs: number | null;
  createdAt: string;
};

export default function ExternalClientsPanel() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [usage, setUsage] = useState<ApiUsage[]>([]);
  const [usageTotal, setUsageTotal] = useState<number>(0);
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
  const [usageFilter, setUsageFilter] = useState({
    from: "",
    to: "",
    tool: "",
    limit: "50",
  });

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId),
    [clients, selectedClientId],
  );

  const statusBadge = (value?: string | null) => {
    const normalized = (value ?? "").toLowerCase();
    if (!normalized) return "badge";
    if (["active", "enabled", "approved"].includes(normalized)) return "badge badge-success";
    if (["paused", "pending", "warning"].includes(normalized)) return "badge badge-warning";
    if (["disabled", "revoked", "suspended", "blocked"].includes(normalized)) {
      return "badge badge-danger";
    }
    return "badge";
  };

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

  const refreshUsage = async (clientId: string) => {
    if (!clientId) {
      return;
    }
    const params = new URLSearchParams();
    if (usageFilter.from) params.set("from", usageFilter.from);
    if (usageFilter.to) params.set("to", usageFilter.to);
    if (usageFilter.tool) params.set("tool", usageFilter.tool);
    if (usageFilter.limit) params.set("limit", usageFilter.limit);
    const res = await fetch(
      `/api/admin/external/clients/${clientId}/usage?${params.toString()}`,
    );
    const payload = (await res.json()) as { data?: { total?: number; logs?: ApiUsage[] } };
    setUsage(payload.data?.logs ?? []);
    setUsageTotal(payload.data?.total ?? 0);
  };

  useEffect(() => {
    void refreshClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      void refreshTokens(selectedClientId);
      void refreshUsage(selectedClientId);
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
      <div className="panel-grid">
        <div className="panel-card">
          <h2>创建 Client</h2>
          <form onSubmit={createClient} className="form-stack">
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
            <button type="submit" className="btn btn-primary">
              创建
            </button>
          </form>
          {status ? <div className="text-info">{status}</div> : null}
        </div>

        <div className="panel-card">
          <h2>现有 Clients</h2>
          <div className="toolbar-row">
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
            <button type="button" onClick={fillFromSelected} className="btn">
              回填配置
            </button>
            <button type="button" onClick={refreshClients} className="btn">
              刷新
            </button>
          </div>
          {selectedClient ? (
            <div className="stack-sm mt-12">
              <div>ID: {selectedClient.id}</div>
              <div>
                状态: <span className={statusBadge(selectedClient.status)}>{selectedClient.status}</span>
              </div>
              <div>限流: {selectedClient.rateLimitPerMin}/min</div>
            </div>
          ) : null}
          <form onSubmit={updateClient} className="form-stack mt-12">
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
            <button type="submit" className="btn btn-primary">
              更新
            </button>
          </form>
        </div>

        <div className="panel-card">
          <h2>Token 管理</h2>
          <form onSubmit={createToken} className="form-stack form-stack-mid">
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
            <button type="submit" className="btn btn-primary">
              生成 Token
            </button>
          </form>
          {rawToken ? (
            <div className="mt-8">
              <div>新 Token</div>
              <pre className="token-box">{rawToken}</pre>
            </div>
          ) : null}
          <table className="mt-12 table-striped table-compact">
            <thead>
              <tr>
                <th>名称</th>
                <th>上次使用</th>
                <th>过期</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id}>
                  <td>{token.name}</td>
                  <td>{token.lastUsedAt ?? "-"}</td>
                  <td>
                    {token.expiresAt ? (
                      <span className="badge badge-warning">{token.expiresAt}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-card">
          <h2>用量统计</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!selectedClientId) {
                return;
              }
              void refreshUsage(selectedClientId);
            }}
            className="form-stack form-stack-mid"
          >
            <input
              placeholder="开始时间(ISO)"
              value={usageFilter.from}
              onChange={(event) => setUsageFilter({ ...usageFilter, from: event.target.value })}
            />
            <input
              placeholder="结束时间(ISO)"
              value={usageFilter.to}
              onChange={(event) => setUsageFilter({ ...usageFilter, to: event.target.value })}
            />
            <input
              placeholder="工具名筛选"
              value={usageFilter.tool}
              onChange={(event) => setUsageFilter({ ...usageFilter, tool: event.target.value })}
            />
            <input
              placeholder="条数"
              value={usageFilter.limit}
              onChange={(event) => setUsageFilter({ ...usageFilter, limit: event.target.value })}
            />
            <button type="submit" className="btn">
              查询
            </button>
          </form>
          <div className="mt-8">总调用: {usageTotal}</div>
          <table className="mt-12 table-striped table-compact">
            <thead>
              <tr>
                <th>时间</th>
                <th>工具</th>
                <th>状态</th>
                <th>耗时</th>
              </tr>
            </thead>
            <tbody>
              {usage.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAt}</td>
                  <td>{row.tool ?? "-"}</td>
                  <td>{row.statusCode}</td>
                  <td>{row.latencyMs ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

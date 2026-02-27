"use client";

import { useMemo, useState } from "react";

type TenantOption = { id: string; name: string };
type RoleOption = { id: string; name: string; tenantId: string; tenantName: string };
type ProjectOption = { id: string; name: string; tenantId: string; tenantName: string };

export default function GatewayCallForm(props: {
  tenants: TenantOption[];
  roles: RoleOption[];
  projects: ProjectOption[];
  defaultTenantId?: string;
}) {
  const [tenantId, setTenantId] = useState(props.defaultTenantId ?? "");
  const [roleId, setRoleId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [channel, setChannel] = useState("");
  const [method, setMethod] = useState("health");
  const [params, setParams] = useState("{}");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const filteredRoles = useMemo(
    () => props.roles.filter((role) => !tenantId || role.tenantId === tenantId),
    [props.roles, tenantId],
  );
  const filteredProjects = useMemo(
    () => props.projects.filter((project) => !tenantId || project.tenantId === tenantId),
    [props.projects, tenantId],
  );

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
      body: JSON.stringify({
        method,
        params: body,
        tenantId,
        roleId,
        projectId,
        channel,
      }),
    });
    const payload = (await res.json()) as { ok: boolean; request?: unknown; error?: string };
    if (!payload.ok) {
      setError(payload.error ?? "调用失败");
      return;
    }
    setResult(JSON.stringify(payload.request, null, 2));
  };

  return (
    <form onSubmit={submit} className="form-stack-wide">
      <label>
        租户
        <select value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
          <option value="">选择租户</option>
          {props.tenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        角色
        <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
          <option value="">选择角色（用于权限校验）</option>
          {filteredRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} / {role.tenantName}
            </option>
          ))}
        </select>
      </label>
      <label>
        项目
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
          <option value="">选择项目（用于指标归属）</option>
          {filteredProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} / {project.tenantName}
            </option>
          ))}
        </select>
      </label>
      <label>
        渠道
        <input value={channel} onChange={(event) => setChannel(event.target.value)} />
      </label>
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
          className="input-full"
        />
      </label>
      <button type="submit" className="btn btn-primary">
        提交审批
      </button>
      {error ? <div className="text-error">{error}</div> : null}
      {result ? <pre>{result}</pre> : null}
    </form>
  );
}

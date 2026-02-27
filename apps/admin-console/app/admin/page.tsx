import { callGatewayHealth } from "../../lib/gateway/client";

export default async function AdminHome() {
  let health: unknown = null;
  let error: string | null = null;
  try {
    health = await callGatewayHealth();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  return (
    <section>
      <h1>概览</h1>
      <div style={{ marginTop: 16 }}>
        <h2>网关健康</h2>
        {error ? (
          <div style={{ color: "#b91c1c" }}>{error}</div>
        ) : (
          <pre style={{ background: "#111", color: "#eee", padding: 16, borderRadius: 8 }}>
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
      </div>
    </section>
  );
}

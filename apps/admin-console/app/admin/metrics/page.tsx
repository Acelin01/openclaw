import { prisma } from "../../../lib/db";

export default async function MetricsPage() {
  const metrics = await prisma.metricDaily.findMany({
    orderBy: [{ date: "desc" }, { scope: "asc" }],
    take: 50,
  });
  return (
    <section>
      <h1>指标看板</h1>
      <form method="post" action="/api/admin/metrics/refresh" style={{ margin: "16px 0" }}>
        <button type="submit">刷新今日指标</button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>日期</th>
            <th style={{ textAlign: "left" }}>范围</th>
            <th style={{ textAlign: "left" }}>租户</th>
            <th style={{ textAlign: "left" }}>项目</th>
            <th style={{ textAlign: "left" }}>渠道</th>
            <th style={{ textAlign: "left" }}>指标</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((row) => (
            <tr key={row.id}>
              <td>{row.date.toISOString().slice(0, 10)}</td>
              <td>{row.scope}</td>
              <td>{row.tenantId ?? "-"}</td>
              <td>{row.projectId ?? "-"}</td>
              <td>{row.channel ?? "-"}</td>
              <td>{JSON.stringify(row.metrics)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

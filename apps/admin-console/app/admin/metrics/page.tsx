import { prisma } from "../../../lib/db";

export default async function MetricsPage() {
  const metrics = await prisma.metricDaily.findMany({
    orderBy: [{ date: "desc" }, { scope: "asc" }],
    take: 50,
  });
  return (
    <section>
      <h1>指标看板</h1>
      <form method="post" action="/api/admin/metrics/refresh" className="my-16">
        <button type="submit" className="btn btn-primary">
          刷新今日指标
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>日期</th>
            <th>范围</th>
            <th>租户</th>
            <th>项目</th>
            <th>渠道</th>
            <th>指标</th>
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

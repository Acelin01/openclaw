import { prisma } from "../../../lib/db";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>用户</h1>
      <form method="post" action="/api/admin/users" style={{ margin: "16px 0" }}>
        <input name="email" placeholder="邮箱" />
        <input name="name" placeholder="姓名" style={{ marginLeft: 8 }} />
        <button type="submit" style={{ marginLeft: 8 }}>
          新建
        </button>
      </form>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>ID</th>
            <th style={{ textAlign: "left" }}>邮箱</th>
            <th style={{ textAlign: "left" }}>姓名</th>
            <th style={{ textAlign: "left" }}>创建时间</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.name ?? "-"}</td>
              <td>{user.createdAt.toISOString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

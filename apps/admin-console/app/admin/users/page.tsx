import { prisma } from "../../../lib/db";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section>
      <h1>用户</h1>
      <form method="post" action="/api/admin/users" className="form-inline my-16">
        <input name="email" placeholder="邮箱" />
        <input name="name" placeholder="姓名" />
        <button type="submit" className="btn btn-primary">
          新建
        </button>
      </form>
      <table className="table-striped table-compact">
        <thead>
          <tr>
            <th>ID</th>
            <th>邮箱</th>
            <th>姓名</th>
            <th>创建时间</th>
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

"use client";

import { useState } from "react";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (res.ok) {
      window.location.href = "/admin";
      return;
    }
    const data = (await res.json()) as { error?: string };
    setStatus(data.error ?? "登录失败");
  };

  return (
    <main className="page-shell page-narrow stack">
      <h1>管理员登录</h1>
      <form onSubmit={submit} className="form-stack">
        <input
          placeholder="管理员密钥"
          value={key}
          onChange={(event) => setKey(event.target.value)}
        />
        <button type="submit">登录</button>
      </form>
      {status ? <div className="text-error mt-12">{status}</div> : null}
    </main>
  );
}

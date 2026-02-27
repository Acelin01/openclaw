import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const required = process.env.ADMIN_API_KEY?.trim();
  if (!required) {
    return NextResponse.json({ ok: true });
  }
  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? ((await request.json()) as Record<string, string>)
      : Object.fromEntries((await request.formData()).entries());
  const key = typeof payload.key === "string" ? payload.key.trim() : "";
  if (!key || key !== required) {
    return NextResponse.json({ ok: false, error: "invalid_key" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_key", key, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}

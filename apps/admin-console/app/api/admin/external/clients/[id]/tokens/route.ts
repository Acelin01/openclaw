import { NextResponse } from "next/server";
import { isAdminAuthorized } from "../../../../../../../lib/auth";
import { resolveExternalApiBase, resolveExternalServiceSecret } from "../../../../../../../lib/external-api";

async function proxy(request: Request, path: string) {
  const base = resolveExternalApiBase();
  const secret = resolveExternalServiceSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "service_secret_missing" }, { status: 500 });
  }
  const url = new URL(request.url);
  const target = `${base}${path}${url.search}`;
  const headers = new Headers({ "x-service-secret": secret });
  if (request.headers.get("content-type")) {
    headers.set("content-type", request.headers.get("content-type") as string);
  }
  const body = request.method === "GET" ? undefined : await request.text();
  const res = await fetch(target, { method: request.method, headers, body });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "content-type": "application/json" } });
}

export async function GET(request: Request, context: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return proxy(request, `/api/v1/admin/external/clients/${context.params.id}/tokens`);
}

export async function POST(request: Request, context: { params: { id: string } }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return proxy(request, `/api/v1/admin/external/clients/${context.params.id}/tokens`);
}

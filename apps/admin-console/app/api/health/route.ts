import { NextResponse } from "next/server";
import { callGatewayHealth } from "../../../lib/gateway/client";

export async function GET() {
  try {
    const gateway = await callGatewayHealth();
    return NextResponse.json({ ok: true, gateway });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}

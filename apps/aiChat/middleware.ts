import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { guestRegex } from "./lib/constants";

export default auth(async (request: any) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  console.log(`[Middleware] Path: ${pathname}, HasSession: ${!!session}`);

  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/v1") || pathname.startsWith("/api/document") || ["/login", "/register"].includes(pathname)) {
    if (session && ["/login", "/register"].includes(pathname)) {
       return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const redirectUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${redirectUrl}`, request.url)
    );
  }

  const isGuest = guestRegex.test(session.user?.email ?? "");

  if (session && !isGuest && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

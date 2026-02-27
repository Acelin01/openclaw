"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/api/auth"];

export function SessionAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If we're loading, do nothing
    if (status === "loading") return;

    const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

    // If there's no session and we're on a non-public path, redirect to login
    if (!session && !isPublicPath) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [session, status, pathname, router]);

  // Optionally show nothing or a loader while redirecting
  // But we want to allow rendering the page if it's a public path or if we have a session
  return <>{children}</>;
}

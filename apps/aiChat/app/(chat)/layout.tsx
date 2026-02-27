import { cookies } from "next/headers";
import Script from "next/script";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DataStreamProvider } from "@uxin/artifact-ui";
import { SidebarInset, SidebarProvider } from "@uxin/ui";
import { auth } from "@/app/(auth)/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="afterInteractive"
      />
      <DataStreamProvider>
        <Suspense fallback={<div className="flex h-dvh" />}>
          <SidebarWrapper>{children}</SidebarWrapper>
        </Suspense>
      </DataStreamProvider>
    </>
  );
}

async function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);

  if (!session || !session.user) {
    redirect("/login");
  }

  const sidebarState = cookieStore.get("sidebar_state")?.value;
  // If no cookie exists, default to collapsed (isCollapsed = true).
  // If cookie exists, "true" means expanded (isCollapsed = false).
  // Otherwise (including "false"), it is collapsed (isCollapsed = true).
  const isCollapsed = sidebarState !== "true";

  return (
    <SidebarProvider defaultOpen={!isCollapsed} key={sidebarState ?? "default"} className="h-svh overflow-hidden">
      <AppSidebar user={session?.user} />
      <SidebarInset className="h-full overflow-y-auto">{children}</SidebarInset>
    </SidebarProvider>
  );
}

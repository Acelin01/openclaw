import { Suspense } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { SquareWorker, SquareService } from "@uxin/square";
import WorkerDetailClient from "./client";
import { transformWorkerDetail } from "@/lib/transformers";

const fixUrl = (u?: string) => (u && u.startsWith("/") ? `${getApiBaseUrl()}${u}` : u);

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4" />}>
      <WorkerDetailPage id={params.id} />
    </Suspense>
  );
}

async function WorkerDetailPage({ id }: { id: string }) {
  let worker: SquareWorker | null = null;
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/public/users/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const u = data?.data ?? data;
      worker = transformWorkerDetail(u);
    }
  } catch {}

  if (!worker) {
    return <div className="container mx-auto py-12 px-4">未找到该职业者</div>;
  }

  return <WorkerDetailClient worker={worker} />;
}

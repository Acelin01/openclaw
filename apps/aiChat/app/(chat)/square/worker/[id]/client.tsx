"use client";

import { useRouter } from "next/navigation";
import { SquareWorker, SquareWorkerDetail } from "@uxin/square";

export default function WorkerDetailClient({ worker }: { worker: SquareWorker }) {
  const router = useRouter();
  const handleViewService = (id?: string) => {
    if (!id) return;
    router.push(`/square/service/${id}`);
  };
  return <SquareWorkerDetail worker={worker} onViewService={handleViewService} />;
}

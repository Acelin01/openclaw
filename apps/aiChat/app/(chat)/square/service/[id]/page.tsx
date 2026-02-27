import { Suspense } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { SquareServiceDetail, SquareService } from "@uxin/square";
import { transformServiceDetail } from "@/lib/transformers";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4" />}>
      <ServiceDetailPage id={params.id} />
    </Suspense>
  );
}

async function ServiceDetailPage({ id }: { id: string }) {
  let service: SquareService | null = null;
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/marketplace/services/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const s = data?.data ?? data;
      service = transformServiceDetail(s);
    }
  } catch {}

  if (!service) {
    return <div className="container mx-auto py-12 px-4">未找到该服务</div>;
  }

  return <SquareServiceDetail service={service} />;
}

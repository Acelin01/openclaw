import { PricingHeader } from "@/components/pricing-header";

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pt-[73px]">
      <PricingHeader />
      {children}
    </div>
  );
}

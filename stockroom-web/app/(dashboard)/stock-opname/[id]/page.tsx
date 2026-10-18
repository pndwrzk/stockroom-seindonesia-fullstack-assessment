import { Suspense } from "react";
import { PermissionGate } from "@/features/auth/components/permission-gate";
import { StockOpnameDetailView } from "@/features/stock-opname/components/stock-opname-detail-view";

export default function StockOpnameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <PermissionGate permission={{ module: "STOCK_OPNAME", action: "VIEW" }}>
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading stock opname details...
          </div>
        }
      >
        <StockOpnameDetailPageContent params={params} />
      </Suspense>
    </PermissionGate>
  );
}

async function StockOpnameDetailPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StockOpnameDetailView stockOpnameId={id} />;
}

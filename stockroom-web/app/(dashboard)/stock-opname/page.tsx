import { StockOpnamesList } from "@/app/(dashboard)/stock-opname/stock-opnames-list";
import { PermissionGate } from "@/features/auth/components/permission-gate";

export default function StockOpnamePage() {
  return (
    <PermissionGate permission={{ module: "STOCK_OPNAME", action: "VIEW" }}>
      <StockOpnamesList />
    </PermissionGate>
  );
}

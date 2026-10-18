import { InventoryList } from "@/app/(dashboard)/inventory/inventory-list";
import { PermissionGate } from "@/features/auth/components/permission-gate";

export default function InventoryPage() {
  return (
    <PermissionGate permission={{ module: "INVENTORY", action: "VIEW" }}>
      <InventoryList />
    </PermissionGate>
  );
}

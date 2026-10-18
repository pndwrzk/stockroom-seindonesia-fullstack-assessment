import { StoresList } from "@/app/(dashboard)/stores/stores-list";
import { PermissionGate } from "@/features/auth/components/permission-gate";

export default function StoresPage() {
  return (
    <PermissionGate permission={{ module: "STORES", action: "VIEW" }}>
      <StoresList />
    </PermissionGate>
  );
}

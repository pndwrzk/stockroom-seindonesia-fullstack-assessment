import { ProductsList } from "@/app/(dashboard)/products/products-list";
import { PermissionGate } from "@/features/auth/components/permission-gate";

export default function ProductsPage() {
  return (
    <PermissionGate permission={{ module: "PRODUCTS", action: "VIEW" }}>
      <ProductsList />
    </PermissionGate>
  );
}
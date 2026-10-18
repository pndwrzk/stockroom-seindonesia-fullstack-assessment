import { DashboardSummary } from "@/features/dashboard/components/dashboard-summary";
import { PermissionGate } from "@/features/auth/components/permission-gate";

export default function HomePage() {
  return (
    <PermissionGate permission={{ module: "DASHBOARD", action: "VIEW" }}>
      <DashboardSummary />
    </PermissionGate>
  );
}

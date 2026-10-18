import { UsersList } from "@/app/(dashboard)/users/users-list";
import { PermissionGate } from "@/features/auth/components/permission-gate";

export default function UsersPage() {
  return (
    <PermissionGate permission={{ module: "USERS", action: "VIEW" }}>
      <UsersList />
    </PermissionGate>
  );
}
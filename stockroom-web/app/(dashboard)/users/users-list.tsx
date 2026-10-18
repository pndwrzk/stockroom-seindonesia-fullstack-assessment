"use client";

import { useState } from "react";
import { Ellipsis, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { userRoles } from "@/features/auth/constants/user-roles";
import { hasPermission } from "@/features/auth/constants/permissions";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useUserMutations } from "@/features/users/hooks/use-user-mutations";
import type { UserFormValues } from "@/features/users/schemas/user-mutation.schema";
import type { UserRecord } from "@/features/users/schemas/users.schema";
import { UserFormDialog } from "@/features/users/components/user-form-dialog";
import { useUsers } from "@/features/users/hooks/use-users";

export function UsersList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const { user: currentUser } = useCurrentUser();
  const actorRole = Number(currentUser?.roleId);
  const canCreateUsers = hasPermission(currentUser?.role, {
    module: "USERS",
    action: "CREATE",
  });
  const canEditUsers = hasPermission(currentUser?.role, {
    module: "USERS",
    action: "EDIT",
  });
  const canDeleteUsers = hasPermission(currentUser?.role, {
    module: "USERS",
    action: "DELETE",
  });
  const canShowActions = canEditUsers || canDeleteUsers;
  const {
    users,
    meta,
    page,
    searchInput,
    setSearchInput,
    setPage,
    submitSearch,
    reload,
    isLoading,
    errorMessage,
  } = useUsers();
  const { saveUser, deleteUser, isSaving } = useUserMutations(reload);
  const deleteConfirmation = useConfirmDialog<UserRecord>({
    title: "Delete user?",
    description: (user) => `This will permanently delete ${user.name}.`,
    confirmLabel: "Delete user",
    onConfirm: (user) => deleteUser(user.id),
  });

  const openCreateForm = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user: UserRecord) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const submitUserForm = (values: UserFormValues) =>
    saveUser(selectedUser?.id ?? null, values);

  return (
    <section className="space-y-5">
     
        <CardContent>
          {canCreateUsers && (
            <div className="mb-4 flex justify-end">
              <Button type="button" onClick={openCreateForm}>
                <Plus aria-hidden="true" />
                Add user
              </Button>
            </div>
          )}
          <form className="mb-4 flex gap-2" onSubmit={submitSearch}>
            <Input
              aria-label="Search users"
              placeholder="Search by name, username, or NIK"
              className="h-9 max-w-sm"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Button type="submit" variant="outline" size="sm" className="h-9" aria-label="Search">
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>

          {errorMessage ? (
            <div role="alert" className="border-y border-border py-8 text-center text-sm text-destructive">
              {errorMessage}
            </div>
          ) : (
            <Card className="py-0">
              <Table className="min-w-[680px]">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">NIK</TableHead>
                    <TableHead scope="col">Name</TableHead>
                  <TableHead scope="col">Username</TableHead>
                  <TableHead scope="col">Role</TableHead>
                  <TableHead scope="col">Store</TableHead>
                  {canShowActions && <TableHead scope="col" className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={canShowActions ? 6 : 5} className="h-24 text-center text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canShowActions ? 6 : 5} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="tabular-nums">{user.nik}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell className="capitalize">{userRoles[user.role]}</TableCell>
                      <TableCell>{user.store?.name ?? "—"}</TableCell>
                      {canShowActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${user.name}`}
                              className="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                            >
                              <Ellipsis aria-hidden="true" className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              {canEditUsers && (
                                <DropdownMenuItem onClick={() => openEditForm(user)}>
                                  <Pencil aria-hidden="true" />
                                  Update
                                </DropdownMenuItem>
                              )}
                              {canDeleteUsers && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => deleteConfirmation.requestConfirmation(user)}
                                >
                                  <Trash2 aria-hidden="true" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </Card>
          )}

          <DataPagination
            itemCount={users.length}
            totalCount={meta?.total ?? null}
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? null}
            isLoading={isLoading}
            itemLabel="users"
            onPageChange={setPage}
          />
        </CardContent>
     
      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={selectedUser}
        actorRole={actorRole}
        actorStoreId={currentUser?.storeId ?? null}
        isSaving={isSaving}
        onSubmit={submitUserForm}
      />
      {deleteConfirmation.dialog}
    </section>
  );
}

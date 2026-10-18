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
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { hasPermission } from "@/features/auth/constants/permissions";
import { StoreFormDialog } from "@/features/stores/components/store-form-dialog";
import { useStoreMutations } from "@/features/stores/hooks/use-store-mutations";
import { useStores } from "@/features/stores/hooks/use-stores";
import type { StoreFormValues } from "@/features/stores/schemas/store-mutation.schema";
import type { StoreRecord } from "@/features/stores/schemas/stores.schema";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function StoresList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreRecord | null>(null);
  const { user: currentUser } = useCurrentUser();
  const canCreateStores = hasPermission(currentUser?.role, {
    module: "STORES",
    action: "CREATE",
  });
  const canEditStores = hasPermission(currentUser?.role, {
    module: "STORES",
    action: "EDIT",
  });
  const canDeleteStores = hasPermission(currentUser?.role, {
    module: "STORES",
    action: "DELETE",
  });
  const canShowActions = canEditStores || canDeleteStores;
  const {
    stores,
    meta,
    page,
    searchInput,
    setSearchInput,
    setPage,
    submitSearch,
    reload,
    isLoading,
    errorMessage,
  } = useStores();
  const { saveStore, deleteStore, isSaving } =
    useStoreMutations(reload);
  const deleteConfirmation = useConfirmDialog<StoreRecord>({
    title: "Delete store?",
    description: (store) => `This will permanently delete ${store.name}.`,
    confirmLabel: "Delete store",
    onConfirm: (store) => deleteStore(store.id),
  });

  const openCreateForm = () => {
    setSelectedStore(null);
    setIsFormOpen(true);
  };

  const openEditForm = (store: StoreRecord) => {
    setSelectedStore(store);
    setIsFormOpen(true);
  };

  const submitStoreForm = (values: StoreFormValues) =>
    saveStore(selectedStore?.id ?? null, values);

  return (
    <section className="space-y-5">
     
        <CardContent>
          {canCreateStores && (
            <div className="mb-4 flex justify-end">
              <Button type="button" onClick={openCreateForm}>
                <Plus aria-hidden="true" />
                Add store
              </Button>
            </div>
          )}
          <form className="mb-4 flex gap-2" onSubmit={submitSearch}>
            <Input
              aria-label="Search stores"
              placeholder="Search by store code, name, or address"
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
                  <TableHead scope="col">Code</TableHead>
                  <TableHead scope="col">Name</TableHead>
                  <TableHead scope="col">Address</TableHead>
                  <TableHead scope="col">Created</TableHead>
                  {canShowActions && <TableHead scope="col" className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={canShowActions ? 5 : 4} className="h-24 text-center text-muted-foreground">
                      Loading stores...
                    </TableCell>
                  </TableRow>
                ) : stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canShowActions ? 5 : 4} className="h-24 text-center text-muted-foreground">
                      No stores found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.code}</TableCell>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>
                        {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                          new Date(store.createdAt)
                        )}
                      </TableCell>
                      {canShowActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${store.name}`}
                              className="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                            >
                              <Ellipsis aria-hidden="true" className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              {canEditStores && (
                                <DropdownMenuItem onClick={() => openEditForm(store)}>
                                  <Pencil aria-hidden="true" />
                                  Update
                                </DropdownMenuItem>
                              )}
                              {canDeleteStores && (
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => deleteConfirmation.requestConfirmation(store)}
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
            itemCount={stores.length}
            totalCount={meta?.total ?? null}
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? null}
            isLoading={isLoading}
            itemLabel="stores"
            onPageChange={setPage}
          />
        </CardContent>
    
      <StoreFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        store={selectedStore}
        isSaving={isSaving}
        onSubmit={submitStoreForm}
      />
      {deleteConfirmation.dialog}
    </section>
  );
}

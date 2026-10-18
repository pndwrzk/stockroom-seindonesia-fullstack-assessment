"use client";

import { useState } from "react";
import { Ellipsis, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AddInventoryDialog } from "@/features/inventory/components/add-inventory-dialog";
import { useCreateStoreStock } from "@/features/inventory/hooks/use-create-store-stock";
import { useDeleteStoreStock } from "@/features/inventory/hooks/use-delete-store-stock";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import type { StoreStockRecord } from "@/features/inventory/schemas/store-stocks.schema";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function InventoryList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useCurrentUser();
  const canCreateInventory = hasPermission(user?.role, {
    module: "INVENTORY",
    action: "CREATE",
  });
  const canDeleteInventory = hasPermission(user?.role, {
    module: "INVENTORY",
    action: "DELETE",
  });
  const canShowActions = canDeleteInventory;
  const {
    inventory,
    meta,
    page,
    searchInput,
    setSearchInput,
    submitSearch,
    setPage,
    reload,
    isLoading,
    errorMessage,
  } = useInventory();
  const { createStoreStock, isSaving } = useCreateStoreStock(reload);
  const { deleteStoreStock } = useDeleteStoreStock(reload);
  const deleteConfirmation = useConfirmDialog<StoreStockRecord>({
    title: "Delete inventory?",
    description: (stock) =>
      `This will permanently delete ${stock.product.name} from ${stock.store.name}.`,
    confirmLabel: "Delete inventory",
    onConfirm: (stock) => deleteStoreStock(stock.id),
  });

  return (
    <section className="space-y-5">
     
        <CardContent>
          {canCreateInventory && (
            <div className="mb-4 flex justify-end">
              <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
                <Plus aria-hidden="true" />
                Add inventory
              </Button>
            </div>
          )}
          <form className="mb-4 flex gap-2" onSubmit={submitSearch}>
            <Input
              aria-label="Search inventory"
              placeholder="Search by SKU, product, store code, or store name"
              className="h-9 max-w-sm"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-9"
              aria-label="Search"
            >
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>
          {errorMessage ? (
            <div
              role="alert"
              className="border-y border-border py-8 text-center text-sm text-destructive"
            >
              {errorMessage}
            </div>
          ) : (
            <Card className="py-0">
              <Table className="min-w-[740px]">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">SKU</TableHead>
                    <TableHead scope="col">Product</TableHead>
                  <TableHead scope="col">Unit</TableHead>
                  <TableHead scope="col">Store code</TableHead>
                  <TableHead scope="col">Store</TableHead>
                  <TableHead scope="col" className="text-right">Quantity</TableHead>
                  {canShowActions && <TableHead scope="col" className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={canShowActions ? 7 : 6} className="h-24 text-center text-muted-foreground">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canShowActions ? 7 : 6} className="h-24 text-center text-muted-foreground">
                      No inventory found.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.product.sku}</TableCell>
                      <TableCell>{stock.product.name}</TableCell>
                      <TableCell>{stock.product.unit ?? "—"}</TableCell>
                      <TableCell>{stock.store.code}</TableCell>
                      <TableCell>{stock.store.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {stock.quantity.toLocaleString("en")}
                      </TableCell>
                      {canShowActions && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              aria-label={`Actions for ${stock.product.name} at ${stock.store.name}`}
                              className="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                            >
                              <Ellipsis aria-hidden="true" className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => deleteConfirmation.requestConfirmation(stock)}
                              >
                                <Trash2 aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
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
            itemCount={inventory.length}
            totalCount={meta?.total ?? null}
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? null}
            isLoading={isLoading}
            itemLabel="inventory records"
            onPageChange={setPage}
          />
        </CardContent>
     
      {user && canCreateInventory && (
        <AddInventoryDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          user={user}
          isSaving={isSaving}
          onSubmit={createStoreStock}
        />
      )}
      {deleteConfirmation.dialog}
    </section>
  );
}

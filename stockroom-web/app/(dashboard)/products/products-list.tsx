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
import { ProductFormDialog } from "@/features/products/components/product-form-dialog";
import { useProductMutations } from "@/features/products/hooks/use-product-mutations";
import { useProducts } from "@/features/products/hooks/use-products";
import type { ProductFormValues } from "@/features/products/schemas/product-mutation.schema";
import type { ProductRecord } from "@/features/products/schemas/products.schema";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

const priceFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function ProductsList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(
    null,
  );
  const { user: currentUser } = useCurrentUser();
  const canCreateProducts = hasPermission(currentUser?.role, {
    module: "PRODUCTS",
    action: "CREATE",
  });
  const canEditProducts = hasPermission(currentUser?.role, {
    module: "PRODUCTS",
    action: "EDIT",
  });
  const canDeleteProducts = hasPermission(currentUser?.role, {
    module: "PRODUCTS",
    action: "DELETE",
  });
  const canShowActions = canEditProducts || canDeleteProducts;
  const {
    products,
    meta,
    page,
    searchInput,
    setSearchInput,
    setPage,
    submitSearch,
    reload,
    isLoading,
    errorMessage,
  } = useProducts();
  const { saveProduct, deleteProduct, isSaving } = useProductMutations(reload);
  const deleteConfirmation = useConfirmDialog<ProductRecord>({
    title: "Delete product?",
    description: (product) => `This will permanently delete ${product.name}.`,
    confirmLabel: "Delete product",
    onConfirm: (product) => deleteProduct(product.id),
  });

  const openCreateForm = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: ProductRecord) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const submitProductForm = (values: ProductFormValues) =>
    saveProduct(selectedProduct?.id ?? null, values);

  return (
    <section className="space-y-5">
      <CardContent>
        {canCreateProducts && (
          <div className="mb-4 flex justify-end">
            <Button type="button" onClick={openCreateForm}>
              <Plus aria-hidden="true" />
              Add product
            </Button>
          </div>
        )}
        <form className="mb-4 flex gap-2" onSubmit={submitSearch}>
          <Input
            aria-label="Search products"
            placeholder="Search by SKU or name"
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
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">SKU</TableHead>
                  <TableHead scope="col">Name</TableHead>
                <TableHead scope="col">Unit</TableHead>
                <TableHead scope="col">Price</TableHead>
                <TableHead scope="col">Created</TableHead>
                {canShowActions && (
                  <TableHead scope="col" className="w-12" />
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={canShowActions ? 6 : 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canShowActions ? 6 : 5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.unit ?? "—"}</TableCell>
                    <TableCell className="tabular-nums">
                      {priceFormatter.format(Number(product.price))}
                    </TableCell>
                    <TableCell>
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                      }).format(new Date(product.createdAt))}
                    </TableCell>
                    {canShowActions && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${product.name}`}
                            className="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                          >
                            <Ellipsis aria-hidden="true" className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            {canEditProducts && (
                              <DropdownMenuItem
                                onClick={() => openEditForm(product)}
                              >
                                <Pencil aria-hidden="true" />
                                Update
                              </DropdownMenuItem>
                            )}
                            {canDeleteProducts && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  deleteConfirmation.requestConfirmation(product)
                                }
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
          itemCount={products.length}
          totalCount={meta?.total ?? null}
          page={meta?.page ?? page}
          totalPages={meta?.totalPages ?? null}
          isLoading={isLoading}
          itemLabel="products"
          onPageChange={setPage}
        />
      </CardContent>

      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        isSaving={isSaving}
        onSubmit={submitProductForm}
      />
      {deleteConfirmation.dialog}
    </section>
  );
}

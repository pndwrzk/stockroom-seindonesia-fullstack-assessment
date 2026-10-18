"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ROLES } from "@/features/auth/constants/roles";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { getStoreStocksService } from "@/features/inventory/services/get-store-stocks.service";
import type { StoreStockRecord } from "@/features/inventory/schemas/store-stocks.schema";
import { getStoreService } from "@/features/stores/services/get-store.service";
import { getStoresService } from "@/features/stores/services/get-stores.service";
import type { StoreRecord } from "@/features/stores/schemas/stores.schema";
import {
  createStockOpnameSchema,
  type CreateStockOpnameValues,
} from "@/features/stock-opname/schemas/stock-opnames.schema";

type AddStockOpnameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  isSaving: boolean;
  onSubmit: (values: CreateStockOpnameValues) => Promise<boolean>;
};

export function AddStockOpnameDialog({
  open,
  onOpenChange,
  user,
  isSaving,
  onSubmit,
}: AddStockOpnameDialogProps) {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [storeStockOptions, setStoreStockOptions] = useState<{
    storeId: string;
    records: StoreStockRecord[];
  } | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [loadingProductsForStoreId, setLoadingProductsForStoreId] = useState<
    string | null
  >(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const isOwner = user.role === ROLES.OWNER;
  const form = useForm<CreateStockOpnameValues>({
    resolver: zodResolver(createStockOpnameSchema),
    defaultValues: {
      storeId: isOwner ? "" : user.storeId ?? "",
      scope: 1,
      productIds: [],
      note: "",
    },
  });
  const { reset } = form;
  const selectedStoreId = useWatch({
    control: form.control,
    name: "storeId",
  });
  const selectedScope = useWatch({ control: form.control, name: "scope" });
  const selectedProductIds = useWatch({
    control: form.control,
    name: "productIds",
  });
  const isLoadingProducts =
    selectedStoreId !== "" &&
    loadingProductsForStoreId === selectedStoreId;
  const storeStocks =
    storeStockOptions?.storeId === selectedStoreId
      ? storeStockOptions.records
      : [];
  const products = Array.from(
    new Map(
      storeStocks.map((stock) => [stock.product.id, stock.product])
    ).values()
  );
  const filteredProducts = products.filter((product) => {
    const search = productSearch.trim().toLocaleLowerCase();
    return (
      !search ||
      product.sku.toLocaleLowerCase().includes(search) ||
      product.name.toLocaleLowerCase().includes(search)
    );
  });
  const storeLabels = new Map(
    stores.map((store) => [store.id, `${store.name} (${store.code})`])
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    let isCurrent = true;
    const loadStores = async () => {
      setIsLoadingStores(true);
      setStoreError(null);
      try {
        const storeOptions = isOwner
          ? (await getStoresService({ page: 1, limit: 100 })).data
          : user.storeId
            ? [await getStoreService(user.storeId)]
            : (() => {
                throw new Error("Your account is not assigned to a store.");
              })();

        if (isCurrent) {
          setStores(storeOptions);
        }
      } catch (error) {
        if (isCurrent) {
          setStoreError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve stores."
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingStores(false);
        }
      }
    };

    void Promise.resolve().then(loadStores);
    return () => {
      isCurrent = false;
    };
  }, [isOwner, open, user.storeId]);

  useEffect(() => {
    if (open) {
      reset({
        storeId: isOwner ? "" : user.storeId ?? "",
        scope: 1,
        productIds: [],
        note: "",
      });
    }
  }, [isOwner, open, reset, user.storeId]);

  useEffect(() => {
    if (!open || !selectedStoreId) {
      return;
    }

    let isCurrent = true;
    void Promise.resolve().then(async () => {
      setLoadingProductsForStoreId(selectedStoreId);
      setProductsError(null);
      try {
        const response = await getStoreStocksService({
          page: 1,
          limit: 100,
          storeId: selectedStoreId,
        });
        if (isCurrent) {
          setStoreStockOptions({
            storeId: selectedStoreId,
            records: response.data,
          });
        }
      } catch (error: unknown) {
        if (isCurrent) {
          setProductsError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve products for this store."
          );
        }
      } finally {
        if (isCurrent) {
          setLoadingProductsForStoreId(null);
        }
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [open, selectedStoreId]);

  const submit = form.handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add stock opname</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={submit}>
          <FormField
            label="Store"
            htmlFor="stock-opname-store"
            error={form.formState.errors.storeId?.message ?? storeError ?? undefined}
          >
            {isOwner ? (
              <Controller
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => {
                      field.onChange(String(value));
                      form.setValue("productIds", [], { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger
                      id="stock-opname-store"
                      aria-required="true"
                      disabled={isLoadingStores || isSaving}
                    >
                      <SelectValue placeholder="Select a store">
                        {(value) =>
                          storeLabels.get(String(value)) ?? "Select a store"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name} ({store.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                id="stock-opname-store"
                value={
                  stores[0]
                    ? `${stores[0].name} (${stores[0].code})`
                    : isLoadingStores
                      ? "Loading store..."
                      : ""
                }
                readOnly
                disabled={isLoadingStores || isSaving}
              />
            )}
          </FormField>

          <FormField
            label="Scope"
            htmlFor="stock-opname-scope"
            error={form.formState.errors.scope?.message}
          >
            <Controller
              control={form.control}
              name="scope"
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => {
                    const scope = value === "0" ? 0 : 1;
                    field.onChange(scope);
                    if (scope === 1) {
                      form.setValue("productIds", [], {
                        shouldValidate: true,
                      });
                    }
                  }}
                >
                  <SelectTrigger
                    id="stock-opname-scope"
                    aria-required="true"
                    disabled={isSaving}
                  >
                    <SelectValue>
                      {(value) => (value === "0" ? "Selected" : "All")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Selected</SelectItem>
                    <SelectItem value="1">All</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          {selectedScope === 0 && (
            <fieldset className="space-y-2">
              <legend className="text-xs/relaxed font-medium">Products</legend>
              {!selectedStoreId ? (
                <p className="text-xs text-muted-foreground">
                  Select a store to load its products.
                </p>
              ) : isLoadingProducts ? (
                <p className="text-xs text-muted-foreground">
                  Loading store products...
                </p>
              ) : productsError ? (
                <p role="alert" className="text-xs text-destructive">
                  {productsError}
                </p>
              ) : products.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No products with stock found for this store.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search
                      aria-hidden="true"
                      className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      aria-label="Search store products"
                      placeholder="Search by SKU or product name"
                      className="h-8 pl-7"
                      value={productSearch}
                      onChange={(event) => setProductSearch(event.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto rounded-xs border">
                    <Table className="min-w-[440px]">
                      <TableHeader className="sticky top-0 z-10 bg-background">
                        <TableRow>
                          <TableHead scope="col" className="w-8" />
                          <TableHead scope="col">SKU</TableHead>
                          <TableHead scope="col">Name</TableHead>
                          <TableHead scope="col">Unit</TableHead>
                          <TableHead scope="col" className="text-right">
                            Stock
                          </TableHead>
                          <TableHead scope="col" className="text-right">
                            Price
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-16 text-center text-xs text-muted-foreground"
                            >
                              No products match your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="w-8">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${product.name}`}
                                  checked={selectedProductIds.includes(
                                    product.id
                                  )}
                                  disabled={isSaving}
                                  className="size-3.5 accent-primary"
                                  onChange={(event) => {
                                    const nextIds = event.target.checked
                                      ? [...selectedProductIds, product.id]
                                      : selectedProductIds.filter(
                                          (productId) =>
                                            productId !== product.id
                                        );
                                    form.setValue("productIds", nextIds, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  }}
                                />
                              </TableCell>
                              <TableCell>{product.sku}</TableCell>
                              <TableCell>{product.name}</TableCell>
                              <TableCell>{product.unit ?? "—"}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {storeStocks
                                  .filter(
                                    (stock) => stock.product.id === product.id
                                  )
                                  .reduce(
                                    (total, stock) => total + stock.quantity,
                                    0
                                  )
                                  .toLocaleString("en")}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatProductPrice(product.price)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {form.formState.errors.productIds?.message && (
                <p role="alert" className="text-xs text-destructive">
                  {form.formState.errors.productIds.message}
                </p>
              )}
            </fieldset>
          )}

          <FormField
            label="Note"
            htmlFor="stock-opname-note"
            error={form.formState.errors.note?.message}
          >
            <Textarea
              id="stock-opname-note"
              rows={3}
              disabled={isSaving}
              {...form.register("note")}
            />
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoadingStores ||
                isLoadingProducts ||
                isSaving ||
                form.formState.isSubmitting ||
                !selectedStoreId ||
                Boolean(storeError) ||
                (selectedScope === 0 && Boolean(productsError))
              }
            >
              {isSaving || form.formState.isSubmitting
                ? "Saving..."
                : "Add stock opname"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatProductPrice(price: string | number | undefined): string {
  if (price === undefined) {
    return "—";
  }

  const numericPrice = Number(price);
  return Number.isFinite(numericPrice)
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(numericPrice)
    : String(price);
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

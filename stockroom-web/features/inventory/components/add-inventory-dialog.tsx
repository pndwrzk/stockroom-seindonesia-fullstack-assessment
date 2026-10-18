"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { ROLES } from "@/features/auth/constants/roles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuthUser } from "@/features/auth/types/auth.types";
import type { CreateStoreStockValues } from "@/features/inventory/schemas/store-stocks.schema";
import { createStoreStockSchema } from "@/features/inventory/schemas/store-stocks.schema";
import { getProductsService } from "@/features/products/services/get-products.service";
import type { ProductRecord } from "@/features/products/schemas/products.schema";
import { getStoreService } from "@/features/stores/services/get-store.service";
import { getStoresService } from "@/features/stores/services/get-stores.service";
import type { StoreRecord } from "@/features/stores/schemas/stores.schema";

type AddInventoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUser;
  isSaving: boolean;
  onSubmit: (values: CreateStoreStockValues) => Promise<boolean>;
};

export function AddInventoryDialog({
  open,
  onOpenChange,
  user,
  isSaving,
  onSubmit,
}: AddInventoryDialogProps) {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const isOwner = user.role === ROLES.OWNER;
  const form = useForm<CreateStoreStockValues>({
    resolver: zodResolver(createStoreStockSchema),
    defaultValues: { storeId: "", productId: "", quantity: 1 },
  });
  const { reset } = form;

  useEffect(() => {
    let isCurrent = true;
    const loadOptions = async () => {
      try {
        const managerStoreId = user.storeId;
        let storeOptionsPromise: Promise<StoreRecord[]>;
        if (isOwner) {
          storeOptionsPromise = getStoresService({ page: 1, limit: 100 }).then(
            (response) => response.data
          );
        } else {
          if (!managerStoreId) {
            throw new Error("Your account is not assigned to a store.");
          }
          storeOptionsPromise = getStoreService(managerStoreId).then((store) => [
            store,
          ]);
        }

        const [productResponse, storeOptions] = await Promise.all([
          getProductsService({ page: 1, limit: 100 }),
          storeOptionsPromise,
        ]);

        if (isCurrent) {
          setProducts(productResponse.data);
          setStores(storeOptions);
          setOptionsError(null);
        }
      } catch (error) {
        if (isCurrent) {
          setOptionsError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve inventory form options."
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();
    return () => {
      isCurrent = false;
    };
  }, [isOwner, user.storeId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      storeId: isOwner ? "" : user.storeId ?? "",
      productId: "",
      quantity: 1,
    });
  }, [isOwner, open, reset, user.storeId]);

  const submit = form.handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      onOpenChange(false);
    }
  });

  const storeLabels = new Map(
    stores.map((store) => [store.id, `${store.name} (${store.code})`])
  );
  const productLabels = new Map(
    products.map((product) => [product.id, `${product.name} (${product.sku})`])
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add inventory</DialogTitle>
        </DialogHeader>

        {optionsError ? (
          <p role="alert" className="border-y border-border py-4 text-sm text-destructive">
            {optionsError}
          </p>
        ) : (
          <form className="space-y-3" onSubmit={submit}>
            <FormField label="Store" htmlFor="inventory-store" error={form.formState.errors.storeId?.message}>
              {isOwner ? (
                <Controller
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <Select
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(String(value))}
                    >
                      <SelectTrigger id="inventory-store" aria-required="true" disabled={isLoadingOptions}>
                        <SelectValue placeholder="Select a store">
                          {(value) => storeLabels.get(String(value)) ?? "Select a store"}
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
                  id="inventory-store"
                  value={stores[0] ? `${stores[0].name} (${stores[0].code})` : "Loading store..."}
                  readOnly
                  disabled={isLoadingOptions}
                />
              )}
            </FormField>

            <FormField label="Product" htmlFor="inventory-product" error={form.formState.errors.productId?.message}>
              <Controller
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(String(value))}
                  >
                    <SelectTrigger id="inventory-product" aria-required="true" disabled={isLoadingOptions}>
                      <SelectValue placeholder="Select a product">
                        {(value) => productLabels.get(String(value)) ?? "Select a product"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Quantity" htmlFor="inventory-quantity" error={form.formState.errors.quantity?.message}>
              <Input
                id="inventory-quantity"
                type="number"
                min="1"
                step="1"
                required
                disabled={isLoadingOptions}
                {...form.register("quantity", { valueAsNumber: true })}
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
                disabled={isLoadingOptions || isSaving || form.formState.isSubmitting}
              >
                {isLoadingOptions ? "Loading..." : isSaving ? "Saving..." : "Add inventory"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
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
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

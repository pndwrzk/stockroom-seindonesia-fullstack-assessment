"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import type { ProductFormValues } from "@/features/products/schemas/product-mutation.schema";
import { productFormSchema } from "@/features/products/schemas/product-mutation.schema";
import type { ProductRecord } from "@/features/products/schemas/products.schema";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductRecord | null;
  isSaving: boolean;
  onSubmit: (values: ProductFormValues) => Promise<boolean>;
};

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  isSaving,
  onSubmit,
}: ProductFormDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { sku: "", name: "", unit: "", price: "" },
  });
  const { reset } = form;

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      sku: product?.sku ?? "",
      name: product?.name ?? "",
      unit: product?.unit ?? "",
      price: product?.price ?? "",
    });
  }, [open, product, reset]);

  const submit = form.handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Update product" : "Add product"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-3" onSubmit={submit}>
          <FormField label="SKU" htmlFor="product-sku" error={form.formState.errors.sku?.message}>
            <Input
              id="product-sku"
              required
              autoComplete="off"
              {...form.register("sku")}
            />
          </FormField>
          <FormField label="Name" htmlFor="product-name" error={form.formState.errors.name?.message}>
            <Input id="product-name" required {...form.register("name")} />
          </FormField>
          <FormField
            label="Unit"
            htmlFor="product-unit"
            error={form.formState.errors.unit?.message}
          >
            <Input
              id="product-unit"
              required
              autoComplete="off"
              {...form.register("unit")}
            />
          </FormField>
          <FormField
            label="Price"
            htmlFor="product-price"
            error={form.formState.errors.price?.message}
          >
            <Input
              id="product-price"
              type="number"
              min="0"
              step="any"
              required
              inputMode="decimal"
              {...form.register("price")}
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
            <Button type="submit" disabled={isSaving || form.formState.isSubmitting}>
              {isSaving ? "Saving..." : product ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
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
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

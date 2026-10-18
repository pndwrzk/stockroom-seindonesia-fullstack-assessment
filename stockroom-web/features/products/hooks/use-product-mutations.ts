"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createProductService } from "@/features/products/services/create-product.service";
import { deleteProductService } from "@/features/products/services/delete-product.service";
import { updateProductService } from "@/features/products/services/update-product.service";
import type { ProductFormValues } from "@/features/products/schemas/product-mutation.schema";

export function useProductMutations(onSuccess: () => void) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const saveProduct = async (
    productId: string | null,
    values: ProductFormValues
  ) => {
    setIsSaving(true);
    try {
      if (productId) {
        await updateProductService(productId, values);
        toast({ title: "Product updated", description: "The product has been updated." });
      } else {
        await createProductService(values);
        toast({ title: "Product created", description: "The product has been created." });
      }
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: productId ? "Unable to update product" : "Unable to create product",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    setDeletingProductId(productId);
    try {
      await deleteProductService(productId);
      toast({ title: "Product deleted", description: "The product has been deleted." });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to delete product",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setDeletingProductId(null);
    }
  };

  return { saveProduct, deleteProduct, isSaving, deletingProductId };
}

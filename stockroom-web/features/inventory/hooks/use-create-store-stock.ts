"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { CreateStoreStockValues } from "@/features/inventory/schemas/store-stocks.schema";
import { createStoreStockService } from "@/features/inventory/services/create-store-stock.service";

export function useCreateStoreStock(onSuccess: () => void) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const createStoreStock = async (values: CreateStoreStockValues) => {
    setIsSaving(true);
    try {
      await createStoreStockService(values);
      toast({
        title: "Inventory added",
        description: "The inventory record has been created.",
      });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to add inventory",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { createStoreStock, isSaving };
}

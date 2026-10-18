"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteStoreStockService } from "@/features/inventory/services/delete-store-stock.service";

export function useDeleteStoreStock(onSuccess: () => void) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteStoreStock = async (storeStockId: string) => {
    setIsDeleting(true);
    try {
      await deleteStoreStockService(storeStockId);
      toast({
        title: "Inventory deleted",
        description: "The inventory record has been deleted.",
      });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to delete inventory",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteStoreStock, isDeleting };
}

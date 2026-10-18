"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteStockOpnameService } from "@/features/stock-opname/services/delete-stock-opname.service";

export function useDeleteStockOpname(onSuccess: () => void) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteStockOpname = async (stockOpnameId: string) => {
    setIsDeleting(true);
    try {
      await deleteStockOpnameService(stockOpnameId);
      toast({
        title: "Stock opname deleted",
        description: "The stock opname session has been deleted.",
      });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to delete stock opname",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteStockOpname, isDeleting };
}

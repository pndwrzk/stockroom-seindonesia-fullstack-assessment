"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { CreateStockOpnameValues } from "@/features/stock-opname/schemas/stock-opnames.schema";
import { createStockOpnameService } from "@/features/stock-opname/services/create-stock-opname.service";

export function useCreateStockOpname(onSuccess: () => void) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const createStockOpname = async (values: CreateStockOpnameValues) => {
    setIsSaving(true);
    try {
      await createStockOpnameService(values);
      toast({
        title: "Stock opname created",
        description: "The stock opname has been initiated.",
      });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to create stock opname",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { createStockOpname, isSaving };
}

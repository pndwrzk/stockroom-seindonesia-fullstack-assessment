"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { SubmitStockOpnameItemsValues } from "@/features/stock-opname/schemas/stock-opnames.schema";
import { submitStockOpnameItemsService } from "@/features/stock-opname/services/submit-stock-opname-items.service";

export function useSubmitStockOpnameItems(
  stockOpnameId: string,
  onSuccess: () => void
) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitItems = async (values: SubmitStockOpnameItemsValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitStockOpnameItemsService(stockOpnameId, values);
      toast({
        title: "Counted quantities submitted",
        description: `${result.submittedCount} submitted, ${result.remainingCount} remaining.`,
      });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: "Unable to submit counted quantities",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitItems, isSubmitting };
}

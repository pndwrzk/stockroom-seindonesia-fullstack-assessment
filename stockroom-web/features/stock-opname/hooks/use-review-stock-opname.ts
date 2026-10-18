"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReviewStockOpnameValues } from "@/features/stock-opname/schemas/stock-opnames.schema";
import {
  reviewStockOpnameService,
  type StockOpnameReviewAction,
} from "@/features/stock-opname/services/review-stock-opname.service";

export function useReviewStockOpname(
  stockOpnameId: string,
  onSuccess: () => void
) {
  const { toast } = useToast();
  const [isReviewing, setIsReviewing] = useState(false);

  const reviewStockOpname = async (
    action: StockOpnameReviewAction,
    values: ReviewStockOpnameValues
  ) => {
    setIsReviewing(true);
    try {
      await reviewStockOpnameService(stockOpnameId, action, values);
      toast({
        title: action === "approve" ? "Stock opname approved" : "Stock opname rejected",
        description:
          action === "approve"
            ? "The stock opname has been approved."
            : "The stock opname has been rejected.",
      });
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title:
          action === "approve"
            ? "Unable to approve stock opname"
            : "Unable to reject stock opname",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsReviewing(false);
    }
  };

  return { reviewStockOpname, isReviewing };
}

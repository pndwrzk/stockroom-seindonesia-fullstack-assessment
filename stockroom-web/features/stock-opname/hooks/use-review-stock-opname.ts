"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { ReviewStockOpnameValues } from "@/features/stock-opname/schemas/stock-opnames.schema";
import {
  reviewStockOpnameService,
  type StockOpnameReviewAction,
} from "@/features/stock-opname/services/review-stock-opname.service";

const successMessages: Record<
  StockOpnameReviewAction,
  { title: string; description: string }
> = {
  approve: {
    title: "Stock opname approved",
    description: "The stock opname has been approved.",
  },
  reject: {
    title: "Stock opname rejected",
    description: "The stock opname has been rejected and closed.",
  },
  "request-revision": {
    title: "Revision requested",
    description: "The stock opname has been returned to staff for recounting.",
  },
};

const errorTitles: Record<StockOpnameReviewAction, string> = {
  approve: "Unable to approve stock opname",
  reject: "Unable to reject stock opname",
  "request-revision": "Unable to request revision",
};

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
      toast(successMessages[action]);
      onSuccess();
      return true;
    } catch (error) {
      toast({
        title: errorTitles[action],
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

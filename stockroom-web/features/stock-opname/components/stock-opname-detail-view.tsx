"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission } from "@/features/auth/constants/permissions";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import { useStockOpnameDetail } from "@/features/stock-opname/hooks/use-stock-opname-detail";
import { useSubmitStockOpnameItems } from "@/features/stock-opname/hooks/use-submit-stock-opname-items";
import { StockOpnameBulkUploadDialog } from "./stock-opname-bulk-upload-dialog";
import { StockOpnameHistoryCard } from "./stock-opname-history-card";
import { StockOpnameItemsCard } from "./stock-opname-items-card";
import { StockOpnameSummaryCard } from "./stock-opname-detail.utils";
import { StockOpnameReviewControls } from "./stock-opname-review-controls";

export function StockOpnameDetailView({
  stockOpnameId,
}: {
  stockOpnameId: string;
}) {
  const {
    detail,
    detailError,
    isLoadingDetail,
    items,
    itemsMeta,
    itemsError,
    isLoadingItems,
    page,
    setPage,
    reload,
  } = useStockOpnameDetail(stockOpnameId);
  const { user } = useCurrentUser();
  const { submitItems, isSubmitting } = useSubmitStockOpnameItems(
    stockOpnameId,
    reload
  );
  const [countedQtyDrafts, setCountedQtyDrafts] = useState<
    Record<string, string>
  >({});
  const [countValidationError, setCountValidationError] = useState<
    string | null
  >(null);
  const [countNote, setCountNote] = useState("");
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);

  const canCountItems =
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "COUNT",
    }) &&
    (detail?.status === stockOpnameStatus.INITIATED ||
      detail?.status === stockOpnameStatus.IN_PROGRESS ||
      detail?.status === stockOpnameStatus.NEEDS_REVISION);

  const getSubmittedCounts = () => {
    const submittedCounts = new Map<string, number>();

    for (const [productId, value] of Object.entries(countedQtyDrafts)) {
      if (!value.trim()) {
        continue;
      }

      const countedQty = Number(value);
      if (!Number.isInteger(countedQty) || countedQty < 0) {
        setCountValidationError("Enter a whole number zero or greater.");
        return null;
      }
      submittedCounts.set(productId, countedQty);
    }

    for (const item of items) {
      if (
        countedQtyDrafts[item.productId] === undefined &&
        item.countedQty !== null
      ) {
        submittedCounts.set(item.productId, item.countedQty);
      }
    }

    if (submittedCounts.size === 0) {
      setCountValidationError(
        "Enter a counted quantity for at least one product."
      );
      return null;
    }

    setCountValidationError(null);
    return Array.from(submittedCounts, ([productId, countedQty]) => ({
      productId,
      countedQty,
    }));
  };

  const openSubmitDialog = () => {
    if (getSubmittedCounts()) {
      setIsSubmitDialogOpen(true);
    }
  };

  const submitCountedItems = async () => {
    const submittedCounts = getSubmittedCounts();
    if (!submittedCounts) {
      return;
    }

    const succeeded = await submitItems({
      items: submittedCounts,
      ...(countNote.trim() ? { note: countNote.trim() } : {}),
    });
    if (succeeded) {
      setIsSubmitDialogOpen(false);
      setCountNote("");
    }
  };

  const applyBulkUpload = (drafts: Record<string, string>) => {
    setCountedQtyDrafts((current) => ({ ...current, ...drafts }));
    setCountValidationError(null);
  };

  return (
    <section className="space-y-4">
      <Link
        href="/stock-opname"
        className="inline-flex h-9 items-center gap-2 rounded-xs border border-border px-3 text-xs font-medium hover:bg-muted"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back
      </Link>

      {detailError ? (
        <div
          role="alert"
          className="border-y border-border py-8 text-center text-sm text-destructive"
        >
          {detailError}
        </div>
      ) : isLoadingDetail || !detail ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading stock opname details...
          </CardContent>
        </Card>
      ) : (
        <>
          <StockOpnameSummaryCard detail={detail} />
          <StockOpnameItemsCard
            detail={detail}
            items={items}
            itemsMeta={itemsMeta}
            itemsError={itemsError}
            isLoadingItems={isLoadingItems}
            page={page}
            setPage={setPage}
            canCountItems={canCountItems}
            countedQtyDrafts={countedQtyDrafts}
            setCountedQtyDrafts={setCountedQtyDrafts}
            countValidationError={countValidationError}
            setCountValidationError={setCountValidationError}
            isSubmitting={isSubmitting}
            onBulkUpload={() => setIsBulkUploadDialogOpen(true)}
            onSubmit={openSubmitDialog}
          />
          <StockOpnameHistoryCard histories={detail.histories} />
          <StockOpnameReviewControls
            detail={detail}
            stockOpnameId={stockOpnameId}
            onSuccess={reload}
          />
        </>
      )}

      <StockOpnameBulkUploadDialog
        stockOpnameId={stockOpnameId}
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
        onUpload={applyBulkUpload}
      />

      <Dialog
        open={isSubmitDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setIsSubmitDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {detail?.status === stockOpnameStatus.NEEDS_REVISION
                ? "Resubmit stock opname?"
                : "Submit stock opname?"}
            </DialogTitle>
            <DialogDescription>
              Add an optional note about the counted quantities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="stock-opname-count-note">Note</Label>
            <Textarea
              id="stock-opname-count-note"
              value={countNote}
              onChange={(event) => setCountNote(event.target.value)}
              disabled={isSubmitting}
              placeholder="Enter a note (optional)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void submitCountedItems()}
            >
              {isSubmitting
                ? "Submitting..."
                : detail?.status === stockOpnameStatus.NEEDS_REVISION
                  ? "Resubmit"
                  : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

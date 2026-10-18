"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { useReviewStockOpname } from "@/features/stock-opname/hooks/use-review-stock-opname";
import type { StockOpnameDetail } from "@/features/stock-opname/schemas/stock-opnames.schema";
import type { StockOpnameReviewAction } from "@/features/stock-opname/services/review-stock-opname.service";

export function StockOpnameReviewControls({
  detail,
  stockOpnameId,
  onSuccess,
}: {
  detail: StockOpnameDetail;
  stockOpnameId: string;
  onSuccess: () => void;
}) {
  const { user } = useCurrentUser();
  const { reviewStockOpname, isReviewing } = useReviewStockOpname(
    stockOpnameId,
    onSuccess
  );
  const [reviewAction, setReviewAction] =
    useState<StockOpnameReviewAction | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const canReview =
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "APPROVE",
    }) &&
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "REJECT",
    }) &&
    detail.status === stockOpnameStatus.SUBMITTED;
  const canRequestRevision =
    canReview &&
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "REQUEST_REVISION",
    });
  const isReviewNoteRequired =
    reviewAction === "reject" || reviewAction === "request-revision";

  const submitReview = async () => {
    if (!reviewAction || (isReviewNoteRequired && !reviewNote.trim())) {
      return;
    }

    const succeeded = await reviewStockOpname(reviewAction, {
      ...(reviewNote.trim() ? { note: reviewNote.trim() } : {}),
    });
    if (succeeded) {
      setReviewAction(null);
      setReviewNote("");
    }
  };

  if (!canReview) {
    return null;
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={isReviewing}
          onClick={() => setReviewAction("reject")}
        >
          Reject
        </Button>
        {canRequestRevision && (
          <Button
            type="button"
            variant="outline"
            disabled={isReviewing}
            onClick={() => setReviewAction("request-revision")}
          >
            Request revision
          </Button>
        )}
        <Button
          type="button"
          disabled={isReviewing}
          onClick={() => setReviewAction("approve")}
        >
          Approve
        </Button>
      </div>

      <Dialog
        open={reviewAction !== null}
        onOpenChange={(open) => {
          if (!open && !isReviewing) {
            setReviewAction(null);
            setReviewNote("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve"
                ? "Approve stock opname?"
                : reviewAction === "request-revision"
                  ? "Request revision?"
                  : "Reject stock opname?"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "Add an optional note for this decision."
                : reviewAction === "request-revision"
                  ? "Staff can recount and submit again. Explain what needs to be fixed."
                  : "Rejecting closes this stock opname permanently and staff cannot resubmit it. Explain the reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="stock-opname-review-note">Note</Label>
            <Textarea
              id="stock-opname-review-note"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              disabled={isReviewing}
              placeholder={
                isReviewNoteRequired
                  ? "Enter a note (required)"
                  : "Enter a note (optional)"
              }
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isReviewing}
              onClick={() => {
                setReviewAction(null);
                setReviewNote("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={reviewAction === "reject" ? "destructive" : "default"}
              disabled={
                isReviewing ||
                reviewAction === null ||
                (isReviewNoteRequired && !reviewNote.trim())
              }
              onClick={() => void submitReview()}
            >
              {isReviewing
                ? "Submitting..."
                : reviewAction === "approve"
                  ? "Approve"
                  : reviewAction === "request-revision"
                    ? "Request revision"
                    : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

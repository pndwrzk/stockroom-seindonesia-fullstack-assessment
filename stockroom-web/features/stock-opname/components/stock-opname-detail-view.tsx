"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission } from "@/features/auth/constants/permissions";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import { useReviewStockOpname } from "@/features/stock-opname/hooks/use-review-stock-opname";
import { useStockOpnameDetail } from "@/features/stock-opname/hooks/use-stock-opname-detail";
import { useSubmitStockOpnameItems } from "@/features/stock-opname/hooks/use-submit-stock-opname-items";
import type { StockOpnameReviewAction } from "@/features/stock-opname/services/review-stock-opname.service";
import type { StockOpnameDetail, StockOpnameItem } from "@/features/stock-opname/schemas/stock-opnames.schema";

const statusLabels: Record<StockOpnameDetail["status"], string> = {
  [stockOpnameStatus.INITIATED]: "Initiated",
  [stockOpnameStatus.IN_PROGRESS]: "In progress",
  [stockOpnameStatus.SUBMITTED]: "Submitted",
  [stockOpnameStatus.APPROVED]: "Approved",
  [stockOpnameStatus.REJECTED]: "Rejected",
  [stockOpnameStatus.NEEDS_REVISION]: "Needs revision",
};

const statusStyles: Record<StockOpnameDetail["status"], string> = {
  [stockOpnameStatus.INITIATED]: "bg-muted text-muted-foreground",
  [stockOpnameStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [stockOpnameStatus.SUBMITTED]: "bg-amber-100 text-amber-800",
  [stockOpnameStatus.APPROVED]: "bg-green-100 text-green-800",
  [stockOpnameStatus.REJECTED]: "bg-red-100 text-red-800",
  [stockOpnameStatus.NEEDS_REVISION]: "bg-orange-100 text-orange-800",
};

const scopeLabels: Record<StockOpnameDetail["scope"], string> = {
  0: "Selected",
  1: "All",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

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
  const [reviewAction, setReviewAction] =
    useState<StockOpnameReviewAction | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { reviewStockOpname, isReviewing } = useReviewStockOpname(
    stockOpnameId,
    reload
  );
  const canCountItems =
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "COUNT",
    }) &&
    (detail?.status === stockOpnameStatus.INITIATED ||
      detail?.status === stockOpnameStatus.IN_PROGRESS ||
      detail?.status === stockOpnameStatus.NEEDS_REVISION);
  const canReview =
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "APPROVE",
    }) &&
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "REJECT",
    }) &&
    detail?.status === stockOpnameStatus.SUBMITTED;
  const canRequestRevision =
    canReview &&
    hasPermission(user?.role, {
      module: "STOCK_OPNAME",
      action: "REQUEST_REVISION",
    });

  const isReviewNoteRequired =
    reviewAction === "reject" || reviewAction === "request-revision";

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
      setCountValidationError("Enter a counted quantity for at least one product.");
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

  const submitReview = async () => {
    if (!reviewAction) {
      return;
    }
    if (isReviewNoteRequired && !reviewNote.trim()) {
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
          <Card>
            <CardHeader>
              <CardTitle>Stock opname details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField
                  label="Session number"
                  value={detail.sessionNumber ?? "—"}
                />
                <DetailField label="Store code" value={detail.store.code} />
                <DetailField label="Store" value={detail.store.name} />
                <DetailField
                  label="Scope"
                  value={scopeLabels[detail.scope]}
                />
                <div className="space-y-1">
                  <dt className="text-xs text-muted-foreground">Status</dt>
                  <dd>
                    <span
                      className={`inline-flex items-center rounded-xs px-2 py-1 text-xs font-medium ${statusStyles[detail.status]}`}
                    >
                      {statusLabels[detail.status]}
                    </span>
                  </dd>
                </div>
                <DetailField label="Initiator" value={detail.initiator.name} />
                <DetailField
                  label="Initiated"
                  value={dateFormatter.format(new Date(detail.initiatedAt))}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products List</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsError ? (
                <div
                  role="alert"
                  className="border-y border-border py-8 text-center text-sm text-destructive"
                >
                  {itemsError}
                </div>
              ) : (
                <Table className="min-w-[780px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">SKU</TableHead>
                      <TableHead scope="col">Product</TableHead>
                      <TableHead scope="col">Unit</TableHead>
                      <TableHead scope="col" className="text-right">
                        System quantity
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Counted quantity
                      </TableHead>
                      <TableHead scope="col" className="text-right">
                        Difference
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingItems ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Loading products...
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.product.sku}
                          </TableCell>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.product.unit ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {item.systemQty.toLocaleString("en")}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {canCountItems ? (
                              <Input
                                aria-label={`Counted quantity for ${item.product.name}`}
                                type="number"
                                min="0"
                                step="1"
                                inputMode="numeric"
                                className="ml-auto h-8 w-28 text-right tabular-nums"
                                value={
                                  countedQtyDrafts[item.productId] ??
                                  item.countedQty?.toString() ??
                                  ""
                                }
                                disabled={isSubmitting}
                                onChange={(event) => {
                                  setCountedQtyDrafts((current) => ({
                                    ...current,
                                    [item.productId]: event.target.value,
                                  }));
                                  setCountValidationError(null);
                                }}
                              />
                            ) : (
                              formatCountedQuantity(item)
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatStockDifference(
                              canCountItems
                                ? countedQtyDrafts[item.productId] ??
                                    item.countedQty?.toString() ??
                                    ""
                                : item.countedQty?.toString() ?? "",
                              item.systemQty
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
              <DataPagination
                itemCount={items.length}
                totalCount={itemsMeta?.total ?? null}
                page={itemsMeta?.page ?? page}
                totalPages={itemsMeta?.totalPages ?? null}
                isLoading={isLoadingItems}
                itemLabel="products"
                onPageChange={setPage}
              />
              {canCountItems && (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col items-end gap-2">
                    {countValidationError && (
                      <p role="alert" className="text-xs text-destructive">
                        {countValidationError}
                      </p>
                    )}
                    <Button
                      type="button"
                      disabled={isSubmitting || isLoadingItems || items.length === 0}
                      onClick={openSubmitDialog}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : detail.status === stockOpnameStatus.NEEDS_REVISION
                          ? "Resubmit"
                          : "Submit"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              {detail.histories.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  No status history.
                </p>
              ) : (
                <Table className="min-w-[580px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">Date</TableHead>
                      <TableHead scope="col">User</TableHead>
                      <TableHead scope="col">Status</TableHead>
                      <TableHead scope="col">Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.histories.map((history) => (
                      <TableRow key={history.id}>
                        <TableCell>
                          {dateFormatter.format(new Date(history.createdAt))}
                        </TableCell>
                        <TableCell>{history.user.name}</TableCell>
                        <TableCell>
                          {formatStatusTransition(
                            history.fromStatus,
                            history.toStatus
                          )}
                        </TableCell>
                        <TableCell>{history.note || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {canReview && (
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
          )}
        </>
      )}

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
                isReviewNoteRequired ? "Enter a note (required)" : "Enter a note (optional)"
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
    </section>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function formatCountedQuantity(item: StockOpnameItem): string {
  return item.countedQty === null
    ? "Not counted"
    : item.countedQty.toLocaleString("en");
}

function formatStockDifference(
  countedQuantity: string,
  systemQuantity: number
): React.ReactNode {
  if (!countedQuantity.trim()) {
    return "—";
  }

  const counted = Number(countedQuantity);
  if (!Number.isInteger(counted) || counted < 0) {
    return "—";
  }

  const difference = counted - systemQuantity;
  const label =
    difference > 0
      ? `+${difference.toLocaleString("en")}`
      : difference.toLocaleString("en");
  const colorClass =
    difference > 0
      ? "text-green-700"
      : difference < 0
        ? "text-destructive"
        : "text-muted-foreground";

  return <span className={colorClass}>{label}</span>;
}

function formatStatusTransition(
  fromStatus: StockOpnameDetail["status"] | null,
  toStatus: StockOpnameDetail["status"]
): string {
  return fromStatus === null
    ? statusLabels[toStatus]
    : `${statusLabels[fromStatus]} → ${statusLabels[toStatus]}`;
}

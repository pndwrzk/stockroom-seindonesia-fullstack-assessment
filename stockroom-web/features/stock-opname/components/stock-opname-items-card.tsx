"use client";

import type { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import type {
  StockOpnameDetail,
  StockOpnameItem,
  StockOpnameItemsResponse,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import {
  formatCountedQuantity,
  formatStockDifference,
} from "./stock-opname-detail.utils";

type StockOpnameItemsCardProps = {
  detail: StockOpnameDetail;
  items: StockOpnameItem[];
  itemsMeta: StockOpnameItemsResponse["meta"] | null;
  itemsError: string | null;
  isLoadingItems: boolean;
  page: number;
  setPage: (page: number) => void;
  canCountItems: boolean;
  countedQtyDrafts: Record<string, string>;
  setCountedQtyDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  countValidationError: string | null;
  setCountValidationError: (error: string | null) => void;
  isSubmitting: boolean;
  onBulkUpload: () => void;
  onSubmit: () => void;
};

export function StockOpnameItemsCard({
  detail,
  items,
  itemsMeta,
  itemsError,
  isLoadingItems,
  page,
  setPage,
  canCountItems,
  countedQtyDrafts,
  setCountedQtyDrafts,
  countValidationError,
  setCountValidationError,
  isSubmitting,
  onBulkUpload,
  onSubmit,
}: StockOpnameItemsCardProps) {
  return (
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
          <div className="mt-4 flex flex-col items-end gap-2">
            {countValidationError && (
              <p role="alert" className="text-xs text-destructive">
                {countValidationError}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={
                  isSubmitting || isLoadingItems || itemsMeta?.total === 0
                }
                onClick={onBulkUpload}
              >
                Bulk upload
              </Button>
              <Button
                type="button"
                disabled={
                  isSubmitting || isLoadingItems || itemsMeta?.total === 0
                }
                onClick={onSubmit}
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
  );
}

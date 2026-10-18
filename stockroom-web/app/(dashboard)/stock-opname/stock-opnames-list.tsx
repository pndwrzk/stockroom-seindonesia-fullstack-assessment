"use client";

import { useState } from "react";
import Link from "next/link";
import { Ellipsis, Eye, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataPagination } from "@/components/ui/data-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { hasPermission } from "@/features/auth/constants/permissions";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import { AddStockOpnameDialog } from "@/features/stock-opname/components/add-stock-opname-dialog";
import { useCreateStockOpname } from "@/features/stock-opname/hooks/use-create-stock-opname";
import { useDeleteStockOpname } from "@/features/stock-opname/hooks/use-delete-stock-opname";
import { useStockOpnames } from "@/features/stock-opname/hooks/use-stock-opnames";
import type { StockOpnameRecord } from "@/features/stock-opname/schemas/stock-opnames.schema";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

const statusLabels: Record<StockOpnameRecord["status"], string> = {
  [stockOpnameStatus.INITIATED]: "Initiated",
  [stockOpnameStatus.IN_PROGRESS]: "In progress",
  [stockOpnameStatus.SUBMITTED]: "Submitted",
  [stockOpnameStatus.APPROVED]: "Approved",
  [stockOpnameStatus.REJECTED]: "Rejected",
};

const statusStyles: Record<StockOpnameRecord["status"], string> = {
  [stockOpnameStatus.INITIATED]: "bg-muted text-muted-foreground",
  [stockOpnameStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [stockOpnameStatus.SUBMITTED]: "bg-amber-100 text-amber-800",
  [stockOpnameStatus.APPROVED]: "bg-green-100 text-green-800",
  [stockOpnameStatus.REJECTED]: "bg-red-100 text-red-800",
};

const scopeLabels: Record<StockOpnameRecord["scope"], string> = {
  0: "Selected",
  1: "All",
};

const initiatedAtFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function StockOpnamesList() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { user } = useCurrentUser();
  const canCreateStockOpname = hasPermission(user?.role, {
    module: "STOCK_OPNAME",
    action: "CREATE",
  });
  const canDeleteStockOpname = hasPermission(user?.role, {
    module: "STOCK_OPNAME",
    action: "DELETE",
  });
  const {
    stockOpnames,
    meta,
    page,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter,
    setPage,
    submitSearch,
    reload,
    isLoading,
    errorMessage,
  } = useStockOpnames();
  const { createStockOpname, isSaving } = useCreateStockOpname(reload);
  const { deleteStockOpname } = useDeleteStockOpname(reload);
  const deleteConfirmation = useConfirmDialog<StockOpnameRecord>({
    title: "Delete stock opname?",
    description: (stockOpname) =>
      `This will permanently delete session ${stockOpname.sessionNumber}.`,
    confirmLabel: "Delete stock opname",
    onConfirm: (stockOpname) => deleteStockOpname(stockOpname.id),
  });

  return (
    <section>
      
        <CardContent>
          {canCreateStockOpname && (
            <div className="mb-4 flex justify-end">
              <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
                <Plus aria-hidden="true" />
                Add stock opname
              </Button>
            </div>
          )}
          <form
            className="mb-4 flex flex-wrap gap-2"
            onSubmit={submitSearch}
          >
            <Input
              aria-label="Search by session number"
              placeholder="Search by session number"
              className="h-9 max-w-sm"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Select
              value={statusFilter === null ? "all" : String(statusFilter)}
              onValueChange={(value) => {
                if (value === "all") {
                  setStatusFilter(null);
                } else {
                  const status = Object.values(stockOpnameStatus).find(
                    (candidate) => String(candidate) === value
                  );
                  if (status !== undefined) {
                    setStatusFilter(status);
                  }
                }
              }}
            >
              <SelectTrigger
                aria-label="Filter by status"
                className="h-9 w-full sm:w-44"
              >
                <SelectValue placeholder="All statuses">
                  {(value) =>
                    value === "all"
                      ? "All statuses"
                      : Object.entries(statusLabels).find(
                            ([status]) => status === value
                          )?.[1] ?? "All statuses"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-9"
              aria-label="Search"
            >
              <Search aria-hidden="true" />
              Search
            </Button>
          </form>
          {errorMessage ? (
            <div
              role="alert"
              className="border-y border-border py-8 text-center text-sm text-destructive"
            >
              {errorMessage}
            </div>
          ) : (
            <Card className="py-0">
              <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Session number</TableHead>
                  <TableHead scope="col">Store</TableHead>
                  <TableHead scope="col">Scope</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Initiator</TableHead>
                  <TableHead scope="col">Initiated</TableHead>
                  <TableHead scope="col" className="text-right">Total Products</TableHead>
                  <TableHead scope="col" className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Loading stock opnames...
                    </TableCell>
                  </TableRow>
                ) : stockOpnames.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No stock opnames found.
                    </TableCell>
                  </TableRow>
                ) : (
                  stockOpnames.map((stockOpname) => (
                    <TableRow key={stockOpname.id}>
                      <TableCell className="font-mono text-xs">
                        {stockOpname.sessionNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link
                            href={`/stock-opname/${encodeURIComponent(stockOpname.id)}`}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                            aria-label={`View stock opname for ${stockOpname.store.name}`}
                          >
                            {stockOpname.store.code}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {stockOpname.store.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{scopeLabels[stockOpname.scope]}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-xs px-2 py-1 text-xs font-medium ${statusStyles[stockOpname.status]}`}
                        >
                          {statusLabels[stockOpname.status]}
                        </span>
                      </TableCell>
                      <TableCell>{stockOpname.initiator.name}</TableCell>
                      <TableCell>
                        {initiatedAtFormatter.format(
                          new Date(stockOpname.initiatedAt)
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {stockOpname.total.toLocaleString("en")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for stock opname session ${stockOpname.sessionNumber}`}
                            className="inline-flex size-7 items-center justify-center rounded-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                          >
                            <Ellipsis aria-hidden="true" className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              render={
                                <Link
                                  href={`/stock-opname/${encodeURIComponent(stockOpname.id)}`}
                                  aria-label={`View details for stock opname session ${stockOpname.sessionNumber}`}
                                />
                              }
                            >
                              <Eye aria-hidden="true" />
                              Detail
                            </DropdownMenuItem>
                            {canDeleteStockOpname && (
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  deleteConfirmation.requestConfirmation(
                                    stockOpname
                                  )
                                }
                              >
                                <Trash2 aria-hidden="true" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
          )}
            

          <DataPagination
            itemCount={stockOpnames.length}
            totalCount={meta?.total ?? null}
            page={meta?.page ?? page}
            totalPages={meta?.totalPages ?? null}
            isLoading={isLoading}
            itemLabel="stock opnames"
            onPageChange={setPage}
          />
        </CardContent>
     
      {user && canCreateStockOpname && (
        <AddStockOpnameDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          user={user}
          isSaving={isSaving}
          onSubmit={createStockOpname}
        />
      )}
      {deleteConfirmation.dialog}
    </section>
  );
}

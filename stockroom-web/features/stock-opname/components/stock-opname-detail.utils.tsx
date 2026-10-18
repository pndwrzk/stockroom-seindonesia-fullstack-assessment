import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import type {
  StockOpnameDetail,
  StockOpnameItem,
} from "@/features/stock-opname/schemas/stock-opnames.schema";

export const statusLabels: Record<StockOpnameDetail["status"], string> = {
  [stockOpnameStatus.INITIATED]: "Initiated",
  [stockOpnameStatus.IN_PROGRESS]: "In progress",
  [stockOpnameStatus.SUBMITTED]: "Submitted",
  [stockOpnameStatus.APPROVED]: "Approved",
  [stockOpnameStatus.REJECTED]: "Rejected",
  [stockOpnameStatus.NEEDS_REVISION]: "Needs revision",
};

export const statusStyles: Record<StockOpnameDetail["status"], string> = {
  [stockOpnameStatus.INITIATED]: "bg-muted text-muted-foreground",
  [stockOpnameStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [stockOpnameStatus.SUBMITTED]: "bg-amber-100 text-amber-800",
  [stockOpnameStatus.APPROVED]: "bg-green-100 text-green-800",
  [stockOpnameStatus.REJECTED]: "bg-red-100 text-red-800",
  [stockOpnameStatus.NEEDS_REVISION]: "bg-orange-100 text-orange-800",
};

export const scopeLabels: Record<StockOpnameDetail["scope"], string> = {
  0: "Selected",
  1: "All",
};

export const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export function StockOpnameSummaryCard({
  detail,
}: {
  detail: StockOpnameDetail;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock opname details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Session number" value={detail.sessionNumber ?? "—"} />
          <DetailField label="Store code" value={detail.store.code} />
          <DetailField label="Store" value={detail.store.name} />
          <DetailField label="Scope" value={scopeLabels[detail.scope]} />
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
  );
}

export function formatCountedQuantity(item: StockOpnameItem): string {
  return item.countedQty === null
    ? "Not counted"
    : item.countedQty.toLocaleString("en");
}

export function formatStockDifference(
  countedQuantity: string,
  systemQuantity: number
): ReactNode {
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

export function formatStatusTransition(
  fromStatus: StockOpnameDetail["status"] | null,
  toStatus: StockOpnameDetail["status"]
): string {
  return fromStatus === null
    ? statusLabels[toStatus]
    : `${statusLabels[fromStatus]} → ${statusLabels[toStatus]}`;
}

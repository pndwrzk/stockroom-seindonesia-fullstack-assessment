"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CircleCheck,
  CircleX,
  Clock3,
  Package,
  RotateCcw,
  Send,
  Store,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { hasPermission } from "@/features/auth/constants/permissions";
import type { Role } from "@/features/auth/constants/roles";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { getProductsCountService } from "@/features/products/services/get-products-count.service";
import { getStoresCountService } from "@/features/stores/services/get-stores-count.service";
import { getUsersCountService } from "@/features/users/services/get-users-count.service";
import { stockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import { getStockOpnameCountsService } from "@/features/stock-opname/services/get-stock-opname-counts.service";
import type { StockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";

const stockOpnameStatuses = [
  {
    status: stockOpnameStatus.INITIATED,
    label: "Initiated",
    icon: Clock3,
    color: "text-muted-foreground",
    background: "bg-muted",
  },
  {
    status: stockOpnameStatus.IN_PROGRESS,
    label: "In progress",
    icon: Boxes,
    color: "text-blue-700",
    background: "bg-blue-50",
  },
  {
    status: stockOpnameStatus.SUBMITTED,
    label: "Submitted",
    icon: Send,
    color: "text-amber-700",
    background: "bg-amber-50",
  },
  {
    status: stockOpnameStatus.APPROVED,
    label: "Approved",
    icon: CircleCheck,
    color: "text-primary",
    background: "bg-primary/10",
  },
  {
    status: stockOpnameStatus.REJECTED,
    label: "Rejected",
    icon: CircleX,
    color: "text-destructive",
    background: "bg-destructive/10",
  },
  {
    status: stockOpnameStatus.NEEDS_REVISION,
    label: "Needs revision",
    icon: RotateCcw,
    color: "text-orange-700",
    background: "bg-orange-50",
  },
] as const;

const resources = [
  {
    key: "products",
    label: "Products",
    description: "Catalog items",
    url: "/products",
    getCount: getProductsCountService,
    icon: Package,
    iconColor: "text-primary",
    iconBackground: "bg-primary/10",
    permission: { module: "PRODUCTS", action: "VIEW" },
  },
  {
    key: "stores",
    label: "Stores",
    description: "Store locations",
    url: "/stores",
    getCount: getStoresCountService,
    icon: Store,
    iconColor: "text-blue-700",
    iconBackground: "bg-blue-50",
    permission: { module: "STORES", action: "VIEW" },
  },
  {
    key: "users",
    label: "Users",
    description: "Team members",
    url: "/users",
    getCount: getUsersCountService,
    icon: UsersRound,
    iconColor: "text-amber-700",
    iconBackground: "bg-amber-50",
    permission: { module: "USERS", action: "VIEW" },
  },
] as const;

type DashboardResource = (typeof resources)[number]["key"];
type DashboardCounts = Partial<Record<DashboardResource, number>>;
type DashboardErrors = Partial<Record<DashboardResource, string>>;
type StockOpnameCounts = Partial<Record<StockOpnameStatus, number>>;
type DashboardSummaryResult = {
  role: Role;
  counts: DashboardCounts;
  errors: DashboardErrors;
  stockOpnameCounts: StockOpnameCounts;
  stockOpnameError: string | null;
};

export function DashboardSummary() {
  const { user } = useCurrentUser();
  const visibleResources = useMemo(
    () =>
      resources.filter((resource) =>
        hasPermission(user?.role, resource.permission)
      ),
    [user?.role]
  );
  const canViewStockOpname = hasPermission(user?.role, {
    module: "STOCK_OPNAME",
    action: "VIEW",
  });
  const canViewInventory = hasPermission(user?.role, {
    module: "INVENTORY",
    action: "VIEW",
  });
  const [summary, setSummary] = useState<DashboardSummaryResult | null>(null);
  const isLoading = !summary || summary.role !== user?.role;

  useEffect(() => {
    let isCurrent = true;
    const role = user?.role;
    if (!role) {
      return;
    }

    void Promise.all([
      Promise.allSettled(
        visibleResources.map(async (resource) => ({
          key: resource.key,
          count: await resource.getCount(),
        }))
      ),
      canViewStockOpname
        ? getStockOpnameCountsService().then(
            (counts) => ({ counts, error: null }),
            (error: unknown) => ({
              counts: null,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to retrieve stock opname counts.",
            })
          )
        : Promise.resolve({ counts: null, error: null }),
    ]).then(([results, stockOpnameResult]) => {
      if (!isCurrent) {
        return;
      }

      const counts: DashboardCounts = {};
      const errors: DashboardErrors = {};
      const stockOpnameCounts: StockOpnameCounts = {};
      for (const status of stockOpnameStatuses) {
        stockOpnameCounts[status.status] = 0;
      }

      results.forEach((result, index) => {
        const resource = visibleResources[index].key;
        if (result.status === "fulfilled") {
          counts[resource] = result.value.count;
        } else {
          errors[resource] =
            result.reason instanceof Error
              ? result.reason.message
              : `Unable to retrieve ${resource} count.`;
        }
      });

      if (stockOpnameResult.counts) {
        for (const count of stockOpnameResult.counts) {
          stockOpnameCounts[count.status] = count.total;
        }
      }

      setSummary({
        role,
        counts,
        errors,
        stockOpnameCounts,
        stockOpnameError: stockOpnameResult.error,
      });
    });

    return () => {
      isCurrent = false;
    };
  }, [canViewStockOpname, user?.role, visibleResources]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-xs border border-border bg-white px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Stockroom overview
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
             Stock management system for Se’Indonesia technical assessment.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canViewStockOpname && (
              <Link
                href="/stock-opname"
                className="inline-flex h-9 items-center gap-2 rounded-xs bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Boxes aria-hidden="true" className="size-4" />
                Stock Opname
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            )}
            {canViewInventory && (
              <Link
                href="/inventory"
                className="inline-flex h-9 items-center gap-2 rounded-xs border border-border bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
              >
                <Warehouse aria-hidden="true" className="size-4" />
                Inventory
              </Link>
            )}
          </div>
        </div>
      </section>

      {visibleResources.length > 0 && (
      <section
        aria-labelledby="resource-summary-title"
        className="space-y-3"
      >
        <div className="flex items-end justify-between">
          <div>
            <h2 id="resource-summary-title" className="text-sm font-semibold">
              Master data
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              A summary of the resources you can access.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleResources.map(
            ({
              key,
              label,
              description,
              url,
              icon: Icon,
              iconColor,
              iconBackground,
            }) => (
              <Card key={key} className="transition-shadow hover:shadow-sm">
                <CardContent className="flex items-center gap-4">
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xs ${iconBackground}`}
                  >
                    <Icon aria-hidden="true" className={`size-5 ${iconColor}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    {isLoading ? (
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-muted-foreground">
                        —
                      </p>
                    ) : summary?.errors[key] ? (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {summary.errors[key]}
                      </p>
                    ) : (
                      <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {summary?.counts[key]?.toLocaleString("id-ID")}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <Link
                    href={url}
                    aria-label={`Open ${label}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </section>
      )}

      {canViewStockOpname && (
        <section
          aria-labelledby="stock-opname-summary-title"
          className="space-y-3"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                id="stock-opname-summary-title"
                className="text-sm font-semibold"
              >
                Stock Opname
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Progress across all stock opname sessions.
              </p>
            </div>
            <Link
              href="/stock-opname"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          {summary?.stockOpnameError && !isLoading ? (
            <p role="alert" className="text-xs text-destructive">
              {summary.stockOpnameError}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {stockOpnameStatuses.map(
                ({ status, label, icon: Icon, color, background }) => (
                  <Card
                    key={status}
                    className="transition-shadow hover:shadow-sm"
                  >
                    <CardContent className="flex items-center gap-3">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-xs ${background} ${color}`}
                      >
                        <Icon aria-hidden="true" className="size-4" />
                      </span>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-0.5 text-xl font-semibold tabular-nums">
                          {isLoading
                            ? "—"
                            : summary?.stockOpnameCounts[
                                status
                              ]?.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

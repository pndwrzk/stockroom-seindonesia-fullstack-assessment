"use client";

import { useEffect, useState } from "react";
import type {
  StockOpnameDetail,
  StockOpnameItemsResponse,
} from "@/features/stock-opname/schemas/stock-opnames.schema";
import {
  getStockOpnameDetailService,
  getStockOpnameItemsService,
} from "@/features/stock-opname/services/get-stock-opname-detail.service";

const PAGE_SIZE = 10;

export function useStockOpnameDetail(stockOpnameId: string) {
  const [detail, setDetail] = useState<StockOpnameDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [itemsResult, setItemsResult] =
    useState<StockOpnameItemsResponse | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    void getStockOpnameDetailService(stockOpnameId)
      .then((result) => {
        if (isCurrent) {
          setDetail(result);
          setDetailError(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setDetailError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve stock opname details."
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadKey, stockOpnameId]);

  useEffect(() => {
    let isCurrent = true;

    void getStockOpnameItemsService(stockOpnameId, page, PAGE_SIZE)
      .then((result) => {
        if (isCurrent) {
          setItemsResult(result);
          setItemsError(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setItemsError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve stock opname items."
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoadingItems(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [page, reloadKey, stockOpnameId]);

  const changePage = (nextPage: number) => {
    setIsLoadingItems(true);
    setPage(nextPage);
  };

  const reload = () => {
    setIsLoadingDetail(true);
    setIsLoadingItems(true);
    setReloadKey((key) => key + 1);
  };

  return {
    detail,
    detailError,
    isLoadingDetail,
    items: itemsResult?.data ?? [],
    itemsMeta: itemsResult?.meta ?? null,
    itemsError,
    isLoadingItems,
    page,
    setPage: changePage,
    reload,
  };
}

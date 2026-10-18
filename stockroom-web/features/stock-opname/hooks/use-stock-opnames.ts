"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { StockOpnameStatus } from "@/features/stock-opname/constants/stock-opname-status";
import { getStockOpnamesService } from "@/features/stock-opname/services/get-stock-opnames.service";
import type { StockOpnamesResponse } from "@/features/stock-opname/schemas/stock-opnames.schema";

const PAGE_SIZE = 10;

export function useStockOpnames() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockOpnameStatus | null>(
    null
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<StockOpnamesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void getStockOpnamesService({
      page,
      limit: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(statusFilter !== null ? { status: statusFilter } : {}),
    })
      .then((stockOpnames) => {
        if (isCurrent) {
          setResult(stockOpnames);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to retrieve stock opnames."
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [page, reloadKey, search, statusFilter]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setIsLoading(true);
    setPage(1);
    if (page === 1 && search === nextSearch) {
      setReloadKey((key) => key + 1);
    } else {
      setSearch(nextSearch);
    }
  };

  const changePage = (nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  };

  const changeStatusFilter = (status: StockOpnameStatus | null) => {
    if (status === statusFilter) {
      return;
    }
    setIsLoading(true);
    setPage(1);
    setStatusFilter(status);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  return {
    stockOpnames: result?.data ?? [],
    meta: result?.meta ?? null,
    page,
    searchInput,
    setSearchInput,
    statusFilter,
    setStatusFilter: changeStatusFilter,
    setPage: changePage,
    submitSearch,
    reload,
    isLoading,
    errorMessage,
  };
}

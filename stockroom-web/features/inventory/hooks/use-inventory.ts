"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getStoreStocksService } from "@/features/inventory/services/get-store-stocks.service";
import type { StoreStocksResponse } from "@/features/inventory/schemas/store-stocks.schema";

const PAGE_SIZE = 10;

export function useInventory() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<StoreStocksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void getStoreStocksService({
      page,
      limit: PAGE_SIZE,
      ...(search ? { search } : {}),
    })
      .then((inventory) => {
        if (isCurrent) {
          setResult(inventory);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to retrieve inventory."
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
  }, [page, reloadKey, search]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setIsLoading(true);

    if (page === 1 && search === nextSearch) {
      setReloadKey((key) => key + 1);
      return;
    }

    setPage(1);
    setSearch(nextSearch);
  };

  const changePage = (nextPage: number) => {
    setIsLoading(true);
    setPage(nextPage);
  };

  const reload = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  return {
    inventory: result?.data ?? [],
    meta: result?.meta ?? null,
    page,
    searchInput,
    setSearchInput,
    submitSearch,
    setPage: changePage,
    reload,
    isLoading,
    errorMessage,
  };
}

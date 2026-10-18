"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getStoresService } from "@/features/stores/services/get-stores.service";
import type { StoresResponse } from "@/features/stores/schemas/stores.schema";

const PAGE_SIZE = 10;

export function useStores() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<StoresResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void getStoresService({ page, limit: PAGE_SIZE, ...(search ? { search } : {}) })
      .then((stores) => {
        if (isCurrent) {
          setResult(stores);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to retrieve stores."
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
  }, [page, search, reloadKey]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setPage(1);
    setSearch(searchInput.trim());
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
    stores: result?.data ?? [],
    meta: result?.meta ?? null,
    page,
    searchInput,
    setSearchInput,
    setPage: changePage,
    submitSearch,
    reload,
    isLoading,
    errorMessage,
  };
}

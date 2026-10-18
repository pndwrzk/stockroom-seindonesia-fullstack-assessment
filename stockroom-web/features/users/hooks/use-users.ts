"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getUsersService } from "@/features/users/services/get-users.service";
import type { UsersResponse } from "@/features/users/schemas/users.schema";

const PAGE_SIZE = 10;

export function useUsers() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<UsersResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void getUsersService({ page, limit: PAGE_SIZE, ...(search ? { search } : {}) })
      .then((users) => {
        if (isCurrent) {
          setResult(users);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to retrieve users."
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
    users: result?.data ?? [],
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

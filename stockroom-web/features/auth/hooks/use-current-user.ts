"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { getCurrentUserService } from "@/features/auth/services/get-current-user.service";

export function useCurrentUser() {
  const { user, setUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(user?.storeName === undefined);

  useEffect(() => {
    if (user?.storeName !== undefined) {
      return;
    }

    let isMounted = true;

    void Promise.resolve()
      .then(() => {
        let hasAccessToken: boolean;
        try {
          hasAccessToken = Boolean(window.localStorage.getItem("accessToken"));
        } catch {
          throw new Error("Unable to read the saved login token from this browser.");
        }
        return hasAccessToken ? getCurrentUserService() : null;
      })
      .then((currentUser) => {
        if (isMounted && currentUser) {
          setUser(currentUser);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to retrieve user profile."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setUser, user?.id, user?.storeName]);

  return { user, errorMessage, isLoading };
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { loginService } from "@/features/auth/services/login.service";
import type { LoginFormValues } from "@/features/auth/types/auth.types";
import { saveAuthTokens } from "@/lib/axios/auth-token-storage";
import { useToast } from "@/hooks/use-toast";

export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (credentials: LoginFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await loginService(credentials);

      try {
        saveAuthTokens(result.accessToken, result.refreshToken);
      } catch (error) {
        throw error instanceof Error ? error : new Error("Unable to save login tokens.");
      }

      setUser(result.user);
      router.replace("/");
    } catch (error) {
      toast({
        title: "Failed Login",
        description: error instanceof Error ? error.message : "Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, isSubmitting };
}

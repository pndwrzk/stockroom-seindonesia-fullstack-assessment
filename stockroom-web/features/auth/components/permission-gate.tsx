"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import {
  hasPermission,
  type PermissionRequirement,
} from "@/features/auth/constants/permissions";

export function PermissionGate({
  permission,
  children,
}: {
  permission: PermissionRequirement;
  children: ReactNode;
}) {
  const { user, isLoading, errorMessage } = useCurrentUser();

  if (!user && isLoading) {
    return (
      <div
        role="status"
        aria-label="Checking permissions"
        className="flex justify-center py-8"
      >
        <LoaderCircle
          aria-hidden="true"
          className="size-5 animate-spin text-muted-foreground"
        />
      </div>
    );
  }

  if (!user || !hasPermission(user.role, permission)) {
    const hasAccessCheckError = Boolean(errorMessage);

    return (
      <div className="flex min-h-[50vh] items-center justify-center py-10">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center px-6 py-8 text-center sm:px-10">
            <span className="mb-5 flex size-14 items-center justify-center rounded-xs bg-primary/10 text-primary">
              <ShieldAlert aria-hidden="true" className="size-7" />
            </span>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {hasAccessCheckError ? "Access check failed" : "Restricted area"}
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              {hasAccessCheckError ? "Unable to verify access" : "Access denied"}
            </h1>
            <p
              role={hasAccessCheckError ? "alert" : undefined}
              className={`mt-2 max-w-sm text-sm leading-6 ${
                hasAccessCheckError
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {errorMessage ??
                "Your account does not have permission to view this page. Contact your administrator if you think this is a mistake."}
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/" />}
              className="mt-6 py-2"
            >
              <ArrowLeft aria-hidden="true" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}

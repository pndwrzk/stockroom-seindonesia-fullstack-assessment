"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { clearAuthTokens } from "@/lib/axios/auth-token-storage";

export function UserNav() {
  const { user, isLoading } = useCurrentUser();
  const { toast } = useToast();
  const name = user?.name ?? (isLoading ? "Loading..." : "Account");
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "--";

  const confirmLogout = async () => {
    try {
      clearAuthTokens();
      window.location.replace("/login");
      return true;
    } catch (error) {
      toast({
        title: "Unable to log out",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };
  const logoutConfirmation = useConfirmDialog<boolean>({
    title: "Log out?",
    description: "Are you sure you want to log out of your account?",
    confirmLabel: "Log out",
    onConfirm: confirmLogout,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-xs p-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-medium">{name}</span>
          </span>
          <ChevronDown aria-hidden="true" className="hidden size-3.5 text-muted-foreground sm:block" />
          <span className="sr-only">Open user menu</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="space-y-1 px-2 py-2">
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.nik ?? (isLoading ? "Loading..." : "—")}
            </p>
            <p className="truncate text-xs font-medium">{name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {user?.storeName ?? (isLoading ? "Loading..." : "No store")}
            </p>
          </div>
          <div className="my-1 border-t border-border" />
          <DropdownMenuItem onClick={() => logoutConfirmation.requestConfirmation(true)}>
            <LogOut aria-hidden="true" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {logoutConfirmation.dialog}
    </>
  );
}
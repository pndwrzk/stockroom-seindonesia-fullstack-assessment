import type { LucideIcon } from "lucide-react";
import type { PermissionRequirement } from "@/features/auth/constants/permissions";

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  permission: PermissionRequirement;
};

export type NavigationGroup = {
  label: string;
  items: readonly NavigationItem[];
};
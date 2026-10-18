"use client";

import { Suspense, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { applicationIcon, applicationName, navigationGroups } from "@/config/navigation.config";
import { hasPermission } from "@/features/auth/constants/permissions";
import type { Role } from "@/features/auth/constants/roles";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AppSidebar() {
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    getClientSnapshot,
    getServerSnapshot
  );
  const ApplicationIcon = applicationIcon;

  return (
    <Sidebar collapsible="icon" variant="inset" className="bg-white">
      <SidebarHeader className="px-3 py-[6px]">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xs px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-primary text-primary-foreground">
            <ApplicationIcon aria-hidden="true" className="size-4" />
          </span>
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {applicationName}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="pt-2">
        {isMounted ? (
          <Suspense fallback={<NavigationItems pathname={null} role={null} />}>
            <ActiveNavigationItems />
          </Suspense>
        ) : (
          <NavigationItems pathname={null} role={null} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function ActiveNavigationItems() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  return <NavigationItems pathname={pathname} role={user?.role ?? null} />;
}

function NavigationItems({
  pathname,
  role,
}: {
  pathname: string | null;
  role: Role | null;
}) {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(role, item.permission)),
    }))
    .filter((group) => group.items.length > 0)
    .map((group) => (
      <SidebarGroup
        key={group.label || group.items.map((item) => item.url).join("|")}
      >
        {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
        <SidebarMenu>
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive =
              pathname !== null &&
              (pathname === item.url || pathname.startsWith(`${item.url}/`));

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  render={<Link href={item.url} />}
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <ItemIcon aria-hidden="true" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    ));
}
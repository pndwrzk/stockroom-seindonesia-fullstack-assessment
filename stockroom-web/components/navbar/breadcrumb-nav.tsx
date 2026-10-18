"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { applicationName } from "@/config/navigation.config";

const breadcrumbTitles: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  roles: "Roles & Permissions",
  products: "Products",
  categories: "Categories",
  settings: "Settings",
  stores: "Store",
  "stock-opname": "Stock Opname",
  inventory: "Inventory",
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link href="/" />}>{applicationName}</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const title =
            /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(segment)
              ? "Details"
              : breadcrumbTitles[segment] ?? segment.replaceAll("-", " ");
          const isCurrentPage = index === segments.length - 1;

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator className="hidden sm:flex" />
              <BreadcrumbItem>
                {isCurrentPage ? (
                  <BreadcrumbPage className="capitalize">{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />} className="capitalize">
                    {title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
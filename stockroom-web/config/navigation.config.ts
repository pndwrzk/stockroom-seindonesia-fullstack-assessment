import { Boxes, Home, Package, Store, UsersRound, Warehouse } from "lucide-react";
import type { NavigationGroup } from "@/types/navigation.types";

export const navigationGroups: readonly NavigationGroup[] = [
  
  {
    label: "",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Home,
        permission: { module: "DASHBOARD", action: "VIEW" },
      },
    ],
  },
    {
    label: "",
    items: [
      {
        title: "Stock Opname",
        url: "/stock-opname",
        icon: Boxes,
        permission: { module: "STOCK_OPNAME", action: "VIEW" },
      },
    ],
  },
  {
    label: "",
    items: [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Warehouse,
        permission: { module: "INVENTORY", action: "VIEW" },
      },
    ],
  },
 

  {
    label: "Master",
    items: [
      {
        title: "Product",
        url: "/products",
        icon: Package,
        permission: { module: "PRODUCTS", action: "VIEW" },
      },
      {
        title: "Store",
        url: "/stores",
        icon: Store,
        permission: { module: "STORES", action: "VIEW" },
      },
    ],
  },
   {
    label: "Management",
    items: [
      {
        title: "Users",
        url: "/users",
        icon: UsersRound,
        permission: { module: "USERS", action: "VIEW" },
      },
    ],
  },
];

export const applicationName = "Stockroom";
export const applicationIcon = Boxes;
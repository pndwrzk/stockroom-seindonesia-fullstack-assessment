import { Suspense, type ReactNode } from "react";
import { AppFooter } from "@/components/footer/app-footer";
import { AppNavbar } from "@/components/navbar/app-navbar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="bg-white">
      <AppSidebar />
      <SidebarInset className="bg-white">
        <Suspense fallback={<div aria-hidden="true" className="h-14 shrink-0 border-b border-border/70 bg-white" />}>
          <AppNavbar />
        </Suspense>
        <div className="flex-1 bg-white p-4 sm:p-6">{children}</div>
        <Suspense fallback={<div aria-hidden="true" className="min-h-12 border-t border-border/70 bg-white" />}>
          <AppFooter />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
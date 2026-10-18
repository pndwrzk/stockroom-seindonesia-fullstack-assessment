import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BreadcrumbNav } from "@/components/navbar/breadcrumb-nav";
import { UserNav } from "@/components/navbar/user-nav";

export function AppNavbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-white px-4 sm:px-6">
      <SidebarTrigger aria-label="Toggle navigation" />
      <Separator orientation="vertical" className="h-5" />
      <BreadcrumbNav />
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
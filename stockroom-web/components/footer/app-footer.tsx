import { applicationName } from "@/config/navigation.config";

async function getCurrentYear() {
  "use cache";

  return new Date().getFullYear();
}

export async function AppFooter() {
  const currentYear = await getCurrentYear();

  return (
    <footer className="flex min-h-12 items-center border-t border-border/70 bg-white px-4 py-3 text-xs text-muted-foreground sm:px-6">
      © {currentYear} {applicationName}
    </footer>
  );
}
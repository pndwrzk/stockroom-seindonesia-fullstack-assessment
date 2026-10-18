import { Suspense } from "react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh">
      <Suspense fallback={<div aria-hidden="true" className="min-h-svh bg-background" />}>
        {children}
      </Suspense>
    </main>
  );
}

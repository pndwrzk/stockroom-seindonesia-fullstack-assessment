"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useLogin } from "@/features/auth/hooks/use-login";

export default function LoginPage() {
  const { login, isSubmitting } = useLogin();

  return (
    <main className="flex min-h-svh items-center justify-center bg-white px-5 py-8 sm:px-8">
      <div className="w-full max-w-md">
          <LoginForm onSubmit={login} isSubmitting={isSubmitting} />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            © Stockroom
          </p>
      </div>
    </main>
  );
}

"use client";

import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { NewLoginForm } from "@/components/auth/new-login-form";

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <NewLoginForm />
      </Suspense>
    </AuthLayout>
  );
}

import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

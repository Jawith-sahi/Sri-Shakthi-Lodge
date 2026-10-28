"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { env } from "@/config/environment";
import { lodge } from "@/config/lodge";
import { login } from "@/lib/api/auth.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { setAdminHint } from "@/lib/auth/session";
import { loginSchema } from "@/lib/schemas";

function safeNext(value) {
  // Only allow same-site admin paths (prevents open redirects)
  return value && /^\/admin\/(?!login)[\w\-/]*$/.test(value) ? value : "/admin/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { username: "", password: "" } });

  const onSubmit = async (values) => {
    setError("");
    try {
      await login(values);
      setAdminHint();
      router.replace(safeNext(params.get("next")));
    } catch (err) {
      setError(err.code === "unauthorized" || err.code === "validation" ? "Incorrect username or password." : getAdminErrorMessage(err));
    }
  };

  const inputClass =
    "block w-full rounded-lg border bg-white px-3.5 min-h-11 text-base focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-primary-900 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[var(--shadow-pop)] sm:p-8">
        <div className="mb-6 text-center">
          <Image src="/logo-small.png" alt="" width={72} height={72} className="mx-auto rounded-full" priority />
          <h1 className="mt-3 text-xl font-bold text-primary-900">{lodge.name}</h1>
          <p className="text-sm text-muted">Staff sign in</p>
        </div>

        {env.useMock ? (
          <Notice tone="warning" className="mb-4">
            Development mode: any username and password will work. Use a username containing &quot;staff&quot; to try the staff role.
          </Notice>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field name="username" label="Username" required error={errors.username?.message}>
            {(id, describe) => (
              <input
                id={id}
                autoComplete="username"
                autoCapitalize="none"
                aria-describedby={describe}
                aria-invalid={errors.username ? true : undefined}
                className={`${inputClass} ${errors.username ? "border-danger-600" : "border-line"}`}
                {...register("username")}
              />
            )}
          </Field>

          <Field name="password" label="Password" required error={errors.password?.message}>
            {(id, describe) => (
              <div className="relative">
                <input
                  id={id}
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  aria-describedby={describe}
                  aria-invalid={errors.password ? true : undefined}
                  className={`${inputClass} pr-12 ${errors.password ? "border-danger-600" : "border-line"}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface"
                >
                  {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
            )}
          </Field>

          {error ? <Notice tone="error">{error}</Notice> : null}

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

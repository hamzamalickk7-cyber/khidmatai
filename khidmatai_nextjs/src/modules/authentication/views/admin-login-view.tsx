"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { ApplicationLoadingOverlay } from "@/components/feedback/application-loading-overlay";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authenticationClient } from "@/modules/authentication/services/authentication-client";
import {
  adminLoginFormValidationSchema,
  type AdminLoginFormValues,
} from "@/modules/authentication/validations/admin-login-form-validation-schema";

// Only a same-origin relative path is honored, never a full/protocol-relative
// URL — otherwise ?redirect= would be an open-redirect vector.
function resolveSafeRedirectPath(candidatePath: string | null): string | null {
  if (!candidatePath) return null;
  if (!candidatePath.startsWith("/") || candidatePath.startsWith("//")) return null;
  if (["/login", "/register", "/admin/login"].includes(candidatePath.split(/[?#]/, 1)[0])) return null;
  return candidatePath;
}

export function AdminLoginView() {
  const applicationRouter = useRouter();
  const queryClient = useQueryClient();
  const searchParameters = useSearchParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormValidationSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submitAdminLoginForm(values: AdminLoginFormValues) {
    try {
      const loginResult = await authenticationClient.signIn.email({
        email: values.email.trim(),
        password: values.password,
      });
      if (loginResult.error) throw new Error(loginResult.error.message);

      const authenticatedRole = loginResult.data?.user.role;
      if (authenticatedRole !== "admin" && authenticatedRole !== "support") {
        try {
          const signOutResult = await authenticationClient.signOut();
          if (signOutResult.error) throw new Error(signOutResult.error.message);
          queryClient.clear();
        } catch {
          toast.error("Admin access denied, but sign-out failed", { description: "A non-administrator session may still be active. Use the main navigation to sign out before trying another account." });
          return;
        }
        throw new Error("This account does not have admin access.");
      }

      toast.success("Welcome back");
      const explicitRedirectPath = resolveSafeRedirectPath(searchParameters.get("redirect"));
      setIsRedirecting(true);
      applicationRouter.push(explicitRedirectPath ?? "/admin");
      applicationRouter.refresh();
    } catch (loginError) {
      toast.error("Sign in failed", {
        description: loginError instanceof Error ? loginError.message : "Unable to complete the request.",
      });
    }
  }

  return (
    <main className="bg-ink flex min-h-screen flex-1 items-center justify-center px-4 py-10">
      <AnimatePresence>
        {isRedirecting && <ApplicationLoadingOverlay title="Signing you in" description="Just a moment." />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 shadow-[0_40px_100px_-40px_rgba(0,0,0,.6)] sm:p-9"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-ink flex items-center gap-2 text-sm font-semibold tracking-[-0.02em]">
            <span className="from-brand to-brand-deep grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-white">
              Kh
            </span>
            Khidmat<span className="text-brand">AI</span>
          </span>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-ink/10 text-ink/65 hover:border-brand/30 hover:bg-brand-soft/50 hover:text-brand h-9 gap-1.5 rounded-lg px-3.5 font-semibold")}
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>

        <div className="mt-7">
          <span className="bg-ink text-brand grid size-11 place-items-center rounded-xl">
            <ShieldCheck className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl tracking-[-0.03em]">Admin sign in</h1>
          <p className="text-ink/55 mt-2 text-sm">Restricted access for KhidmatAI administrators and support staff.</p>
        </div>

        <form onSubmit={handleSubmit(submitAdminLoginForm)} className="mt-7" noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="admin-email">
                Email address{" "}
                <span className="text-red-600" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Mail className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
              </InputGroup>
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="admin-password">
                Password{" "}
                <span className="text-red-600" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="admin-password"
                  type={isPasswordVisible ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="button"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                    {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-ink hover:bg-ink/85 h-11 w-full rounded-xl text-sm font-semibold"
            >
              {isSubmitting ? <Spinner /> : <ArrowRight className="size-4" />}
              Sign in
            </Button>
          </FieldGroup>
        </form>

        <p className="text-ink/40 mt-7 text-center text-xs">
          Administrator accounts are provisioned directly by KhidmatAI. Public registration is disabled.
        </p>
      </motion.div>
    </main>
  );
}

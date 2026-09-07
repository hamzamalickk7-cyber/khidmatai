"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { ApplicationLoadingOverlay } from "@/components/feedback/application-loading-overlay";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Spinner } from "@/components/ui/spinner";
import { authenticationClient } from "@/modules/authentication/services/authentication-client";
import type { PublicAccountRole } from "@/modules/authentication/types/authentication-role";
import {
  type AuthenticationFormValues,
  validateAuthenticationFormValues,
} from "@/modules/authentication/validations/authentication-form-validation-schema";

type AuthenticationFormMode = "sign-in" | "sign-up";

const authenticationPageCopy = {
  signIn: "Welcome back",
  signUp: "Create your account",
  name: "Full name",
  email: "Email address",
  password: "Password",
  confirm: "Confirm password",
  submitSignIn: "Log in",
  submitSignUp: "Register",
  noAccount: "New to KhidmatAI?",
  hasAccount: "Already registered?",
} as const;

const accountRoleOptionList = [
  {
    value: "customer",
    title: "I need help with something",
    description: "Find and book trusted local professionals, like a plumber or electrician.",
    IconComponent: Search,
  },
  {
    value: "provider",
    title: "I offer a service",
    description: "Get hired for local jobs, like plumbing, electrical work, or cleaning.",
    IconComponent: Wrench,
  },
] as const;

// Only a same-origin relative path is honored, never a full/protocol-relative
// URL — otherwise ?redirect= would be an open-redirect vector (e.g.
// /login?redirect=https://evil.example or //evil.example).
function resolveSafeRedirectPath(candidatePath: string | null): string | null {
  if (!candidatePath) return null;
  if (!candidatePath.startsWith("/") || candidatePath.startsWith("//")) return null;
  if (["/login", "/register", "/admin/login"].includes(candidatePath.split(/[?#]/, 1)[0])) return null;
  return candidatePath;
}

function resolveDefaultDestinationForRole(accountRole: string | null | undefined): string {
  if (accountRole === "provider") return "/dashboard";
  if (accountRole === "admin" || accountRole === "support") return "/admin";
  return "/explore";
}

export function AuthenticationFormView({ mode }: { mode: AuthenticationFormMode }) {
  const applicationRouter = useRouter();
  const searchParameters = useSearchParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isRedirectingAfterAuthentication, setIsRedirectingAfterAuthentication] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthenticationFormValues>({
    resolver: zodResolver(validateAuthenticationFormValues(mode)),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", accountType: "" },
  });

  const authenticationPageTitle = mode === "sign-in" ? authenticationPageCopy.signIn : authenticationPageCopy.signUp;

  async function submitValidatedAuthenticationForm(authenticationFormValues: AuthenticationFormValues) {
    const explicitRedirectPath = resolveSafeRedirectPath(searchParameters.get("redirect"));

    try {
      if (mode === "sign-up") {
        const registrationResult = await authenticationClient.signUp.email({
          name: authenticationFormValues.name.trim(),
          email: authenticationFormValues.email.trim(),
          password: authenticationFormValues.password,
          accountType: authenticationFormValues.accountType as PublicAccountRole,
          callbackURL: `${window.location.origin}/dashboard`,
        });
        if (registrationResult.error) throw new Error(registrationResult.error.message);
        setIsRedirectingAfterAuthentication(true);
        window.location.replace("/dashboard");
        return;
      }

      const loginResult = await authenticationClient.signIn.email({
        email: authenticationFormValues.email.trim(),
        password: authenticationFormValues.password,
      });
      if (loginResult.error) throw new Error(loginResult.error.message);
      toast.success("Welcome back");
      const postAuthenticationDestination =
        explicitRedirectPath ?? resolveDefaultDestinationForRole(loginResult.data?.user.role);

      // Left true on purpose: this component unmounts once the destination
      // page finishes loading, so there is nothing to reset it back for.
      setIsRedirectingAfterAuthentication(true);
      applicationRouter.push(postAuthenticationDestination);
      applicationRouter.refresh();
    } catch (authenticationError) {
      const authenticationErrorMessage =
        authenticationError instanceof Error ? authenticationError.message : "Unable to complete the request.";
      toast.error("Request failed", { description: authenticationErrorMessage });
    }
  }

  return (
    <main className="bg-background flex flex-1 items-center px-4 py-6 sm:px-8 sm:py-10">
      <AnimatePresence>
        {isRedirectingAfterAuthentication && (
          <ApplicationLoadingOverlay
            title={mode === "sign-up" ? "Setting up your account" : "Signing you in"}
            description="Just a moment."
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="border-border mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border bg-white shadow-[0_30px_80px_-48px_rgba(28,33,29,.38)] lg:grid-cols-[1fr_1fr]"
      >
        <AuthenticationValuePanel mode={mode} />

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-ink flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] lg:hidden"
            >
              <span className="from-brand to-brand-deep grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xs font-bold text-white">
                Kh
              </span>
              Khidmat<span className="text-brand">AI</span>
            </Link>
            <Link
              href="/"
              className={buttonVariants({ variant: "outline", size: "sm", className: "ml-auto gap-1.5 rounded-full" })}
            >
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </div>

          <div className="mt-7">
            <span className="bg-brand-soft text-brand grid size-10 place-items-center rounded-xl">
              <LockKeyhole className="size-5" />
            </span>
            <h1 className="mt-5 text-3xl tracking-[-0.035em]">{authenticationPageTitle}</h1>
            <p className="text-ink/55 mt-2 text-sm">
              {mode === "sign-up" ? "Register as a customer or service provider." : "Secure access to KhidmatAI."}
            </p>
          </div>

          <form onSubmit={handleSubmit(submitValidatedAuthenticationForm)} className="mt-8" noValidate>
            <FieldGroup>
              {mode === "sign-up" && (
                <AuthenticationTextField
                  label={authenticationPageCopy.name}
                  icon={<UserRound className="size-4" />}
                  registration={register("name")}
                  errorMessage={errors.name?.message}
                />
              )}

              <AuthenticationTextField
                label={authenticationPageCopy.email}
                icon={<Mail className="size-4" />}
                type="email"
                autoComplete="email"
                registration={register("email")}
                errorMessage={errors.email?.message}
              />

              <AuthenticationPasswordField
                label={authenticationPageCopy.password}
                isPasswordVisible={isPasswordVisible}
                onToggleVisibility={() => setIsPasswordVisible((currentVisibility) => !currentVisibility)}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                registration={register("password")}
                errorMessage={errors.password?.message}
              />

              {mode === "sign-up" && (
                <AuthenticationPasswordField
                  label={authenticationPageCopy.confirm}
                  isPasswordVisible={isConfirmPasswordVisible}
                  onToggleVisibility={() => setIsConfirmPasswordVisible((currentVisibility) => !currentVisibility)}
                  autoComplete="new-password"
                  registration={register("confirmPassword")}
                  errorMessage={errors.confirmPassword?.message}
                />
              )}

              {mode === "sign-up" && (
                <FieldSet>
                  <FieldLegend variant="label">What best describes you?</FieldLegend>
                  <Controller
                    name="accountType"
                    control={control}
                    render={({ field }) => (
                      <ToggleGroup
                        key={mode}
                        value={field.value ? [field.value] : []}
                        onValueChange={(selectedValues: string[]) => field.onChange(selectedValues[0] ?? "")}
                        className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2"
                      >
                        {accountRoleOptionList.map((accountRoleOption) => {
                          const isSelected = field.value === accountRoleOption.value;
                          return (
                            <ToggleGroupItem
                              key={accountRoleOption.value}
                              value={accountRoleOption.value}
                              aria-label={accountRoleOption.title}
                              className={`relative h-auto w-full flex-col items-start gap-0 rounded-2xl border-2 p-4 text-left whitespace-normal ${
                                isSelected
                                  ? "border-brand bg-brand-soft"
                                  : "border-ink/10 hover:bg-ink/[.03] bg-transparent"
                              }`}
                            >
                              {isSelected && (
                                <span className="bg-brand absolute top-3 right-3 grid size-5 place-items-center rounded-full text-white">
                                  <Check className="size-3" strokeWidth={3} />
                                </span>
                              )}
                              <span
                                className={`grid size-9 shrink-0 place-items-center rounded-xl ${isSelected ? "bg-brand text-white" : "bg-ink/5 text-ink/60"}`}
                              >
                                <accountRoleOption.IconComponent className="size-4" />
                              </span>
                              <span className="text-ink mt-2.5 block text-sm font-semibold">
                                {accountRoleOption.title}
                              </span>
                              <span className="text-ink/55 mt-0.5 block text-xs leading-5 font-normal">
                                {accountRoleOption.description}
                              </span>
                            </ToggleGroupItem>
                          );
                        })}
                      </ToggleGroup>
                    )}
                  />
                  {errors.accountType && <FieldError>{errors.accountType.message}</FieldError>}
                </FieldSet>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand hover:bg-brand-deep h-11 w-full rounded-xl text-sm font-semibold"
              >
                {isSubmitting ? <Spinner /> : <ArrowRight className="size-4" />}
                {mode === "sign-in" ? authenticationPageCopy.submitSignIn : authenticationPageCopy.submitSignUp}
              </Button>
            </FieldGroup>
          </form>

          <AuthenticationAlternativeLink mode={mode} />
        </div>
      </motion.div>
    </main>
  );
}

function AuthenticationValuePanel({ mode }: { mode: AuthenticationFormMode }) {
  const isRegistration = mode === "sign-up";
  return (
    <div className="relative hidden min-h-[690px] overflow-hidden lg:block">
      <Image
        src={
          isRegistration
            ? "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=88"
            : "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=88"
        }
        alt={
          isRegistration
            ? "A skilled electrician completing professional service work"
            : "A comfortable home interior maintained by trusted local professionals"
        }
        fill
        sizes="50vw"
        className="object-cover"
      />
      <div className="from-ink-soft/95 via-ink-soft/45 absolute inset-0 bg-gradient-to-t to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-10 text-white xl:p-12">
        <Link href="/" className="flex w-fit items-center gap-2.5 text-lg font-bold tracking-[-0.035em]">
          <span className="text-brand-deep grid size-9 place-items-center rounded-xl bg-white text-xs font-bold">
            Kh
          </span>
          Khidmat<span className="text-[#a8d5a2]">AI</span>
        </Link>

        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur">
            <ShieldCheck className="size-3.5" />{" "}
            {isRegistration ? "Build trust through real work" : "Welcome back to KhidmatAI"}
          </span>
          <h2 className="mt-5 max-w-md text-3xl leading-tight tracking-[-0.035em]">
            {isRegistration
              ? "Join a marketplace designed for customers and skilled professionals."
              : "Your bookings, providers, and account details are ready when you are."}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            {isRegistration
              ? "Choose how you will use KhidmatAI today. Your workspace automatically adapts to your role."
              : "Sign in securely to continue managing your local service activity."}
          </p>
          <ul className="mt-7 grid gap-3 text-sm text-white/75">
            {[
              "Private and secure account access",
              "Role-specific customer and provider tools",
              "Provider review before public visibility",
            ].map((valueStatement) => (
              <li key={valueStatement} className="flex items-center gap-2.5">
                <span className="bg-accent-warm grid size-5 place-items-center rounded-full">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {valueStatement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function AuthenticationAlternativeLink({ mode }: { mode: AuthenticationFormMode }) {
  const isSignIn = mode === "sign-in";
  return (
    <div className="border-ink/8 mt-8 flex flex-col items-center gap-3 border-t pt-6 text-center sm:flex-row sm:justify-center">
      <p className="text-ink/60 text-sm">
        {isSignIn ? authenticationPageCopy.noAccount : authenticationPageCopy.hasAccount}
      </p>
      <Link
        href={isSignIn ? "/register" : "/login"}
        className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 rounded-full" })}
      >
        {isSignIn ? authenticationPageCopy.submitSignUp : authenticationPageCopy.submitSignIn}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

interface AuthenticationTextFieldProps {
  label: string;
  icon: React.ReactNode;
  type?: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  errorMessage?: string;
}

function AuthenticationTextField({
  label,
  icon,
  type = "text",
  autoComplete = "",
  registration,
  errorMessage,
}: AuthenticationTextFieldProps) {
  const fieldErrorId = `${registration.name}-error`;
  return (
    <Field data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor={registration.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>{icon}</InputGroupAddon>
        <InputGroupInput
          id={registration.name}
          type={type}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? fieldErrorId : undefined}
          {...registration}
        />
      </InputGroup>
      {errorMessage && <FieldError id={fieldErrorId}>{errorMessage}</FieldError>}
    </Field>
  );
}

interface AuthenticationPasswordFieldProps {
  label: string;
  isPasswordVisible: boolean;
  onToggleVisibility: () => void;
  autoComplete: string;
  registration: UseFormRegisterReturn;
  errorMessage?: string;
}

function AuthenticationPasswordField({
  label,
  isPasswordVisible,
  onToggleVisibility,
  autoComplete,
  registration,
  errorMessage,
}: AuthenticationPasswordFieldProps) {
  const fieldErrorId = `${registration.name}-error`;
  return (
    <Field data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor={registration.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <Lock className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          id={registration.name}
          type={isPasswordVisible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? fieldErrorId : undefined}
          {...registration}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            onClick={onToggleVisibility}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            {isPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {errorMessage && <FieldError id={fieldErrorId}>{errorMessage}</FieldError>}
    </Field>
  );
}

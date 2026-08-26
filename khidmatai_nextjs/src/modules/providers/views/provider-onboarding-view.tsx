"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import { Check, LoaderCircle, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAuthenticatedProviderOnboarding, submitAuthenticatedProviderOnboarding, updateAuthenticatedProviderOnboarding } from "@/modules/providers/services/provider-onboarding-api-service";
import type { ProviderOnboardingProfile } from "@/modules/providers/types/provider-onboarding-types";
import { providerOnboardingFormValidationSchema, type ProviderOnboardingFormValues } from "@/modules/providers/validations/provider-onboarding-form-validation-schema";

const emptyProviderOnboardingFormValues: ProviderOnboardingFormValues = {
  phoneNumber: "", governmentIdentityNumber: "", addressLine: "", city: "", yearsOfExperience: 0,
  categoryKeys: "", serviceAreas: "", availabilitySummary: "", professionalBio: "",
};

type ProviderOnboardingSubmitIntent = "save-draft" | "submit-for-review";

export function ProviderOnboardingView() {
  const [providerOnboardingProfile, setProviderOnboardingProfile] = useState<ProviderOnboardingProfile | null>(null);
  const [isProviderOnboardingLoading, setIsProviderOnboardingLoading] = useState(true);
  const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProviderOnboardingFormValues>({
    resolver: zodResolver(providerOnboardingFormValidationSchema),
    defaultValues: emptyProviderOnboardingFormValues,
  });

  useEffect(() => {
    getAuthenticatedProviderOnboarding()
      .then((loadedProviderOnboardingProfile) => {
        setProviderOnboardingProfile(loadedProviderOnboardingProfile);
        reset({
          phoneNumber: loadedProviderOnboardingProfile.phoneNumber ?? "",
          governmentIdentityNumber: loadedProviderOnboardingProfile.governmentIdentityNumber ?? "",
          addressLine: loadedProviderOnboardingProfile.addressLine ?? "",
          city: loadedProviderOnboardingProfile.city ?? "",
          yearsOfExperience: loadedProviderOnboardingProfile.yearsOfExperience ?? 0,
          categoryKeys: loadedProviderOnboardingProfile.categoryKeys.join(", "),
          serviceAreas: loadedProviderOnboardingProfile.serviceAreas.join(", "),
          availabilitySummary: loadedProviderOnboardingProfile.availabilitySummary ?? "",
          professionalBio: loadedProviderOnboardingProfile.professionalBio ?? "",
        });
      })
      .catch((requestError) => toast.error("Unable to load onboarding", { description: requestError instanceof Error ? requestError.message : undefined }))
      .finally(() => setIsProviderOnboardingLoading(false));
  }, [reset]);

  // Both "Save draft" and "Submit for review" run through the same validated
  // submit handler so a submission can never skip client validation or send
  // stale field values that the user edited but never explicitly saved.
  async function processProviderOnboardingSubmission(providerOnboardingFormValues: ProviderOnboardingFormValues, submitIntent: ProviderOnboardingSubmitIntent) {
    if (!providerOnboardingProfile) return;
    try {
      const updatedProviderOnboarding = await updateAuthenticatedProviderOnboarding({
        ...providerOnboardingFormValues,
        categoryKeys: providerOnboardingFormValues.categoryKeys.split(",").map((categoryKey) => categoryKey.trim()).filter(Boolean),
        serviceAreas: providerOnboardingFormValues.serviceAreas.split(",").map((serviceArea) => serviceArea.trim()).filter(Boolean),
        references: [],
        expectedVersion: providerOnboardingProfile.version,
      });
      setProviderOnboardingProfile((currentProfile) => (currentProfile ? { ...currentProfile, version: updatedProviderOnboarding.version } : currentProfile));

      if (submitIntent === "save-draft") {
        toast.success("Provider onboarding draft saved");
        return;
      }

      const submittedProviderOnboarding = await submitAuthenticatedProviderOnboarding(updatedProviderOnboarding.version);
      setProviderOnboardingProfile((currentProfile) => (currentProfile ? { ...currentProfile, status: "submitted", version: submittedProviderOnboarding.version } : currentProfile));
      toast.success("Provider profile submitted for review");
    } catch (requestError) {
      const description = requestError instanceof Error ? requestError.message : undefined;
      toast.error(submitIntent === "save-draft" ? "Unable to save onboarding" : "Unable to submit onboarding", { description });
    }
  }

  if (isProviderOnboardingLoading) {
    return (
      <main className="flex flex-1 items-center justify-center py-24">
        <LoaderCircle className="size-7 animate-spin text-brand" />
        <span className="sr-only">Loading provider onboarding</span>
      </main>
    );
  }

  if (!providerOnboardingProfile) {
    return <main className="flex flex-1 items-center justify-center py-24">Unable to load provider onboarding.</main>;
  }

  const isProviderOnboardingEditable = ["draft", "changes_required"].includes(providerOnboardingProfile.status);
  const submitProviderOnboardingDraft = handleSubmit((values) => processProviderOnboardingSubmission(values, "save-draft"));
  const submitProviderOnboardingForReview = handleSubmit((values) => processProviderOnboardingSubmission(values, "submit-for-review"));

  return (
    <main className="flex-1 bg-brand-soft/25">
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Provider onboarding</p>
            <h1 className="mt-3 text-4xl">Build your professional profile</h1>
            <p className="mt-3 text-ink/55">Save a draft and return at any time. Approval is required before marketplace access.</p>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize shadow-sm">
            {providerOnboardingProfile.status.replaceAll("_", " ")}
          </span>
        </div>

        <form onSubmit={submitProviderOnboardingDraft} className="mt-10 space-y-6" noValidate>
          <ProviderOnboardingFormSection title="Identity and contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProviderOnboardingFormField label="Phone number" registration={register("phoneNumber")} errorMessage={errors.phoneNumber?.message} />
              <ProviderOnboardingFormField label="CNIC / identity number" registration={register("governmentIdentityNumber")} errorMessage={errors.governmentIdentityNumber?.message} autoComplete="off" />
              <ProviderOnboardingFormField label="Address" registration={register("addressLine")} errorMessage={errors.addressLine?.message} />
              <ProviderOnboardingFormField label="City" registration={register("city")} errorMessage={errors.city?.message} />
            </div>
            <p className="mt-4 text-xs text-amber-700">Phone and email delivery integrations are deferred until their providers are configured.</p>
          </ProviderOnboardingFormSection>

          <ProviderOnboardingFormSection title="Services and experience">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProviderOnboardingFormField label="Years of experience" type="number" registration={register("yearsOfExperience", { valueAsNumber: true })} errorMessage={errors.yearsOfExperience?.message} />
              <ProviderOnboardingFormField label="Service categories (comma separated)" registration={register("categoryKeys")} errorMessage={errors.categoryKeys?.message} />
              <ProviderOnboardingFormField label="Service areas (comma separated)" registration={register("serviceAreas")} errorMessage={errors.serviceAreas?.message} />
              <ProviderOnboardingFormField label="Availability" registration={register("availabilitySummary")} errorMessage={errors.availabilitySummary?.message} />
            </div>
            <div className="mt-4">
              <Field data-invalid={Boolean(errors.professionalBio)}>
                <FieldLabel htmlFor="professionalBio">Professional bio</FieldLabel>
                <Textarea
                  id="professionalBio"
                  aria-invalid={Boolean(errors.professionalBio)}
                  aria-describedby={errors.professionalBio ? "professionalBio-error" : undefined}
                  className="min-h-32"
                  {...register("professionalBio")}
                />
                {errors.professionalBio && <FieldError id="professionalBio-error">{errors.professionalBio.message}</FieldError>}
              </Field>
            </div>
          </ProviderOnboardingFormSection>

          <ProviderOnboardingFormSection title="Documents, selfie, portfolio and references">
            <p className="text-sm leading-6 text-ink/55">
              Secure Cloudinary upload workflows will be added when backend credentials are configured. Private evidence is never stored on the frontend or local server disk.
            </p>
          </ProviderOnboardingFormSection>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="outline" disabled={!isProviderOnboardingEditable || isSubmitting} className="h-11 gap-2 rounded-xl px-5">
              {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save draft
            </Button>
            <Button type="button" onClick={submitProviderOnboardingForReview} disabled={!isProviderOnboardingEditable || isSubmitting} className="h-11 gap-2 rounded-xl px-5">
              <Send className="size-4" />
              Save and submit for review
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

function ProviderOnboardingFormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-ink/8 bg-white p-6">
      <h2 className="flex items-center gap-2 text-xl">
        <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand"><Check className="size-4" /></span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProviderOnboardingFormField({ label, registration, errorMessage, type = "text", autoComplete }: { label: string; registration: UseFormRegisterReturn; errorMessage?: string; type?: string; autoComplete?: string }) {
  const fieldErrorId = `${registration.name}-error`;
  return (
    <Field data-invalid={Boolean(errorMessage)}>
      <FieldLabel htmlFor={registration.name}>{label}</FieldLabel>
      <Input
        id={registration.name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? fieldErrorId : undefined}
        {...registration}
      />
      {errorMessage && <FieldError id={fieldErrorId}>{errorMessage}</FieldError>}
    </Field>
  );
}

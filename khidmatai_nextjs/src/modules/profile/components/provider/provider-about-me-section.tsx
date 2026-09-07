"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BookOpenText, Calendar, IdCard, Languages, Mail, MapPinned, Phone, Plus, UserRound, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import type { ProviderProfileData, ProviderProfileUpdateInput } from "@/modules/profile/types/provider-profile-types";
import {
  pakistanMobileNumberInputPattern,
  pakistanMobileNumberValidationMessage,
} from "@/modules/profile/validations/pakistan-phone-number-validation";

const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
const suggestedLanguageList = ["Urdu", "English", "Punjabi", "Pashto", "Sindhi", "Balochi"];

const aboutMeFormSchema = z
  .object({
    professionalBio: z
      .string()
      .trim()
      .min(40, "Write at least 40 characters about your work.")
      .max(1_000, "Use 1,000 characters or fewer."),
    phoneNumber: z.string().trim().regex(pakistanMobileNumberInputPattern, pakistanMobileNumberValidationMessage),
    cnicNumber: z.string().trim().regex(cnicPattern, "Use the format 12345-1234567-1."),
    addressLine: z
      .string()
      .trim()
      .min(5, "Enter your street address, area and city.")
      .max(200, "Use 200 characters or fewer."),
  })
  .strict();

type AboutMeFormValues = z.infer<typeof aboutMeFormSchema>;

interface ProviderAboutMeSectionProps {
  emailAddress: string;
  memberSinceLabel: string;
  profile: ProviderProfileData;
  onSaveProfile: (patch: Partial<ProviderProfileUpdateInput>) => Promise<void>;
  onCompletenessChange: (isComplete: boolean) => void;
}

export function ProviderAboutMeSection({
  emailAddress,
  memberSinceLabel,
  profile,
  onSaveProfile,
  onCompletenessChange,
}: ProviderAboutMeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const initialValues: AboutMeFormValues = { professionalBio: profile.professionalBio ?? "", phoneNumber: profile.phoneNumber ?? "", cnicNumber: profile.governmentIdentityNumber ?? "", addressLine: profile.addressLine ?? "" };
  const initialLanguages = profile.languages.map((language) => language.name);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [languageList, setLanguageList] = useState(initialLanguages);
  const [savedLanguageList, setSavedLanguageList] = useState(initialLanguages);
  const [pendingLanguage, setPendingLanguage] = useState("");
  const [languageError, setLanguageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  const form = useForm<AboutMeFormValues>({ resolver: zodResolver(aboutMeFormSchema), defaultValues: savedValues });

  useEffect(() => {
    onCompletenessChange(aboutMeFormSchema.safeParse(savedValues).success && savedLanguageList.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when the committed (saved) values change
  }, [savedValues, savedLanguageList]);

  function beginEditing() {
    setSuccessMessage("");
    setSubmissionError("");
    setLanguageError("");
    form.reset(savedValues);
    setLanguageList(savedLanguageList);
    setIsEditing(true);
  }
  function cancelEditing() {
    form.reset(savedValues);
    setLanguageList(savedLanguageList);
    setPendingLanguage("");
    setLanguageError("");
    setSubmissionError("");
    setIsEditing(false);
  }
  async function saveAboutMe(values: AboutMeFormValues) {
    if (languageList.length === 0) { setLanguageError("Select at least one language."); toast.error("Check the highlighted profile fields before saving."); return; }
    try {
      await onSaveProfile({ professionalBio: values.professionalBio, phoneNumber: values.phoneNumber, governmentIdentityNumber: values.cnicNumber, addressLine: values.addressLine, languages: languageList });
      setSavedValues(values); setSavedLanguageList(languageList); setIsEditing(false);
      setSubmissionError(""); setSuccessMessage("Your About me information was saved successfully."); toast.success("About me saved successfully.");
    } catch (error) { const message = error instanceof Error ? error.message : "Please try again."; setSubmissionError(message); toast.error("Could not save About me", { description: message }); }
  }
  function addLanguage(language: string) {
    const trimmed = language.trim();
    if (!trimmed || languageList.includes(trimmed)) return;
    setLanguageList((current) => [...current, trimmed]);
    setPendingLanguage("");
  }

  return (
    <ProfileSectionCard
      title="About me"
      description="Private details used for account support, identity verification, and job coordination."
      IconComponent={UserRound}
      action={<ProfileSectionEditToggle isEditing={isEditing} isSaving={form.formState.isSubmitting} formId="provider-about-me-form" onBeginEditing={beginEditing} onCancel={cancelEditing} />}
    >
      {isEditing ? (
        <form id="provider-about-me-form" onSubmit={form.handleSubmit(saveAboutMe, () => toast.error("Check the highlighted profile fields before saving."))} className="space-y-5">
          <Field
            label="Professional biography"
            hint="Describe your skills and experience in 40–1,000 characters"
            error={form.formState.errors.professionalBio?.message}
          >
            <Textarea {...form.register("professionalBio")} aria-invalid={Boolean(form.formState.errors.professionalBio)} className="min-h-28" />
          </Field>

          <div className="space-y-1.5">
            <span className={`block text-xs font-semibold ${languageError ? "text-red-600" : "text-ink/60"}`}>
              Languages spoken <span className="text-red-600">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {languageList.map((language) => (
                <span
                  key={language}
                  className="bg-brand-soft text-brand flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => setLanguageList((current) => current.filter((item) => item !== language))}
                    aria-label={`Remove ${language}`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <span className="text-ink/40 block text-[11px] leading-4">
              Select at least one language customers can use
            </span>
            {languageError ? <span className="block text-xs text-red-600">{languageError}</span> : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {suggestedLanguageList
                .filter((language) => !languageList.includes(language))
                .map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => addLanguage(language)}
                    className="border-ink/15 text-ink/50 hover:border-brand/35 hover:text-brand flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs font-medium"
                  >
                    <Plus className="size-3" />
                    {language}
                  </button>
                ))}
            </div>
            <div className="mt-3 max-w-xs">
              <label>
                <span className="text-ink/60 mb-1.5 block text-xs font-semibold">Another language</span>
                <div className="flex gap-2">
                  <Input
                    value={pendingLanguage}
                    onChange={(changeEvent) => setPendingLanguage(changeEvent.target.value)}
                    placeholder="e.g. Hindko"
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === "Enter") {
                        keyboardEvent.preventDefault();
                        addLanguage(pendingLanguage);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addLanguage(pendingLanguage)}
                    className="border-ink/10 text-ink/60 hover:border-brand/35 hover:text-brand shrink-0 rounded-lg border px-3 text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Phone number"
              hint="Pakistani mobile number, such as +92 300 1234567"
              error={form.formState.errors.phoneNumber?.message}
            >
              <Input
                {...form.register("phoneNumber")}
                inputMode="tel"
                autoComplete="tel"
                placeholder="03001234567"
                aria-invalid={Boolean(form.formState.errors.phoneNumber)}
              />
            </Field>
            <Field
              label="CNIC number"
              hint="Required format: 12345-1234567-1"
              error={form.formState.errors.cnicNumber?.message}
            >
              <Input placeholder="12345-1234567-1" {...form.register("cnicNumber")} aria-invalid={Boolean(form.formState.errors.cnicNumber)} />
            </Field>
            <Field
              label="Street address"
              hint="5–200 characters; include street, area and city"
              error={form.formState.errors.addressLine?.message}
              className="sm:col-span-2"
            >
              <Input {...form.register("addressLine")} aria-invalid={Boolean(form.formState.errors.addressLine)} />
            </Field>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <section className="border-ink/10 rounded-xl border bg-white p-4">
            <div className="text-ink/45 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <BookOpenText className="text-brand size-4" />
              Professional biography
            </div>
            <p className="text-ink/65 mt-2 text-sm leading-7">{savedValues.professionalBio}</p>
          </section>

          <section>
            <div className="text-ink/45 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
              <Languages className="text-brand size-4" />
              Languages spoken
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {savedLanguageList.map((language) => (
                <span
                  key={language}
                  className="border-brand/10 bg-brand-soft/70 text-brand rounded-lg border px-3 py-1.5 text-xs font-semibold"
                >
                  {language}
                </span>
              ))}
            </div>
          </section>

          <div>
            <p className="text-ink/45 text-xs font-semibold tracking-wide uppercase">Personal information</p>
            <dl className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <InfoItem IconComponent={Mail} label="Email address" value={emailAddress} />
              <InfoItem IconComponent={Phone} label="Phone number" value={savedValues.phoneNumber} />
              <InfoItem
                IconComponent={IdCard}
                label="CNIC number"
                value={maskGovernmentIdentityNumber(savedValues.cnicNumber)}
              />
              <InfoItem IconComponent={MapPinned} label="Address" value={savedValues.addressLine} />
              <InfoItem IconComponent={Calendar} label="Member since" value={memberSinceLabel} />
            </dl>
          </div>
        </div>
      )}
      <ProfileOperationFeedback errorMessage={submissionError} successMessage={successMessage} />
    </ProfileSectionCard>
  );
}

function InfoItem({ IconComponent, label, value }: { IconComponent: typeof Mail; label: string; value: string }) {
  return (
    <div className="bg-ink/[.035] flex items-center gap-3 rounded-2xl p-4">
      <span className="text-brand grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm">
        <IconComponent className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-ink/40 text-[11px] font-semibold tracking-wide uppercase">{label}</dt>
        <dd className="text-ink/75 mt-1 truncate text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className={`block text-xs font-semibold ${error ? "text-red-600" : "text-ink/60"}`}>
        {label} <span className="text-red-600">*</span>
      </span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600">{error}</span>
      ) : (
        <span className="text-ink/40 block text-[11px] leading-4">{hint}</span>
      )}
    </label>
  );
}

function maskGovernmentIdentityNumber(identityNumber: string) {
  if (!identityNumber) return "Not added";
  return `•••••-•••••••-${identityNumber.slice(-1)}`;
}

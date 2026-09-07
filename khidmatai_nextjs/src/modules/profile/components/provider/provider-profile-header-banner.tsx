"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BadgeCheck, BriefcaseBusiness, Eye, MapPin, MessageSquareText, Star } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ProfileHeaderBannerShell } from "@/modules/profile/components/profile-header-banner-shell";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { updateAuthenticatedProfileUsername } from "@/modules/profile/services/profile-identity-api-service";
import type { ProviderProfileUpdateInput } from "@/modules/profile/types/provider-profile-types";
import { deleteProviderProfileMedia, uploadProviderProfileMedia } from "@/modules/profile/services/provider-profile-media-api-service";

const headerFormSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Use 100 characters or fewer."),
    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters.")
      .max(30, "Username must contain no more than 30 characters.")
      .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers and underscores, starting with a letter."),
    professionalTitle: z
      .string()
      .trim()
      .min(3, "Enter your professional title.")
      .max(100, "Use 100 characters or fewer."),
    yearsOfExperience: z.number().int().min(0).max(60),
    city: z.string().trim().min(2, "Enter your city.").max(100, "Use 100 characters or fewer."),
  })
  .strict();

type HeaderFormValues = z.infer<typeof headerFormSchema>;

interface ProviderProfileHeaderBannerProps {
  initialDisplayName: string;
  initialUsername?: string;
  initialProfessionalTitle: string;
  initialYearsOfExperience: number;
  initialCity: string;
  initialIsAvailableNow: boolean;
  onSaveProfile: (patch: Partial<ProviderProfileUpdateInput>) => Promise<void>;
  profileImage?: { id: string; url: string };
  statusLabel: string;
  isVerified: boolean;
  referenceCount: number;
  onCompletenessChange: (isComplete: boolean) => void;
}

const initialHeaderValues: HeaderFormValues = {
  fullName: "",
  username: "khidmatai_provider",
  professionalTitle: "Electrician & solar technician",
  yearsOfExperience: 8,
  city: "Islamabad",
};

export function ProviderProfileHeaderBanner({
  initialDisplayName,
  initialUsername,
  initialProfessionalTitle,
  initialYearsOfExperience,
  initialCity,
  initialIsAvailableNow,
  onSaveProfile,
  profileImage,
  statusLabel,
  isVerified,
  referenceCount,
  onCompletenessChange,
}: ProviderProfileHeaderBannerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvailableNow, setIsAvailableNow] = useState(initialIsAvailableNow);
  const [savedIsAvailableNow, setSavedIsAvailableNow] = useState(initialIsAvailableNow);
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [savedValues, setSavedValues] = useState<HeaderFormValues>({
    ...initialHeaderValues,
    fullName: initialDisplayName,
    username: initialUsername ?? createUsernameFromDisplayName(initialDisplayName),
    professionalTitle: initialProfessionalTitle,
    yearsOfExperience: initialYearsOfExperience,
    city: initialCity,
  });

  const form = useForm<HeaderFormValues>({ resolver: zodResolver(headerFormSchema), defaultValues: savedValues });

  useEffect(() => {
    onCompletenessChange(headerFormSchema.safeParse(savedValues).success);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when the committed (saved) values change
  }, [savedValues]);

  function beginEditing() {
    setSuccessMessage("");
    setSubmissionError("");
    form.reset(savedValues);
    setIsAvailableNow(savedIsAvailableNow);
    setIsEditing(true);
  }
  function cancelEditing() {
    form.reset(savedValues);
    setIsAvailableNow(savedIsAvailableNow);
    setIsEditing(false);
  }
  async function saveHeader(values: HeaderFormValues) {
    try {
      await updateAuthenticatedProfileUsername(values.username);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try another username.";
      setSubmissionError(message);
      toast.error("Could not save username", { description: message });
      return;
    }
    try {
      await onSaveProfile({ fullName: values.fullName, professionalTitle: values.professionalTitle, yearsOfExperience: values.yearsOfExperience, city: values.city, isAvailableForNewJobs: isAvailableNow });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again.";
      setSubmissionError(message);
      toast.error("Username saved, but the rest of your basic profile could not be saved", { description: message });
      return;
    }
    setSavedValues(values);
    setSavedIsAvailableNow(isAvailableNow);
    setIsEditing(false);
    setSubmissionError("");
    setSuccessMessage("Your basic profile was saved successfully.");
    toast.success("Basic profile saved.");
  }

  return (
    <form onSubmit={form.handleSubmit(saveHeader, () => toast.error("Check the highlighted basic profile fields before saving."))}>
      <ProfileHeaderBannerShell
        displayName={savedValues.fullName}
        isEditing={isEditing}
        initialProfileImageUrl={profileImage?.url}
        onSaveProfileImage={async (file) => { const saved = await uploadProviderProfileMedia(file, "profile_image"); toast.success("Profile image saved."); return saved.secureDeliveryUrl; }}
        onDeleteProfileImage={profileImage ? async () => { await deleteProviderProfileMedia(profileImage.id); } : undefined}
        actions={
          <>
            {!isEditing && (
              <button
                type="button"
                onClick={() => toast.info("Public profile preview is coming soon.")}
                className="border-ink/10 text-ink/70 hover:border-brand/30 hover:bg-brand-soft/50 hover:text-brand flex h-9 items-center gap-1.5 rounded-lg border bg-white px-3.5 text-sm font-semibold transition"
              >
                <Eye className="size-3.5" />
                Preview public profile
              </button>
            )}
            <ProfileSectionEditToggle
              isEditing={isEditing}
              isSaving={form.formState.isSubmitting}
              editLabel="Edit profile"
              onBeginEditing={beginEditing}
              onCancel={cancelEditing}
            />
          </>
        }
      >
        {isEditing ? (
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            <HeaderField label="Full name" hint="2–100 characters" error={form.formState.errors.fullName?.message}>
              <Input {...form.register("fullName")} aria-invalid={Boolean(form.formState.errors.fullName)} placeholder="e.g. Usman Ali" />
            </HeaderField>
            <HeaderField
              label="Username"
              hint="3–30 lowercase letters, numbers or underscores"
              error={form.formState.errors.username?.message}
            >
              <Input {...form.register("username")} aria-invalid={Boolean(form.formState.errors.username)} placeholder="e.g. usman_electrician" autoCapitalize="none" />
            </HeaderField>
            <HeaderField
              label="Professional title"
              hint="3–100 characters; describe your main trade"
              error={form.formState.errors.professionalTitle?.message}
            >
              <Input {...form.register("professionalTitle")} aria-invalid={Boolean(form.formState.errors.professionalTitle)} placeholder="e.g. Electrician" />
            </HeaderField>
            <HeaderField label="City" hint="Your main service city" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} aria-invalid={Boolean(form.formState.errors.city)} placeholder="e.g. Islamabad" />
            </HeaderField>
            <HeaderField
              label="Years of experience"
              hint="A whole number from 0 to 60"
              error={form.formState.errors.yearsOfExperience?.message}
            >
              <Input
                type="number"
                min={0}
                max={60}
                {...form.register("yearsOfExperience", { valueAsNumber: true })}
                aria-invalid={Boolean(form.formState.errors.yearsOfExperience)}
                placeholder="e.g. 8"
              />
            </HeaderField>
            <label className="bg-ink/[.035] flex cursor-pointer items-start gap-3 rounded-xl p-3.5 sm:col-span-2">
              <Checkbox
                checked={isAvailableNow}
                onCheckedChange={setIsAvailableNow}
                aria-label="Available for new jobs right now"
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-semibold">Available for new jobs right now</span>
                <span className="text-ink/45 mt-1 block text-xs leading-5">
                  Let customers know you are currently accepting new service requests.
                </span>
              </span>
            </label>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl sm:text-2xl">{savedValues.fullName}</h1>
              {isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </span>
              )}
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {statusLabel}
              </span>
            </div>

            <p className="text-brand mt-1 text-sm font-semibold">@{savedValues.username}</p>

            <div className="text-ink/55 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="bg-brand-soft text-brand rounded-full px-2 py-0.5 text-xs font-semibold">
                {savedValues.professionalTitle}
              </span>
              <span className="flex items-center gap-1.5">
                <BriefcaseBusiness className="text-ink/35 size-3.5" />
                {savedValues.yearsOfExperience} years experience
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquareText className="text-ink/35 size-3.5" />
                {referenceCount} references
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="text-ink/35 size-3.5" />
                No reviews yet
              </span>
            </div>

            <div className="text-ink/45 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {savedValues.city}, Pakistan
              </span>
              {savedIsAvailableNow && (
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Available today
                </span>
              )}
            </div>
          </>
        )}
      </ProfileHeaderBannerShell>
      {successMessage ? <p role="status" className="mx-auto mt-3 max-w-7xl px-4 text-sm font-medium text-emerald-700">{successMessage}</p> : null}
      {submissionError ? <div className="mx-auto max-w-7xl px-4"><ProfileOperationFeedback errorMessage={submissionError} /></div> : null}
    </form>
  );
}

function createUsernameFromDisplayName(displayName: string): string {
  const normalizedUsername = displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);

  return /^[a-z]/.test(normalizedUsername) && normalizedUsername.length >= 3
    ? normalizedUsername
    : "khidmatai_provider";
}

function HeaderField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
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

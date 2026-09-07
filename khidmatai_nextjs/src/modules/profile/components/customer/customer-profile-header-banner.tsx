"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Home, MapPin, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileHeaderBannerShell } from "@/modules/profile/components/profile-header-banner-shell";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { updateAuthenticatedProfileUsername } from "@/modules/profile/services/profile-identity-api-service";
import { toast } from "sonner";
import { deleteCustomerProfileImage, uploadCustomerProfileImage } from "@/modules/profile/services/customer-profile-media-api-service";

const headerFormSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name.").max(100, "Use 100 characters or fewer."),
    username: z
      .string()
      .trim()
      .min(3, "Username must contain at least 3 characters.")
      .max(30, "Username must contain no more than 30 characters.")
      .regex(/^[a-z][a-z0-9_]*$/, "Use lowercase letters, numbers and underscores, starting with a letter."),
    city: z.string().trim().min(2, "Enter your city.").max(100, "Use 100 characters or fewer."),
  })
  .strict();

type HeaderFormValues = z.infer<typeof headerFormSchema>;

interface CustomerProfileHeaderBannerProps {
  initialDisplayName: string;
  initialUsername?: string;
  initialCity: string;
  onSaveProfile: (values: { fullName: string; city: string }) => Promise<void>;
  profileImage: { id: string; url: string } | null;
  preferredContactLabel: string;
  savedAddressCount: number;
  onCompletenessChange: (isComplete: boolean) => void;
}

export function CustomerProfileHeaderBanner({
  initialDisplayName,
  initialUsername,
  initialCity,
  onSaveProfile,
  profileImage,
  preferredContactLabel,
  savedAddressCount,
  onCompletenessChange,
}: CustomerProfileHeaderBannerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [savedValues, setSavedValues] = useState<HeaderFormValues>({
    fullName: initialDisplayName,
    username: initialUsername ?? createUsernameFromDisplayName(initialDisplayName),
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
    setIsEditing(true);
  }
  function cancelEditing() {
    form.reset(savedValues);
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
      await onSaveProfile({ fullName: values.fullName, city: values.city });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Try again.";
      setSubmissionError(message);
      toast.error("Username saved, but the rest of your basic profile could not be saved", { description: message });
      return;
    }
    setSavedValues(values);
    setIsEditing(false);
    setSubmissionError("");
    setSuccessMessage("Your basic profile was saved successfully.");
    toast.success("Profile details saved.");
  }

  return (
    <form onSubmit={form.handleSubmit(saveHeader, () => toast.error("Check the highlighted basic profile fields before saving."))}>
      <ProfileHeaderBannerShell
        displayName={savedValues.fullName}
        isEditing={isEditing}
        initialProfileImageUrl={profileImage?.url}
        onSaveProfileImage={async (file) => { const saved = await uploadCustomerProfileImage(file); toast.success("Profile image saved."); return saved.secureDeliveryUrl; }}
        onDeleteProfileImage={profileImage ? async () => { await deleteCustomerProfileImage(); } : undefined}
        actions={
          <ProfileSectionEditToggle
            isEditing={isEditing}
            isSaving={form.formState.isSubmitting}
            editLabel="Edit profile"
            onBeginEditing={beginEditing}
            onCancel={cancelEditing}
          />
        }
      >
        {isEditing ? (
          <div className="grid max-w-md gap-4 sm:grid-cols-2">
            <HeaderField label="Full name" hint="2–100 characters" error={form.formState.errors.fullName?.message}>
              <Input {...form.register("fullName")} aria-invalid={Boolean(form.formState.errors.fullName)} placeholder="e.g. Ahmed Khan" />
            </HeaderField>
            <HeaderField
              label="Username"
              hint="3–30 lowercase letters, numbers or underscores"
              error={form.formState.errors.username?.message}
            >
              <Input {...form.register("username")} aria-invalid={Boolean(form.formState.errors.username)} placeholder="e.g. ahmed_khan" autoCapitalize="none" />
            </HeaderField>
            <HeaderField label="City" hint="Your primary service city" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} aria-invalid={Boolean(form.formState.errors.city)} placeholder="e.g. Islamabad" />
            </HeaderField>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl sm:text-2xl">{savedValues.fullName}</h1>
              <span className="bg-brand-soft text-brand rounded-full px-2.5 py-1 text-xs font-semibold">Customer</span>
            </div>

            <p className="text-brand mt-1 text-sm font-semibold">@{savedValues.username}</p>

            <div className="text-ink/55 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="text-ink/35 size-3.5" />
                Prefers {preferredContactLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Home className="text-ink/35 size-3.5" />
                {savedAddressCount} saved addresses
              </span>
            </div>

            <p className="text-ink/45 mt-1.5 flex items-center gap-1 text-xs font-medium">
              <MapPin className="size-3.5" />
              {savedValues.city}, Pakistan
            </p>
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

  return /^[a-z]/.test(normalizedUsername) && normalizedUsername.length >= 3 ? normalizedUsername : "khidmatai_user";
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

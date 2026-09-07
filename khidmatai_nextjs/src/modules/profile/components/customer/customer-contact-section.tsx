"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Mail, Phone, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import {
  pakistanMobileNumberInputPattern,
  pakistanMobileNumberValidationMessage,
} from "@/modules/profile/validations/pakistan-phone-number-validation";

export const contactOptionList = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
] as const;

const contactFormSchema = z
  .object({
    phoneNumber: z.string().trim().regex(pakistanMobileNumberInputPattern, pakistanMobileNumberValidationMessage),
    preferredContactMethod: z.enum(["phone", "whatsapp", "email"]),
  })
  .strict();

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface CustomerContactSectionProps {
  emailAddress: string;
  initialPhoneNumber: string;
  initialPreferredContactMethod: ContactFormValues["preferredContactMethod"];
  onSaveProfile: (values: ContactFormValues) => Promise<void>;
  onCompletenessChange: (isComplete: boolean) => void;
  onPreferredContactChange: (label: string) => void;
}

export function CustomerContactSection({
  emailAddress,
  initialPhoneNumber,
  initialPreferredContactMethod,
  onSaveProfile,
  onCompletenessChange,
  onPreferredContactChange,
}: CustomerContactSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [savedValues, setSavedValues] = useState<ContactFormValues>({ phoneNumber: initialPhoneNumber, preferredContactMethod: initialPreferredContactMethod });

  const form = useForm<ContactFormValues>({ resolver: zodResolver(contactFormSchema), defaultValues: savedValues });
  const selectedMethod = useWatch({ control: form.control, name: "preferredContactMethod" });

  useEffect(() => {
    onCompletenessChange(contactFormSchema.safeParse(savedValues).success);
    onPreferredContactChange(
      contactOptionList.find((option) => option.value === savedValues.preferredContactMethod)?.label ?? "",
    );
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
  async function saveContact(values: ContactFormValues) {
    try { await onSaveProfile(values); setSavedValues(values); setIsEditing(false); setSubmissionError(""); setSuccessMessage("Your contact details were saved successfully."); toast.success("Contact details saved."); }
    catch (error) { const message = error instanceof Error ? error.message : "Please try again."; setSubmissionError(message); toast.error("Could not save contact details", { description: message }); }
  }

  return (
    <ProfileSectionCard
      title="Contact details"
      description="Your private phone number and how providers should reach you after a confirmed booking."
      IconComponent={UserRound}
      action={<ProfileSectionEditToggle isEditing={isEditing} isSaving={form.formState.isSubmitting} formId="customer-contact-details-form" onBeginEditing={beginEditing} onCancel={cancelEditing} />}
    >
      {isEditing ? (
        <form id="customer-contact-details-form" onSubmit={form.handleSubmit(saveContact, () => toast.error("Check the highlighted contact fields before saving."))} className="space-y-5">
          <Field
            label="Phone number"
            hint="Enter 03001234567, 923001234567, or +923001234567"
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
          <div className="space-y-1.5">
            <span className={`block text-xs font-semibold ${form.formState.errors.preferredContactMethod ? "text-red-600" : "text-ink/60"}`}>
              Preferred contact method <span className="text-red-600">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {contactOptionList.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => form.setValue("preferredContactMethod", option.value, { shouldDirty: true })}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedMethod === option.value
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-ink/10 text-ink/60 hover:border-brand/25"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className="text-ink/40 block text-[11px] leading-4">How a booked provider should contact you</span>
            {form.formState.errors.preferredContactMethod ? <span className="block text-xs text-red-600">{form.formState.errors.preferredContactMethod.message}</span> : null}
          </div>
        </form>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2">
          <InfoItem IconComponent={Mail} label="Email" value={emailAddress} />
          <InfoItem IconComponent={Phone} label="Phone" value={savedValues.phoneNumber} />
        </dl>
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
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block max-w-sm space-y-1.5">
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

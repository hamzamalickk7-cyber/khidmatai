"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareText, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import type { ProviderProfileData, ProviderProfileUpdateInput } from "@/modules/profile/types/provider-profile-types";

interface ProviderReference {
  id: string;
  fullName: string;
  relationship: string;
  contact: string;
}

interface ProviderReferencesSectionProps {
  profile: ProviderProfileData;
  onSaveProfile: (patch: Partial<ProviderProfileUpdateInput>) => Promise<void>;
}

const referenceDraftSchema = z.object({
  fullName: z.string().trim().min(2, "Use at least 2 characters.").max(120, "Use no more than 120 characters."),
  relationship: z.string().trim().min(2, "Describe how this person knows your work.").max(120, "Use no more than 120 characters."),
  contact: z.string().trim().refine((value) => /^\S+@\S+\.\S+$/.test(value) || /^(?:\+92\s?|0)3\d{2}[-\s]?\d{7}$/.test(value), "Enter a valid email or Pakistani mobile number."),
});
type ReferenceDraft = z.infer<typeof referenceDraftSchema>;
const emptyReferenceDraft: ReferenceDraft = { fullName: "", relationship: "", contact: "" };
const MAX_REFERENCES = 5;

export function ProviderReferencesSection({
  profile,
  onSaveProfile,
}: ProviderReferencesSectionProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [referenceList, setReferenceList] = useState<ProviderReference[]>(profile.references.map((reference) => ({ id: reference.id, fullName: reference.fullName, relationship: reference.relationship, contact: reference.email ?? reference.phoneNumber ?? "" })));
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const referenceForm = useForm<ReferenceDraft>({ resolver: zodResolver(referenceDraftSchema), defaultValues: emptyReferenceDraft });

  function addReference(values: ReferenceDraft) {
    if (referenceList.length >= MAX_REFERENCES) return;
    const { fullName, relationship, contact } = values;
    setReferenceList((current) => [
      ...current,
      {
        id: `ref-${Date.now()}`,
        fullName: fullName.trim(),
        relationship: relationship.trim(),
        contact: contact.trim(),
      },
    ]);
    referenceForm.reset(emptyReferenceDraft);
  }
  async function saveReferences() {
    setIsSaving(true);
    try { await onSaveProfile({ references: referenceList.map(({ fullName, relationship, contact }) => contact.includes("@") ? { fullName, relationship, email: contact } : { fullName, relationship, phoneNumber: contact }) }); setIsManaging(false); setSubmissionError(""); setSuccessMessage("Your references were saved successfully."); toast.success("References saved successfully."); }
    catch (error) { const message = error instanceof Error ? error.message : "Please try again."; setSubmissionError(message); toast.error("Could not save references", { description: message }); }
    finally { setIsSaving(false); }
  }
  function removeReference(referenceId: string) {
    setReferenceList((current) => current.filter((reference) => reference.id !== referenceId));
  }

  return (
    <ProfileSectionCard
      title="References"
      description="Past customers or supervisors an administrator can contact during review."
      IconComponent={MessageSquareText}
      action={
        <ProfileSectionEditToggle
          isEditing={isManaging}
          editLabel="Manage references"
          doneLabel="Done"
          isSaving={isSaving}
          onBeginEditing={() => { setSuccessMessage(""); setSubmissionError(""); setIsManaging(true); }}
          onCancel={() => { setSuccessMessage(""); setSubmissionError(""); setIsManaging(false); }}
          onSave={saveReferences}
        />
      }
    >
      <div className="mb-4">
        <p className="text-ink/60 text-xs font-semibold">
          Professional references <span className="text-ink/40 font-normal">(optional)</span>
        </p>
        <p className="text-ink/40 mt-1 text-[11px]">Add up to five references — not required to submit your profile</p>
      </div>
      <ul className="space-y-2">
        {referenceList.map((reference) => (
          <li
            key={reference.id}
            className="bg-ink/[.035] flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{reference.fullName}</p>
              <p className="text-ink/45 truncate text-xs">
                {reference.relationship} · {reference.contact}
              </p>
            </div>
            {isManaging && (
              <button
                type="button"
                onClick={() => removeReference(reference.id)}
                aria-label={`Remove reference ${reference.fullName}`}
                className="text-ink/35 grid size-7 shrink-0 place-items-center rounded-full transition hover:bg-red-50 hover:text-red-600"
              >
                <X className="size-4" />
              </button>
            )}
          </li>
        ))}
        {referenceList.length === 0 && (
          <li className="border-ink/15 text-ink/40 rounded-2xl border border-dashed px-4 py-3 text-sm">
            No references added yet.
          </li>
        )}
      </ul>

      {isManaging && (
        <form onSubmit={referenceForm.handleSubmit(addReference, () => toast.error("Check the highlighted reference fields."))} className="border-ink/10 mt-4 rounded-2xl border bg-white p-4">
          <p className="text-sm font-semibold">Add a reference</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ReferenceField label="Reference name" hint="2–120 characters" error={referenceForm.formState.errors.fullName?.message}>
              <Input {...referenceForm.register("fullName")} aria-invalid={Boolean(referenceForm.formState.errors.fullName)}
                placeholder="e.g. Ahmed Khan"
                maxLength={120}
              />
            </ReferenceField>
            <ReferenceField label="Relationship" hint="How this person knows your work" error={referenceForm.formState.errors.relationship?.message}>
              <Input {...referenceForm.register("relationship")} aria-invalid={Boolean(referenceForm.formState.errors.relationship)}
                placeholder="e.g. Previous customer"
                maxLength={120}
              />
            </ReferenceField>
            <ReferenceField
              label="Phone number or email"
              hint="A valid contact with at least 7 characters"
              error={referenceForm.formState.errors.contact?.message}
              className="sm:col-span-2"
            >
              <Input {...referenceForm.register("contact")} aria-invalid={Boolean(referenceForm.formState.errors.contact)}
                placeholder="e.g. +92 300 1234567"
                maxLength={254}
                onKeyDown={(keyboardEvent) => {
                  if (keyboardEvent.key === "Enter") {
                    keyboardEvent.preventDefault();
                    void referenceForm.handleSubmit(addReference)();
                  }
                }}
              />
            </ReferenceField>
          </div>
          <button
            type="submit"
            disabled={referenceList.length >= MAX_REFERENCES}
            className="bg-brand hover:bg-brand-deep mt-4 flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-40"
          >
            <Plus className="size-4" />
            Add reference
          </button>
          <span className="text-ink/40 ml-3 text-xs">
            {referenceList.length}/{MAX_REFERENCES} references added
          </span>
        </form>
      )}
      <ProfileOperationFeedback errorMessage={submissionError} successMessage={successMessage} />
    </ProfileSectionCard>
  );
}

function ReferenceField({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block space-y-1.5 ${className ?? ""}`}>
      <span className={`block text-xs font-semibold ${error ? "text-red-600" : "text-ink/60"}`}>
        {label} <span className="text-red-600">*</span>
      </span>
      {children}
      <span className={`block text-[11px] leading-4 ${error ? "text-red-600" : "text-ink/40"}`}>{error ?? hint}</span>
    </label>
  );
}

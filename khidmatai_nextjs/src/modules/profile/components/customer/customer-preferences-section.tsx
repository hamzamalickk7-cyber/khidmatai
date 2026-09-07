"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Heart, Sparkles } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";

const servicePreferenceOptionList = [
  { name: "Plumbing", description: "Leaks, taps and drainage" },
  { name: "Electrical", description: "Wiring, switches and fixtures" },
  { name: "Appliance repair", description: "Home appliance maintenance" },
  { name: "Home cleaning", description: "Routine and deep cleaning" },
  { name: "AC & cooling", description: "Cooling installation and repair" },
  { name: "Painting", description: "Interior and exterior finishing" },
];
const preferencesSchema = z.object({ selectedPreferences: z.array(z.string()).min(1, "Choose at least one service preference.") });
type PreferencesValues = z.infer<typeof preferencesSchema>;

export function CustomerPreferencesSection({ initialSelectedPreferenceList, onSavePreferences }: { initialSelectedPreferenceList: string[]; onSavePreferences: (values: string[]) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedList, setSavedList] = useState(initialSelectedPreferenceList);
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const form = useForm<PreferencesValues>({ resolver: zodResolver(preferencesSchema), defaultValues: { selectedPreferences: initialSelectedPreferenceList } });
  const selectedList = useWatch({ control: form.control, name: "selectedPreferences" }) ?? [];

  function beginEditing() { form.reset({ selectedPreferences: savedList }); setSuccessMessage(""); setSubmissionError(""); setIsEditing(true); }
  function cancelEditing() { form.reset({ selectedPreferences: savedList }); setSubmissionError(""); setIsEditing(false); }
  async function saveList(values: PreferencesValues) {
    try { await onSavePreferences(values.selectedPreferences); setSavedList(values.selectedPreferences); form.reset(values); setIsEditing(false); setSubmissionError(""); setSuccessMessage("Your service preferences were saved successfully."); toast.success("Service preferences saved."); }
    catch (error) { const message = error instanceof Error ? error.message : "Please try again."; setSubmissionError(message); toast.error("Could not save service preferences", { description: message }); }
  }
  function toggleOption(option: string) {
    const next = selectedList.includes(option) ? selectedList.filter((item) => item !== option) : [...selectedList, option];
    form.setValue("selectedPreferences", next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  }

  return <ProfileSectionCard title="Service preferences" description="Used to make Explore and future recommendations more relevant." IconComponent={Heart}
    action={<ProfileSectionEditToggle isEditing={isEditing} isSaving={form.formState.isSubmitting} onBeginEditing={beginEditing} onCancel={cancelEditing}
      onSave={form.handleSubmit(saveList, () => { setSubmissionError("Choose at least one service preference."); toast.error("Choose at least one service preference before saving."); })} />}>
    <div className={`rounded-xl p-3 ${form.formState.errors.selectedPreferences ? "bg-red-50 ring-1 ring-red-200" : "bg-transparent"}`}>
      <p className={`mb-2 text-xs font-semibold ${form.formState.errors.selectedPreferences ? "text-red-600" : "text-ink/60"}`}>Preferred services <span className="text-red-600">*</span></p>
      {isEditing ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {servicePreferenceOptionList.map((option) => {
            const isSelected = selectedList.includes(option.name);
            return <button key={option.name} type="button" onClick={() => toggleOption(option.name)} aria-pressed={isSelected}
              className={`flex items-start gap-3 rounded-xl p-3 text-left transition ${isSelected ? "bg-brand-soft ring-brand/20 ring-1" : "bg-ink/[.025] hover:bg-ink/[.045]"}`}>
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${isSelected ? "bg-brand text-white" : "border-ink/15 border bg-white"}`}>{isSelected ? <Check className="size-3.5" /> : null}</span>
              <span><span className={`block text-sm font-semibold ${isSelected ? "text-brand" : "text-ink/75"}`}>{option.name}</span><span className="text-ink/40 mt-0.5 block text-[11px] leading-4">{option.description}</span></span>
            </button>;
          })}
        </div>
      ) : savedList.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {savedList.map((option) => <div key={option} className="bg-brand-soft/55 flex items-center gap-2.5 rounded-xl p-3"><span className="bg-brand text-white grid size-6 place-items-center rounded-full"><Check className="size-3.5" /></span><span className="text-brand text-sm font-semibold">{option}</span></div>)}
        </div>
      ) : (
        <div className="border-ink/10 bg-ink/[.018] flex flex-col items-center rounded-2xl border border-dashed px-5 py-8 text-center">
          <span className="bg-brand-soft text-brand grid size-11 place-items-center rounded-2xl"><Sparkles className="size-5" /></span>
          <p className="text-ink/75 mt-3 text-sm font-semibold">Personalize your recommendations</p>
          <p className="text-ink/45 mt-1 max-w-sm text-xs leading-5">Select the services you commonly need so Explore can surface more relevant professionals.</p>
          <button type="button" onClick={beginEditing} className="text-brand mt-3 text-xs font-semibold hover:underline">Choose preferences</button>
        </div>
      )}
      {form.formState.errors.selectedPreferences ? <p className="mt-2 text-xs text-red-600">{form.formState.errors.selectedPreferences.message}</p> : null}
    </div>
    <ProfileOperationFeedback errorMessage={submissionError} successMessage={successMessage} />
  </ProfileSectionCard>;
}

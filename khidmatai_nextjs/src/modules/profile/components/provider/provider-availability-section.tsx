"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Check, Clock3, MapPin, Plus, ShieldAlert, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import type { ProviderProfileData, ProviderProfileUpdateInput } from "@/modules/profile/types/provider-profile-types";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const availabilitySchema = z.object({
  availableDays: z.array(z.number().int().min(0).max(6)).min(1, "Select at least one working day."),
  startTime: z.string().regex(timePattern, "Choose a valid start time."),
  endTime: z.string().regex(timePattern, "Choose a valid end time."),
}).strict().refine((values) => values.startTime < values.endTime, { path: ["endTime"], message: "End time must be after the start time." });
type AvailabilityValues = z.infer<typeof availabilitySchema>;

const dayOptions = [
  { value: 1, short: "Mon", full: "Monday" }, { value: 2, short: "Tue", full: "Tuesday" },
  { value: 3, short: "Wed", full: "Wednesday" }, { value: 4, short: "Thu", full: "Thursday" },
  { value: 5, short: "Fri", full: "Friday" }, { value: 6, short: "Sat", full: "Saturday" },
  { value: 0, short: "Sun", full: "Sunday" },
];

interface ProviderAvailabilitySectionProps {
  profile: ProviderProfileData;
  onSaveProfile: (patch: Partial<ProviderProfileUpdateInput>) => Promise<void>;
  onCompletenessChange: (isComplete: boolean) => void;
}

function getInitialAvailability(profile: ProviderProfileData): AvailabilityValues {
  return {
    availableDays: [...new Set(profile.weeklyAvailability.map((window) => window.dayOfWeek))],
    startTime: profile.weeklyAvailability[0]?.startTime.slice(0, 5) ?? "09:00",
    endTime: profile.weeklyAvailability[0]?.endTime.slice(0, 5) ?? "17:00",
  };
}

export function ProviderAvailabilitySection({ profile, onSaveProfile, onCompletenessChange }: ProviderAvailabilitySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedValues, setSavedValues] = useState(() => getInitialAvailability(profile));
  const [serviceAreas, setServiceAreas] = useState(profile.serviceAreas);
  const [savedServiceAreas, setSavedServiceAreas] = useState(profile.serviceAreas);
  const [pendingArea, setPendingArea] = useState("");
  const [isEmergencyAvailable, setIsEmergencyAvailable] = useState(profile.offersEmergencyService);
  const [savedEmergencyAvailability, setSavedEmergencyAvailability] = useState(profile.offersEmergencyService);
  const [serviceAreasError, setServiceAreasError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const form = useForm<AvailabilityValues>({ resolver: zodResolver(availabilitySchema), defaultValues: savedValues });
  const selectedDays = useWatch({ control: form.control, name: "availableDays" }) ?? [];

  useEffect(() => { onCompletenessChange(availabilitySchema.safeParse(savedValues).success && savedServiceAreas.length > 0); }, [savedValues, savedServiceAreas, onCompletenessChange]);

  function beginEditing() { form.reset(savedValues); setServiceAreas(savedServiceAreas); setIsEmergencyAvailable(savedEmergencyAvailability); setPendingArea(""); setServiceAreasError(""); setSuccessMessage(""); setSubmissionError(""); setIsEditing(true); }
  function cancelEditing() { form.reset(savedValues); setServiceAreas(savedServiceAreas); setIsEmergencyAvailable(savedEmergencyAvailability); setPendingArea(""); setServiceAreasError(""); setSubmissionError(""); setIsEditing(false); }
  function toggleDay(day: number) {
    const nextDays = selectedDays.includes(day) ? selectedDays.filter((value) => value !== day) : [...selectedDays, day];
    form.setValue("availableDays", nextDays, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  }
  function applyWorkingDays(days: number[]) {
    form.setValue("availableDays", days, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  }
  function applyWorkingHours(startTime: string, endTime: string) {
    form.setValue("startTime", startTime, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
    form.setValue("endTime", endTime, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });
  }
  function addArea() {
    const trimmedArea = pendingArea.trim();
    if (trimmedArea.length < 2) { setServiceAreasError("Enter at least 2 characters for the service area."); return; }
    if (serviceAreas.some((area) => area.toLowerCase() === trimmedArea.toLowerCase())) { setServiceAreasError("This service area is already added."); return; }
    setServiceAreas((current) => [...current, trimmedArea]); setPendingArea(""); setServiceAreasError("");
  }
  async function saveAvailability(values: AvailabilityValues) {
    if (!serviceAreas.length) { setServiceAreasError("Add at least one service area."); toast.error("Add at least one service area before saving."); return; }
    try {
      const dayNames = values.availableDays.map((day) => dayOptions.find((option) => option.value === day)?.short).filter(Boolean).join(", ");
      await onSaveProfile({ availabilitySummary: `${dayNames}, ${values.startTime}–${values.endTime}`, offersEmergencyService: isEmergencyAvailable, serviceAreas, weeklyAvailability: values.availableDays.map((dayOfWeek) => ({ dayOfWeek, startTime: values.startTime, endTime: values.endTime })) });
      setSavedValues(values); setSavedServiceAreas(serviceAreas); setSavedEmergencyAvailability(isEmergencyAvailable); setIsEditing(false); setSubmissionError(""); setSuccessMessage("Your availability and coverage were saved successfully."); toast.success("Availability saved successfully.");
    } catch (error) { const message = error instanceof Error ? error.message : "Please try again."; setSubmissionError(message); toast.error("Could not save availability", { description: message }); }
  }

  return <ProfileSectionCard title="Availability & coverage" description="Set your working days, hours, and the areas where you accept jobs." IconComponent={CalendarClock}
    action={<ProfileSectionEditToggle isEditing={isEditing} isSaving={form.formState.isSubmitting} formId="provider-availability-form" onBeginEditing={beginEditing} onCancel={cancelEditing} />}>
    {isEditing ? <form id="provider-availability-form" onSubmit={form.handleSubmit(saveAvailability, () => toast.error("Review the highlighted availability fields."))} className="space-y-4">
      <section className="border-ink/10 rounded-2xl border bg-white p-4">
        <div className="flex items-center gap-3"><span className="bg-brand-soft text-brand grid size-9 place-items-center rounded-xl"><CalendarClock className="size-4" /></span><div><h3 className="text-sm font-semibold">Working days</h3><p className="text-ink/45 text-xs">Select every day customers can book you.</p></div></div>
        <div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]" onClick={() => applyWorkingDays([1, 2, 3, 4, 5])}>Weekdays</Button><Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]" onClick={() => applyWorkingDays([1, 2, 3, 4, 5, 6])}>Mon–Sat</Button><Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]" onClick={() => applyWorkingDays([0, 1, 2, 3, 4, 5, 6])}>Every day</Button></div>
        <div className="mt-3 flex flex-wrap gap-2">{dayOptions.map((day) => { const active = selectedDays.includes(day.value); return <button key={day.value} type="button" onClick={() => toggleDay(day.value)} aria-pressed={active} title={day.full} className={`flex h-11 min-w-16 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${active ? "bg-brand text-white shadow-sm" : "bg-ink/[.035] text-ink/55 hover:bg-brand-soft hover:text-brand"}`}><span>{day.short}</span>{active ? <Check className="size-3" /> : null}</button>; })}</div>
        <p className="text-ink/40 mt-2 text-[11px]">{selectedDays.length ? `${selectedDays.length} working ${selectedDays.length === 1 ? "day" : "days"} selected` : "No working days selected"}</p>
        {form.formState.errors.availableDays ? <p className="mt-2 text-xs text-red-600">{form.formState.errors.availableDays.message}</p> : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="border-ink/10 rounded-2xl border bg-white p-4">
          <div className="flex items-center gap-3"><span className="bg-brand-soft text-brand grid size-9 place-items-center rounded-xl"><Clock3 className="size-4" /></span><div><h3 className="text-sm font-semibold">Working hours</h3><p className="text-ink/45 text-xs">These hours apply to selected days.</p></div></div>
          <div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]" onClick={() => applyWorkingHours("09:00", "17:00")}>9 AM–5 PM</Button><Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]" onClick={() => applyWorkingHours("08:00", "18:00")}>8 AM–6 PM</Button><Button type="button" size="sm" variant="outline" className="h-7 rounded-full px-3 text-[11px]" onClick={() => applyWorkingHours("10:00", "20:00")}>10 AM–8 PM</Button></div>
          <div className="mt-3 grid grid-cols-2 gap-3"><TimeField label="Start time" error={form.formState.errors.startTime?.message}><Input type="time" lang="en-US" step={1800} {...form.register("startTime")} aria-invalid={Boolean(form.formState.errors.startTime)} className="h-10" /></TimeField><TimeField label="End time" error={form.formState.errors.endTime?.message}><Input type="time" lang="en-US" step={1800} {...form.register("endTime")} aria-invalid={Boolean(form.formState.errors.endTime)} className="h-10" /></TimeField></div>
        </section>
        <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${isEmergencyAvailable ? "border-amber-200 bg-amber-50" : "border-ink/10 bg-white"}`}>
          <Checkbox checked={isEmergencyAvailable} onCheckedChange={setIsEmergencyAvailable} className="mt-1" /><span className="flex gap-3"><ShieldAlert className={`mt-0.5 size-5 ${isEmergencyAvailable ? "text-amber-600" : "text-ink/35"}`} /><span><span className="block text-sm font-semibold">Emergency callouts</span><span className="text-ink/45 mt-1 block text-xs leading-5">Enable this only if customers can contact you for urgent jobs outside normal hours.</span><span className={`mt-2 inline-block text-xs font-semibold ${isEmergencyAvailable ? "text-amber-700" : "text-ink/40"}`}>{isEmergencyAvailable ? "Accepting urgent jobs" : "Not accepting urgent jobs"}</span></span></span>
        </label>
      </div>

      <section className={`rounded-2xl border p-4 ${serviceAreasError ? "border-red-200 bg-red-50/40" : "border-ink/10 bg-white"}`}>
        <div className="flex items-center gap-3"><span className="bg-brand-soft text-brand grid size-9 place-items-center rounded-xl"><MapPin className="size-4" /></span><div><h3 className={`text-sm font-semibold ${serviceAreasError ? "text-red-700" : ""}`}>Service areas <span className="text-red-600">*</span></h3><p className="text-ink/45 text-xs">Add sectors, neighbourhoods, or cities you cover.</p></div></div>
        <div className="mt-4 flex max-w-md gap-2"><Input value={pendingArea} onChange={(event) => setPendingArea(event.target.value)} aria-invalid={Boolean(serviceAreasError)} placeholder="e.g. G-11 or Islamabad" maxLength={100} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addArea(); } }} /><Button type="button" variant="outline" onClick={addArea}><Plus className="size-4" /> Add</Button></div>
        {serviceAreasError ? <p className="mt-2 text-xs text-red-600">{serviceAreasError}</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">{serviceAreas.map((area) => <span key={area} className="bg-brand-soft text-brand flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">{area}<button type="button" onClick={() => setServiceAreas((current) => current.filter((item) => item !== area))} aria-label={`Remove ${area}`}><X className="size-3" /></button></span>)}{!serviceAreas.length ? <p className="text-ink/40 text-xs">No service areas added yet.</p> : null}</div>
      </section>
    </form> : <div className="grid gap-3 lg:grid-cols-3">
      <SummaryCard icon={<CalendarClock className="size-4" />} label="Working days" value={savedValues.availableDays.length ? savedValues.availableDays.map((day) => dayOptions.find((option) => option.value === day)?.short).filter(Boolean).join(", ") : "Not configured"} />
      <SummaryCard icon={<Clock3 className="size-4" />} label="Working hours" value={savedValues.availableDays.length ? `${formatTime(savedValues.startTime)} – ${formatTime(savedValues.endTime)}` : "Not configured"} />
      <SummaryCard icon={<ShieldAlert className="size-4" />} label="Emergency jobs" value={savedEmergencyAvailability ? "Available" : "Not available"} />
      <section className="border-ink/10 rounded-2xl border bg-white p-4 lg:col-span-3"><p className="text-ink/45 flex items-center gap-2 text-xs font-semibold uppercase"><MapPin className="size-4" /> Service areas</p><div className="mt-3 flex flex-wrap gap-2">{savedServiceAreas.length ? savedServiceAreas.map((area) => <span key={area} className="bg-brand-soft text-brand rounded-full px-3 py-1.5 text-xs font-semibold">{area}</span>) : <p className="text-ink/40 text-sm">No service areas configured yet.</p>}</div></section>
    </div>}
    <ProfileOperationFeedback errorMessage={submissionError} successMessage={successMessage} />
  </ProfileSectionCard>;
}

function TimeField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="space-y-1.5"><span className={`block text-xs font-semibold ${error ? "text-red-600" : "text-ink/60"}`}>{label} <span className="text-red-600">*</span></span>{children}<span className={`block text-[11px] ${error ? "text-red-600" : "text-ink/40"}`}>{error ?? "Choose a time (12-hour format shown by your browser)"}</span></label>; }
function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="border-ink/10 rounded-2xl border bg-white p-4"><span className="text-brand grid size-9 place-items-center rounded-xl bg-brand-soft">{icon}</span><p className="text-ink/40 mt-3 text-[11px] font-semibold uppercase">{label}</p><p className="text-ink/75 mt-1 text-sm font-semibold">{value}</p></div>; }
function formatTime(value: string) { const [hourText, minute] = value.split(":"); const hour = Number(hourText); return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`; }

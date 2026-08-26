"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  BriefcaseBusiness,
  CalendarClock,
  IdCard,
  Images,
  Mail,
  MapPin,
  MapPinned,
  MessageSquareText,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileCompletenessCard } from "@/modules/profile/components/profile-completeness-card";
import { ProfileHeaderBanner } from "@/modules/profile/components/profile-header-banner";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProviderApplicationProgressCard } from "@/modules/profile/components/provider-application-progress-card";

interface ProviderProfileViewProperties {
  providerName: string;
  providerEmail: string;
}

const providerWorkImageList = [
  {
    source: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=85",
    alternativeText: "Electrician working on a residential electrical panel",
  },
  {
    source: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=85",
    alternativeText: "Electrical tools prepared for a home service job",
  },
  {
    source: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=85",
    alternativeText: "Professional completing repair work",
  },
];

const initialReferenceList = ["Ahmed Bilal · Gulberg · +92 300 1112223", "Sana Tariq · Model Town · +92 321 4445556"];

const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;

const providerProfilePreviewSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    phoneNumber: z.string().trim().min(10, "Enter a valid phone number."),
    cnicNumber: z.string().trim().regex(cnicPattern, "Use the format 12345-1234567-1."),
    city: z.string().trim().min(2, "Enter your city."),
    addressLine: z.string().trim().min(5, "Enter your street address."),
    professionalTitle: z.string().trim().min(3, "Enter your professional title."),
    yearsOfExperience: z.number().int().min(0, "Enter 0 or more years.").max(60, "Enter a realistic number of years."),
    professionalBio: z.string().trim().min(40, "Write at least 40 characters about your work."),
  })
  .strict();

type ProviderProfilePreviewValues = z.infer<typeof providerProfilePreviewSchema>;

export function ProviderProfileView({ providerName, providerEmail }: ProviderProfileViewProperties) {
  const initialValues: ProviderProfilePreviewValues = {
    fullName: providerName,
    phoneNumber: "+92 300 1234567",
    cnicNumber: "35202-1234567-1",
    city: "Lahore",
    addressLine: "House 12, Street 4, Model Town",
    professionalTitle: "Electrician & solar technician",
    yearsOfExperience: 8,
    professionalBio:
      "Residential electrician experienced in wiring, fault finding, switchboard upgrades and small solar installations. This sample biography demonstrates how an approved provider profile will appear to customers.",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [referenceList, setReferenceList] = useState(initialReferenceList);
  const [savedReferenceList, setSavedReferenceList] = useState(initialReferenceList);
  const [pendingReference, setPendingReference] = useState("");

  const profileForm = useForm<ProviderProfilePreviewValues>({
    resolver: zodResolver(providerProfilePreviewSchema),
    defaultValues: initialValues,
  });

  function cancelEditing() {
    profileForm.reset(savedValues);
    setReferenceList(savedReferenceList);
    setPendingReference("");
    setIsEditing(false);
  }

  function savePreview(values: ProviderProfilePreviewValues) {
    setSavedValues(values);
    setSavedReferenceList(referenceList);
    setIsEditing(false);
    toast.success("Provider profile preview updated", { description: "No data was sent to the backend." });
  }

  function addReference() {
    const trimmedReference = pendingReference.trim();
    if (!trimmedReference) return;
    setReferenceList((currentList) => [...currentList, trimmedReference]);
    setPendingReference("");
  }

  function removeReference(referenceToRemove: string) {
    setReferenceList((currentList) => currentList.filter((reference) => reference !== referenceToRemove));
  }

  return (
    <main className="flex-1 bg-[#f7f7f8] px-5 py-8 sm:px-8 sm:py-10">
      <form onSubmit={profileForm.handleSubmit(savePreview)} className="mx-auto max-w-6xl">
        <ProfileHeaderBanner
          displayName={savedValues.fullName}
          emailAddress={providerEmail}
          roleLabel="Service provider"
          statusLabel="Draft profile"
          locationLabel={`${savedValues.city}, Pakistan · Preview location`}
          phoneNumberLabel={`${savedValues.phoneNumber} · Preview`}
          quickFactList={[
            savedValues.professionalTitle,
            `${savedValues.yearsOfExperience} yrs experience`,
            `${referenceList.length} references`,
            "No reviews yet",
          ]}
          initialProfileImageUrl="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=85"
          isEditing={isEditing}
          onBeginEditing={() => setIsEditing(true)}
          onCancelEditing={cancelEditing}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-ink/10 bg-white p-6 sm:p-7">
              <div className="border-b border-ink/8 pb-5">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Private account details</p>
                <h2 className="mt-2 text-xl">Basic information</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/50">
                  Used by KhidmatAI for account support, identity verification and job coordination. Only approved public details appear in Explore.
                </p>
              </div>

              {isEditing ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <EditableProviderField label="Full name" error={profileForm.formState.errors.fullName?.message}>
                    <Input {...profileForm.register("fullName")} aria-invalid={Boolean(profileForm.formState.errors.fullName)} />
                  </EditableProviderField>
                  <EditableProviderField label="Email address">
                    <Input value={providerEmail} disabled />
                  </EditableProviderField>
                  <EditableProviderField label="Phone number" error={profileForm.formState.errors.phoneNumber?.message}>
                    <Input {...profileForm.register("phoneNumber")} aria-invalid={Boolean(profileForm.formState.errors.phoneNumber)} />
                  </EditableProviderField>
                  <EditableProviderField label="CNIC number" error={profileForm.formState.errors.cnicNumber?.message}>
                    <Input placeholder="12345-1234567-1" {...profileForm.register("cnicNumber")} aria-invalid={Boolean(profileForm.formState.errors.cnicNumber)} />
                  </EditableProviderField>
                  <EditableProviderField label="City" error={profileForm.formState.errors.city?.message}>
                    <Input {...profileForm.register("city")} aria-invalid={Boolean(profileForm.formState.errors.city)} />
                  </EditableProviderField>
                  <EditableProviderField label="Street address" error={profileForm.formState.errors.addressLine?.message}>
                    <Input {...profileForm.register("addressLine")} aria-invalid={Boolean(profileForm.formState.errors.addressLine)} />
                  </EditableProviderField>
                </div>
              ) : (
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <BasicInformationItem IconComponent={UserRound} label="Full name" value={savedValues.fullName} />
                  <BasicInformationItem IconComponent={Mail} label="Email address" value={providerEmail} />
                  <BasicInformationItem IconComponent={Phone} label="Phone number" value={`${savedValues.phoneNumber} · Preview`} />
                  <BasicInformationItem IconComponent={IdCard} label="CNIC number" value={maskGovernmentIdentityNumber(savedValues.cnicNumber)} />
                  <BasicInformationItem IconComponent={MapPin} label="City" value={`${savedValues.city} · Preview`} />
                  <BasicInformationItem IconComponent={MapPinned} label="Street address" value={`${savedValues.addressLine} · Preview`} />
                </dl>
              )}
            </section>

            <section className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
              <div className="flex flex-col gap-4 border-b border-ink/8 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-7">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Public listing preview</p>

                  {isEditing ? (
                    <EditableProviderField label="Professional title" error={profileForm.formState.errors.professionalTitle?.message} className="mt-3">
                      <Input {...profileForm.register("professionalTitle")} aria-invalid={Boolean(profileForm.formState.errors.professionalTitle)} />
                    </EditableProviderField>
                  ) : (
                    <h2 className="mt-2 text-2xl">{savedValues.professionalTitle}</h2>
                  )}

                  {isEditing ? (
                    <EditableProviderField label="Years of experience" error={profileForm.formState.errors.yearsOfExperience?.message} className="mt-3 max-w-40">
                      <Input
                        type="number"
                        min={0}
                        max={60}
                        {...profileForm.register("yearsOfExperience", { valueAsNumber: true })}
                        aria-invalid={Boolean(profileForm.formState.errors.yearsOfExperience)}
                      />
                    </EditableProviderField>
                  ) : (
                    <p className="mt-2 flex items-center gap-2 text-sm text-ink/50">
                      <BriefcaseBusiness className="size-4" />
                      {savedValues.yearsOfExperience} years of experience · Preview
                    </p>
                  )}
                </div>
                <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Not visible in Explore
                </span>
              </div>

              <div className="p-6 sm:p-7">
                <h3 className="text-sm font-semibold">About</h3>

                {isEditing ? (
                  <EditableProviderField label="Professional biography" error={profileForm.formState.errors.professionalBio?.message} className="mt-3">
                    <Textarea {...profileForm.register("professionalBio")} className="min-h-32" aria-invalid={Boolean(profileForm.formState.errors.professionalBio)} />
                  </EditableProviderField>
                ) : (
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/60">{savedValues.professionalBio}</p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {["Home wiring", "Electrical repair", "Solar installation", "Emergency callout"].map((service) => (
                    <span key={service} className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                      {service} · Preview
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <ProfileSectionCard title="Service coverage" IconComponent={MapPinned}>
                <p className="text-sm font-semibold">Lahore</p>
                <p className="mt-2 text-sm leading-6 text-ink/50">Model Town, Gulberg, Garden Town and nearby areas · Preview</p>
              </ProfileSectionCard>
              <ProfileSectionCard title="Availability" IconComponent={CalendarClock}>
                <p className="text-sm font-semibold">Monday–Saturday</p>
                <p className="mt-2 text-sm leading-6 text-ink/50">9:00 AM–7:00 PM · Emergency jobs by request · Preview</p>
              </ProfileSectionCard>
            </div>

            <ProfileSectionCard
              title="Work gallery"
              description="Real job photographs will help customers judge workmanship before booking."
              IconComponent={Images}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {providerWorkImageList.map((image, index) => (
                  <button
                    key={image.source}
                    type="button"
                    onClick={() => toast.info("Gallery management will be built after design approval.")}
                    className={`group relative overflow-hidden rounded-2xl bg-ink/5 ${index === 0 ? "col-span-2 aspect-[2/1] sm:col-span-1 sm:aspect-square" : "aspect-square"}`}
                  >
                    <Image src={image.source} alt={image.alternativeText} fill sizes="(max-width: 640px) 80vw, 240px" className="object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">Preview</span>
                  </button>
                ))}
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="References" description="Past customers or supervisors an administrator can contact during review." IconComponent={MessageSquareText}>
              <ul className="space-y-2">
                {referenceList.map((reference) => (
                  <li key={reference} className="flex items-center justify-between gap-3 rounded-2xl bg-ink/[.035] px-4 py-3">
                    <span className="truncate text-sm text-ink/70">{reference}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeReference(reference)}
                        aria-label={`Remove reference ${reference}`}
                        className="grid size-7 shrink-0 place-items-center rounded-full text-ink/35 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
                {referenceList.length === 0 && <li className="rounded-2xl border border-dashed border-ink/15 px-4 py-3 text-sm text-ink/40">No references added yet.</li>}
              </ul>

              {isEditing && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={pendingReference}
                    onChange={(changeEvent) => setPendingReference(changeEvent.target.value)}
                    placeholder="Name · Area · Phone number"
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === "Enter") {
                        keyboardEvent.preventDefault();
                        addReference();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addReference}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-4 text-sm font-semibold text-brand transition hover:bg-brand-soft/70"
                  >
                    <Plus className="size-4" />
                    Add
                  </button>
                </div>
              )}
            </ProfileSectionCard>

            <ProfileSectionCard title="Experience & trust" description="These details will be reviewed before the listing becomes active." IconComponent={ShieldCheck}>
              <div className="grid gap-3 sm:grid-cols-3">
                <TrustItem IconComponent={Wrench} label="Experience" value={`${savedValues.yearsOfExperience} years · Preview`} />
                <TrustItem IconComponent={MessageSquareText} label="References" value={`${referenceList.length} added · Preview`} />
                <TrustItem IconComponent={Star} label="Reviews" value="No reviews yet" />
              </div>
            </ProfileSectionCard>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <ProviderApplicationProgressCard currentStageKey="draft" />
            <ProfileCompletenessCard
              checklist={[
                { label: "Account details", isComplete: true },
                { label: "CNIC and address", isComplete: false },
                { label: "Services and areas", isComplete: false },
                { label: "Professional biography", isComplete: false },
                { label: "Work gallery", isComplete: false },
                { label: "References", isComplete: referenceList.length > 0 },
              ]}
            />
            <div className="rounded-3xl bg-ink p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-brand">Profile visibility</p>
              <h2 className="mt-3 text-lg">Complete your provider profile</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Your listing remains private until the required profile sections are complete and an administrator approves it.
              </p>
              <button
                type="button"
                onClick={() => toast.info("Profile editing will open from the Edit profile action.")}
                className="mt-5 w-full rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink"
              >
                Review missing details
              </button>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}

function BasicInformationItem({ IconComponent, label, value }: { IconComponent: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ink/[.035] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
        <IconComponent className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{label}</dt>
        <dd className="mt-1 truncate text-sm font-medium text-ink/75">{value}</dd>
      </div>
    </div>
  );
}

function maskGovernmentIdentityNumber(identityNumber: string) {
  const finalDigit = identityNumber.slice(-1);
  return `•••••-•••••••-${finalDigit}`;
}

function EditableProviderField({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-ink/60">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function TrustItem({ IconComponent, label, value }: { IconComponent: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink/[.035] p-4">
      <IconComponent className="size-4 text-brand" />
      <p className="mt-3 text-xs text-ink/40">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

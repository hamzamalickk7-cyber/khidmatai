"use client";

import {
  BadgeCheck,
  Briefcase,
  Clock3,
  FileText,
  IdCard,
  MapPin,
  Phone,
  ScrollText,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProfileCompletenessCard } from "@/modules/profile/components/profile-completeness-card";
import { ProfileDetailFieldRow } from "@/modules/profile/components/profile-detail-field-row";
import { ProfileDocumentUploadRow } from "@/modules/profile/components/profile-document-upload-row";
import { ProfileHeaderBanner } from "@/modules/profile/components/profile-header-banner";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProviderApplicationProgressCard } from "@/modules/profile/components/provider-application-progress-card";

interface ProviderProfileViewProps {
  providerName: string;
  providerEmail: string;
}

export function ProviderProfileView({ providerName, providerEmail }: ProviderProfileViewProps) {
  const completenessChecklist = [
    { label: "Basic account details", isComplete: true },
    { label: "Identity & contact", isComplete: false },
    { label: "Services & experience", isComplete: false },
    { label: "Professional bio", isComplete: false },
    { label: "Verification documents", isComplete: false },
  ];

  return (
    <main className="flex-1 bg-[#fafafa] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <ProfileHeaderBanner
          displayName={providerName}
          emailAddress={providerEmail}
          eyebrowLabel="Provider profile"
          StatusBadgeIcon={Clock3}
          statusLabel="Draft — not yet visible to customers"
          statusTone="warning"
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.65fr]">
          <div className="space-y-6">
            <ProfileSectionCard title="Identity & contact" description="Kept private and never shown on your public profile." IconComponent={IdCard}>
              <ProfileDetailFieldRow label="Full name" value={providerName} placeholder="Add your full name" IconComponent={UserRound} />
              <ProfileDetailFieldRow label="Phone number" placeholder="Add a phone number" IconComponent={Phone} />
              <ProfileDetailFieldRow label="CNIC / identity number" placeholder="Add your identity number" IconComponent={IdCard} />
              <ProfileDetailFieldRow label="Address" placeholder="Add your address" IconComponent={MapPin} />
              <ProfileDetailFieldRow label="City" placeholder="Add your city" IconComponent={MapPin} />
            </ProfileSectionCard>

            <ProfileSectionCard title="Services & experience" description="Customers filter and match on this information." IconComponent={Briefcase}>
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Service categories</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <AddChipButton label="+ Add category" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink/40">Service areas</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <AddChipButton label="+ Add service area" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileDetailFieldRow label="Years of experience" placeholder="Add years of experience" IconComponent={Briefcase} />
                  <ProfileDetailFieldRow label="Availability" placeholder="Add your typical availability" IconComponent={Clock3} />
                </div>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="Professional bio" description="Shown to customers once your profile is active." IconComponent={ScrollText}>
              <Textarea
                readOnly
                placeholder="Describe your trade, experience and the kind of jobs you take on..."
                className="min-h-28 cursor-pointer"
                onClick={() => toast.info("Profile editing is coming soon")}
              />
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Verification documents"
              description="Private and reviewed by KhidmatAI staff only."
              IconComponent={ShieldAlert}
              footerNote="Secure document uploads open once verified storage is connected."
            >
              <div className="space-y-3">
                <ProfileDocumentUploadRow label="CNIC (front)" description="Clear photo of the front side" IconComponent={IdCard} />
                <ProfileDocumentUploadRow label="CNIC (back)" description="Clear photo of the back side" IconComponent={IdCard} />
                <ProfileDocumentUploadRow label="Selfie verification" description="A recent photo of yourself" IconComponent={UserRound} />
                <ProfileDocumentUploadRow label="Trade certificate" description="Optional, strengthens your application" IconComponent={FileText} />
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="References" description="Past customers or employers who can vouch for your work." IconComponent={Users}>
              <div className="rounded-2xl border border-dashed border-ink/12 p-6 text-center">
                <p className="text-sm text-ink/50">No references added yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 rounded-full"
                  onClick={() => toast.info("Profile editing is coming soon")}
                >
                  + Add a reference
                </Button>
              </div>
            </ProfileSectionCard>
          </div>

          <div className="space-y-6">
            <ProviderApplicationProgressCard currentStageKey="draft" />
            <ProfileCompletenessCard checklist={completenessChecklist} />

            <ProfileSectionCard title="Ready to submit?" IconComponent={BadgeCheck}>
              <p className="text-sm leading-6 text-ink/55">
                Complete every section above, then submit your profile for review. You can save a draft and come back anytime.
              </p>
              <Button className="mt-4 w-full rounded-xl" onClick={() => toast.info("Profile editing is coming soon")}>
                Submit for review
              </Button>
            </ProfileSectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function AddChipButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.info("Profile editing is coming soon")}
      className="rounded-full border border-dashed border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/45 hover:border-brand/30 hover:text-brand"
    >
      {label}
    </button>
  );
}

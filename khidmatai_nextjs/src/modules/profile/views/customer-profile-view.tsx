"use client";

import { BadgeCheck, Bell, Heart, KeyRound, Mail, MapPin, Phone, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileCompletenessCard } from "@/modules/profile/components/profile-completeness-card";
import { ProfileDetailFieldRow } from "@/modules/profile/components/profile-detail-field-row";
import { ProfileHeaderBanner } from "@/modules/profile/components/profile-header-banner";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";

interface CustomerProfileViewProps {
  customerName: string;
  customerEmail: string;
}

const customerNotificationPreferenceList = [
  { label: "Booking updates", description: "Confirmations, status changes and reminders." },
  { label: "New messages", description: "When a provider responds to your request." },
  { label: "Product news", description: "Occasional updates about new KhidmatAI features." },
];

export function CustomerProfileView({ customerName, customerEmail }: CustomerProfileViewProps) {
  const completenessChecklist = [
    { label: "Basic account details", isComplete: true },
    { label: "Phone number", isComplete: false },
    { label: "Home area / address", isComplete: false },
    { label: "Notification preferences", isComplete: false },
  ];

  return (
    <main className="flex-1 bg-[#fafafa] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <ProfileHeaderBanner
          displayName={customerName}
          emailAddress={customerEmail}
          eyebrowLabel="Customer profile"
          StatusBadgeIcon={BadgeCheck}
          statusLabel="Account in good standing"
          statusTone="positive"
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.65fr]">
          <div className="space-y-6">
            <ProfileSectionCard
              title="Contact details"
              description="Used for booking confirmations and provider coordination."
              IconComponent={Phone}
            >
              <ProfileDetailFieldRow label="Full name" value={customerName} placeholder="Add your full name" IconComponent={BadgeCheck} />
              <ProfileDetailFieldRow label="Email address" value={customerEmail} placeholder="Add your email" IconComponent={Mail} />
              <ProfileDetailFieldRow label="Phone number" placeholder="Add a phone number" IconComponent={Smartphone} />
              <ProfileDetailFieldRow label="Home area" placeholder="Add your neighborhood or city" IconComponent={MapPin} />
            </ProfileSectionCard>

            <ProfileSectionCard
              title="Saved preferences"
              description="Speeds up future requests. Nothing here is shared publicly."
              IconComponent={Heart}
              footerNote="Preferred categories help us show more relevant providers first."
            >
              <div className="flex flex-wrap gap-2">
                {["Plumbing", "Electrical", "Home cleaning"].map((categoryLabel) => (
                  <span key={categoryLabel} className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                    {categoryLabel}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => toast.info("Profile editing is coming soon")}
                  className="rounded-full border border-dashed border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/45 hover:border-brand/30 hover:text-brand"
                >
                  + Add category
                </button>
              </div>
            </ProfileSectionCard>

            <ProfileSectionCard title="Notifications" description="Choose what KhidmatAI keeps you posted about." IconComponent={Bell}>
              <div className="divide-y divide-ink/6">
                {customerNotificationPreferenceList.map((preference) => (
                  <div key={preference.label} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-ink">{preference.label}</p>
                      <p className="mt-0.5 text-xs text-ink/50">{preference.description}</p>
                    </div>
                    <MockToggleSwitch />
                  </div>
                ))}
              </div>
            </ProfileSectionCard>
          </div>

          <div className="space-y-6">
            <ProfileCompletenessCard checklist={completenessChecklist} />

            <ProfileSectionCard title="Account & security" IconComponent={ShieldCheck}>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 rounded-xl"
                  onClick={() => toast.info("Profile editing is coming soon")}
                >
                  <KeyRound className="size-4" />
                  Change password
                </Button>
                <div className="rounded-xl bg-ink/[.03] p-3.5 text-xs leading-5 text-ink/50">
                  <p className="font-semibold text-ink/70">This device</p>
                  <p className="mt-0.5">Signed in just now &middot; current session</p>
                </div>
              </div>
            </ProfileSectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}

function MockToggleSwitch() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Profile editing is coming soon")}
      aria-label="Toggle notification preference"
      className="relative h-6 w-11 shrink-0 rounded-full bg-ink/10 transition hover:bg-ink/15"
    >
      <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition" />
    </button>
  );
}

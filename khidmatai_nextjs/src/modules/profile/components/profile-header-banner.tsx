"use client";

import { useState } from "react";
import { Check, Mail, MapPin, Pencil, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ProfileAvatarUploadDialog,
  renderProfileAvatarCropStyle,
  type ProfileAvatarCropResult,
} from "@/modules/profile/components/profile-avatar-upload-dialog";

interface ProfileHeaderBannerProps {
  displayName: string;
  emailAddress: string;
  roleLabel: string;
  locationLabel: string;
  phoneNumberLabel?: string;
  quickFactList?: string[];
  initialProfileImageUrl?: string;
  statusLabel?: string;
  isEditing: boolean;
  onBeginEditing: () => void;
  onCancelEditing: () => void;
}

export function ProfileHeaderBanner({
  displayName,
  emailAddress,
  roleLabel,
  locationLabel,
  phoneNumberLabel,
  quickFactList,
  initialProfileImageUrl,
  statusLabel,
  isEditing,
  onBeginEditing,
  onCancelEditing,
}: ProfileHeaderBannerProps) {
  const [confirmedCrop, setConfirmedCrop] = useState<ProfileAvatarCropResult | null>(null);
  const initials = getDisplayInitials(displayName);

  return (
    <header className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
      <div className="flex">
        <div className="group relative w-24 shrink-0 self-stretch overflow-hidden bg-brand sm:w-36">
          {confirmedCrop ? (
            // eslint-disable-next-line @next/next/no-img-element -- object URL, not eligible for next/image's remote loader
            <img
              src={confirmedCrop.objectUrl}
              alt={`${displayName} profile`}
              className="absolute left-1/2 top-1/2 h-full w-full max-w-none object-cover"
              style={renderProfileAvatarCropStyle(confirmedCrop)}
            />
          ) : initialProfileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- consistent rendering path with the cropped-photo case above
            <img src={initialProfileImageUrl} alt={`${displayName} profile`} className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-3xl font-bold text-white">{initials}</span>
          )}
          <ProfileAvatarUploadDialog currentCrop={confirmedCrop} onCropConfirmed={setConfirmedCrop} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="truncate text-lg sm:text-xl">{displayName}</h1>
                <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">{roleLabel}</span>
                {statusLabel && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{statusLabel}</span>}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink/45">
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5 text-brand" />
                  {emailAddress}
                </span>
                {phoneNumberLabel && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3.5 text-brand" />
                    {phoneNumberLabel}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-brand" />
                  {locationLabel}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isEditing ? (
                <>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-full" onClick={onCancelEditing}>
                    <X className="size-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 rounded-full bg-brand text-white hover:bg-brand-deep"
                  >
                    <Check className="size-3.5" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="gap-1.5 rounded-full bg-ink text-white hover:bg-ink/85"
                  onClick={onBeginEditing}
                >
                  <Pencil className="size-3.5" />
                  Edit profile
                </Button>
              )}
            </div>
          </div>

          {quickFactList && quickFactList.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-ink/8 pt-3">
              {quickFactList.map((quickFact) => (
                <span
                  key={quickFact}
                  className="flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-deep"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                  {quickFact}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getDisplayInitials(fullName: string): string {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join("");
  return initials || "U";
}

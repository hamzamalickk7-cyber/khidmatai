"use client";

import { useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ProfileAvatarUploadDialog,
  renderProfileAvatarCropStyle,
  type ProfileAvatarCropResult,
} from "@/modules/profile/components/profile-avatar-upload-dialog";

interface ProfileHeaderBannerShellProps {
  displayName: string;
  initialProfileImageUrl?: string;
  isEditing: boolean;
  actions: ReactNode;
  children: ReactNode;
  onSaveProfileImage?: (file: File) => Promise<string>;
  onDeleteProfileImage?: () => Promise<void>;
}

export function ProfileHeaderBannerShell({
  displayName,
  initialProfileImageUrl,
  isEditing,
  actions,
  children,
  onSaveProfileImage,
  onDeleteProfileImage,
}: ProfileHeaderBannerShellProps) {
  const [confirmedCrop, setConfirmedCrop] = useState<ProfileAvatarCropResult | null>(null);
  const [isInitialImageDeleted, setIsInitialImageDeleted] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const initials = getDisplayInitials(displayName);
  const hasProfileImage = Boolean(confirmedCrop || (initialProfileImageUrl && !isInitialImageDeleted));

  async function handleCropConfirmed(crop: ProfileAvatarCropResult) {
    if (onSaveProfileImage) {
      const savedImageUrl = await onSaveProfileImage(crop.file);
      window.dispatchEvent(new CustomEvent("khidmatai:profile-image-changed", { detail: { imageUrl: savedImageUrl } }));
    }
    setConfirmedCrop(crop); setIsInitialImageDeleted(false);
  }

  async function deleteProfileImage() {
    setIsDeletingImage(true);
    try {
      if (onDeleteProfileImage) await onDeleteProfileImage();
      window.dispatchEvent(new CustomEvent("khidmatai:profile-image-changed", { detail: { imageUrl: null } }));
      setConfirmedCrop(null);
      setIsInitialImageDeleted(true);
      toast.success("Profile photo removed.");
    } catch (error) {
      toast.error("Could not remove profile photo", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setIsDeletingImage(false);
    }
  }

  return (
    <header className="border-ink/10 rounded-2xl border bg-white p-5 shadow-[0_18px_50px_-42px_rgba(20,83,45,.35)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-start gap-3">
            <div className="bg-brand-soft ring-brand-soft relative size-24 overflow-hidden rounded-full ring-4 sm:size-28">
              {confirmedCrop ? (
                // eslint-disable-next-line @next/next/no-img-element -- object URL, not eligible for next/image's remote loader
                <img
                  src={confirmedCrop.objectUrl}
                  alt={`${displayName} profile`}
                  className="absolute top-1/2 left-1/2 h-full w-full max-w-none object-cover"
                  style={renderProfileAvatarCropStyle(confirmedCrop)}
                />
              ) : initialProfileImageUrl && !isInitialImageDeleted ? (
                // eslint-disable-next-line @next/next/no-img-element -- consistent rendering path with the cropped-photo case above
                <img src={initialProfileImageUrl} alt={`${displayName} profile`} className="size-full object-cover" />
              ) : (
                <span className="text-brand grid size-full place-items-center text-3xl font-bold">{initials}</span>
              )}
            </div>
            {isEditing && (
              <div className="flex flex-wrap items-center gap-2">
                <ProfileAvatarUploadDialog
                  onCropConfirmed={handleCropConfirmed}
                  triggerLabel={hasProfileImage ? "Change image" : "Add image"}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={!hasProfileImage || isDeletingImage}
                  onClick={() => void deleteProfileImage()}
                  className="h-8 rounded-lg px-3"
                >
                  {isDeletingImage ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                  {isDeletingImage ? "Removing…" : "Delete image"}
                </Button>
              </div>
            )}
          </div>

          <div className="min-w-0">{children}</div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
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

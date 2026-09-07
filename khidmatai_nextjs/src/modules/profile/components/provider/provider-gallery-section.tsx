"use client";

import { useEffect, useState } from "react";
import { Images } from "lucide-react";
import { toast } from "sonner";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileImageUploadTile } from "@/modules/profile/components/profile-image-upload-tile";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import { deleteProviderProfileMedia } from "@/modules/profile/services/provider-profile-media-api-service";

interface GalleryPhoto {
  id: string;
  url: string;
}

interface ProviderGallerySectionProps {
  initialMediaAssets: GalleryPhoto[];
  onCompletenessChange: (isComplete: boolean) => void;
}

export function ProviderGallerySection({ initialMediaAssets, onCompletenessChange }: ProviderGallerySectionProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [galleryPhotoList, setGalleryPhotoList] = useState<GalleryPhoto[]>(initialMediaAssets);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  useEffect(() => {
    onCompletenessChange(galleryPhotoList.length > 0);
  }, [galleryPhotoList, onCompletenessChange]);

  function addPhoto(imageUrl: string, _file: File, mediaAssetId?: string) {
    if (mediaAssetId) { setGalleryPhotoList((current) => [...current, { id: mediaAssetId, url: imageUrl }]); setFeedbackError(""); setFeedbackSuccess("Your work photo was uploaded successfully."); }
  }
  function finishManaging() {
    if (galleryPhotoList.length === 0) { setFeedbackSuccess(""); setFeedbackError("Add at least one work photo before finishing."); toast.error("Add at least one work photo before finishing."); return; }
    setIsManaging(false); setFeedbackError(""); setFeedbackSuccess("Your work gallery was saved successfully."); toast.success("Work gallery saved.");
  }
  async function removePhoto(photoId: string) {
    await deleteProviderProfileMedia(photoId);
    setGalleryPhotoList((current) => current.filter((photo) => photo.id !== photoId));
  }

  return (
    <ProfileSectionCard
      title="Work gallery"
      description="Real job photographs help customers judge workmanship before booking."
      IconComponent={Images}
      action={
        <ProfileSectionEditToggle
          isEditing={isManaging}
          editLabel="Manage gallery"
          doneLabel="Done"
          onBeginEditing={() => { setFeedbackError(""); setFeedbackSuccess(""); setIsManaging(true); }}
          onCancel={() => setIsManaging(false)}
          onSave={finishManaging}
        />
      }
    >
      <div className="mb-4">
        <p className={`text-xs font-semibold ${feedbackError && galleryPhotoList.length === 0 ? "text-red-600" : "text-ink/60"}`}>
          Work photos <span className="text-red-600">*</span>
        </p>
        <p className="text-ink/40 mt-1 text-[11px]">
          Add at least one JPG, PNG or WEBP photograph of completed work; maximum 8MB per image
        </p>
      </div>
      <ProfileOperationFeedback errorMessage={feedbackError} successMessage={feedbackSuccess} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {galleryPhotoList.map((photo) => (
          <ProfileImageUploadTile
            key={photo.id}
            imageUrl={photo.url}
            alt="Provider work sample"
            isRemovable={isManaging}
            mediaPurpose="work_gallery"
            onImageSelected={() => undefined}
            onRemove={() => removePhoto(photo.id)}
          />
        ))}
        {isManaging && <ProfileImageUploadTile alt="Add a work photo" label="Add photo" mediaPurpose="work_gallery" onImageSelected={addPhoto} />}
        {!isManaging && galleryPhotoList.length === 0 && (
          <p className="border-ink/15 text-ink/40 col-span-full rounded-2xl border border-dashed px-4 py-6 text-center text-sm">
            No photos added yet.
          </p>
        )}
      </div>
    </ProfileSectionCard>
  );
}

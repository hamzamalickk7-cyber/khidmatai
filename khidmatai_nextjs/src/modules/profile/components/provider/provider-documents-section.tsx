"use client";

import { useEffect, useState } from "react";
import { FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileImageUploadTile } from "@/modules/profile/components/profile-image-upload-tile";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import { deleteProviderProfileMedia } from "@/modules/profile/services/provider-profile-media-api-service";

interface Certification {
  id: string;
  url: string;
}

interface ProviderDocumentsSectionProps {
  initialMediaAssets: Array<{ id: string; mediaPurpose: string; documentSide: "front" | "back" | null; url: string }>;
  onCompletenessChange: (isComplete: boolean) => void;
}

export function ProviderDocumentsSection({ initialMediaAssets, onCompletenessChange }: ProviderDocumentsSectionProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [cnicFront, setCnicFront] = useState(initialMediaAssets.find((asset) => asset.mediaPurpose === "identity_document" && asset.documentSide === "front"));
  const [cnicBack, setCnicBack] = useState(initialMediaAssets.find((asset) => asset.mediaPurpose === "identity_document" && asset.documentSide === "back"));
  const [certificationList, setCertificationList] = useState<Certification[]>(initialMediaAssets.filter((asset) => asset.mediaPurpose === "professional_certificate").map(({ id, url }) => ({ id, url })));
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  useEffect(() => {
    onCompletenessChange(Boolean(cnicFront && cnicBack));
  }, [cnicFront, cnicBack, onCompletenessChange]);

  function finishManaging() {
    if (!cnicFront || !cnicBack) { setFeedbackSuccess(""); setFeedbackError("Upload both the front and back of your CNIC before saving documents."); toast.error("Both CNIC sides are required."); return; }
    setIsManaging(false); setFeedbackError(""); setFeedbackSuccess("Your verification documents were saved successfully."); toast.success("Verification documents saved.");
  }

  return (
    <ProfileSectionCard
      title="Verification documents"
      description="Reviewed by an administrator before your listing goes live. Never shown to customers."
      IconComponent={FileCheck2}
      action={
        <ProfileSectionEditToggle
          isEditing={isManaging}
          editLabel="Manage documents"
          doneLabel="Save documents"
          onBeginEditing={() => { setFeedbackError(""); setFeedbackSuccess(""); setIsManaging(true); }}
          onCancel={() => setIsManaging(false)}
          onSave={finishManaging}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className={`text-xs font-semibold ${feedbackError && !cnicFront ? "text-red-600" : "text-ink/60"}`}>
            CNIC — front <span className="text-red-600">*</span>
          </p>
          <ProfileImageUploadTile
            imageUrl={cnicFront?.url}
            alt="CNIC front side"
            label="Upload CNIC front"
            aspectClassName="aspect-[8/5]"
            isRemovable={isManaging || !cnicFront}
            mediaPurpose="identity_document"
            documentSide="front"
            onImageSelected={(url, _file, id) => { if (id) { setCnicFront({ id, url, mediaPurpose: "identity_document", documentSide: "front" }); setFeedbackError(""); setFeedbackSuccess("CNIC front uploaded successfully."); } }}
            onRemove={async () => { if (cnicFront) await deleteProviderProfileMedia(cnicFront.id); setCnicFront(undefined); }}
          />
          <p className="text-ink/40 text-[11px] leading-4">Upload a clear image of the front of your CNIC.</p>
        </div>
        <div className="space-y-1.5">
          <p className={`text-xs font-semibold ${feedbackError && !cnicBack ? "text-red-600" : "text-ink/60"}`}>
            CNIC — back <span className="text-red-600">*</span>
          </p>
          <ProfileImageUploadTile
            imageUrl={cnicBack?.url}
            alt="CNIC back side"
            label="Upload CNIC back"
            aspectClassName="aspect-[8/5]"
            isRemovable={isManaging || !cnicBack}
            mediaPurpose="identity_document"
            documentSide="back"
            onImageSelected={(url, _file, id) => { if (id) { setCnicBack({ id, url, mediaPurpose: "identity_document", documentSide: "back" }); setFeedbackError(""); setFeedbackSuccess("CNIC back uploaded successfully."); } }}
            onRemove={async () => { if (cnicBack) await deleteProviderProfileMedia(cnicBack.id); setCnicBack(undefined); }}
          />
          <p className="text-ink/40 text-[11px] leading-4">Upload a clear image of the back of your CNIC.</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-ink/60 mb-2 text-xs font-semibold">Additional documents</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {certificationList.map((certification) => (
            <ProfileImageUploadTile
              key={certification.id}
              imageUrl={certification.url}
              alt="Certification document"
              isRemovable={isManaging}
              mediaPurpose="professional_certificate"
              onImageSelected={() => undefined}
              onRemove={async () => { await deleteProviderProfileMedia(certification.id); setCertificationList((current) => current.filter((item) => item.id !== certification.id)); }}
            />
          ))}
          {isManaging && (
            <ProfileImageUploadTile
              alt="Add a certification"
              label="Add document"
              mediaPurpose="professional_certificate"
              onImageSelected={(imageUrl, _file, mediaAssetId) =>
                mediaAssetId && setCertificationList((current) => [...current, { id: mediaAssetId, url: imageUrl }])
              }
            />
          )}
          {!isManaging && certificationList.length === 0 && (
            <p className="border-ink/15 text-ink/40 col-span-full rounded-2xl border border-dashed px-4 py-4 text-center text-xs">
              No certifications added.
            </p>
          )}
        </div>
        <p className="text-ink/40 mt-2 text-[11px] leading-4">
          Optional certificates, licences, or trade qualifications that support your profile.
        </p>
      </div>
      <ProfileOperationFeedback errorMessage={feedbackError} successMessage={feedbackSuccess} />
    </ProfileSectionCard>
  );
}

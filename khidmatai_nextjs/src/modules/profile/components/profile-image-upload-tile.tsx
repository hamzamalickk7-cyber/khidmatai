"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { uploadProviderProfileMedia, type ProviderMediaPurpose } from "../services/provider-profile-media-api-service";

interface ProfileImageUploadTileProps {
  imageUrl?: string;
  alt: string;
  label?: string;
  isRemovable?: boolean;
  aspectClassName?: string;
  onImageSelected: (imageUrl: string, file: File, mediaAssetId?: string) => void;
  onRemove?: () => void | Promise<void>;
  mediaPurpose?: ProviderMediaPurpose;
  documentSide?: "front" | "back";
}

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;

export function ProfileImageUploadTile({
  imageUrl,
  alt,
  label = "Add photo",
  isRemovable = true,
  aspectClassName = "aspect-square",
  onImageSelected,
  onRemove,
  mediaPurpose,
  documentSide,
}: ProfileImageUploadTileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (!onRemove) return;
    try { setIsRemoving(true); await onRemove(); toast.success("Image removed."); }
    catch (error) { toast.error("Could not remove image", { description: error instanceof Error ? error.message : "Please try again." }); }
    finally { setIsRemoving(false); }
  }

  async function handleFileChange(fileList: FileList | null) {
    const selectedFile = fileList?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("That file isn't an image", { description: "Choose a JPG, PNG or WEBP file." });
      return;
    }
    if (selectedFile.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error("That image is too large", { description: "Choose a file under 8MB." });
      return;
    }
    if (!mediaPurpose) return onImageSelected(URL.createObjectURL(selectedFile), selectedFile);
    try { setIsUploading(true); const saved = await uploadProviderProfileMedia(selectedFile, mediaPurpose, documentSide); onImageSelected(saved.secureDeliveryUrl, selectedFile, saved.id); toast.success("Image uploaded securely."); }
    catch (error) { toast.error("Upload failed", { description: error instanceof Error ? error.message : "Try again." }); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  return (
    <div className={`group border-ink/10 bg-ink/[.02] relative overflow-hidden rounded-xl border ${aspectClassName}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(changeEvent) => handleFileChange(changeEvent.target.files)}
      />

      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL, not eligible for next/image's remote loader */}
          <img src={imageUrl} alt={alt} className="size-full object-cover" />
          {isRemovable && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/75 via-black/45 to-transparent px-3 pt-8 pb-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 rounded-lg"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isRemoving}
              >
                <Pencil className="size-3.5" />
                Change
              </Button>
              {onRemove && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 rounded-lg bg-white"
                  onClick={handleRemove}
                  disabled={isUploading || isRemoving}
                >
                  {isRemoving ? <Spinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                  {isRemoving ? "Removing…" : "Remove"}
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="hover:border-brand/40 hover:bg-brand-soft/40 focus-visible:ring-brand/30 border-ink/15 flex size-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition outline-none focus-visible:ring-3"
        >
          <span className="bg-brand-soft text-brand grid size-10 place-items-center rounded-xl">
            {isUploading ? <Spinner className="size-5" /> : <ImagePlus className="size-5" />}
          </span>
          <span className="text-ink/75 text-sm font-semibold">{isUploading ? "Uploading…" : label}</span>
          <span className="text-ink/40 text-[11px]">JPG, PNG or WEBP · Max 8MB</span>
        </button>
      )}
    </div>
  );
}

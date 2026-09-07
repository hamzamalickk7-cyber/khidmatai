"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Move, Pencil, Upload, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ProfileAvatarCropResult {
  objectUrl: string;
  file: File;
  zoom: number;
  offsetXPercent: number;
  offsetYPercent: number;
}

interface ProfileAvatarUploadDialogProps {
  onCropConfirmed: (crop: ProfileAvatarCropResult) => Promise<void>;
  triggerLabel: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const CROP_VIEWPORT_SIZE_PIXELS = 260;

export function ProfileAvatarUploadDialog({ onCropConfirmed, triggerLabel }: ProfileAvatarUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startOffsetXPercent: number;
    startOffsetYPercent: number;
  } | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingObjectUrl, setPendingObjectUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [offsetXPercent, setOffsetXPercent] = useState(50);
  const [offsetYPercent, setOffsetYPercent] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (pendingObjectUrl) URL.revokeObjectURL(pendingObjectUrl);
    };
  }, [pendingObjectUrl]);

  function handleSelectedFile(fileList: FileList | null) {
    const selectedFile = fileList?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      toast.error("That file isn't an image", { description: "Choose a JPG, PNG or WEBP file." });
      return;
    }
    if (selectedFile.size > 8 * 1024 * 1024) {
      toast.error("That image is too large", { description: "Choose a file under 8MB." });
      return;
    }

    setPendingObjectUrl(URL.createObjectURL(selectedFile));
    setPendingFile(selectedFile);
    setZoom(1.2);
    setOffsetXPercent(50);
    setOffsetYPercent(50);
    setIsDialogOpen(true);
  }

  function handleCropDragStart(pointerEvent: ReactPointerEvent<HTMLDivElement>) {
    pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    dragStateRef.current = {
      pointerId: pointerEvent.pointerId,
      startClientX: pointerEvent.clientX,
      startClientY: pointerEvent.clientY,
      startOffsetXPercent: offsetXPercent,
      startOffsetYPercent: offsetYPercent,
    };
  }

  function handleCropDragMove(pointerEvent: ReactPointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== pointerEvent.pointerId) return;

    const deltaXPercent = ((pointerEvent.clientX - dragState.startClientX) / CROP_VIEWPORT_SIZE_PIXELS) * 100;
    const deltaYPercent = ((pointerEvent.clientY - dragState.startClientY) / CROP_VIEWPORT_SIZE_PIXELS) * 100;

    setOffsetXPercent(clampPercentage(dragState.startOffsetXPercent - deltaXPercent));
    setOffsetYPercent(clampPercentage(dragState.startOffsetYPercent - deltaYPercent));
  }

  function handleCropDragEnd() {
    dragStateRef.current = null;
  }

  async function confirmCrop() {
    if (!pendingObjectUrl || !pendingFile) return;
    try {
      setIsSaving(true);
      await onCropConfirmed({ objectUrl: pendingObjectUrl, file: pendingFile, zoom, offsetXPercent, offsetYPercent });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Profile photo could not be saved", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(changeEvent) => handleSelectedFile(changeEvent.target.files)}
      />

      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        className="border-ink/10 hover:border-brand/30 hover:bg-brand-soft/50 hover:text-brand h-8 rounded-lg px-3"
      >
        <Pencil className="size-3.5" />
        {triggerLabel}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust your photo</DialogTitle>
            <DialogDescription>
              Drag to reposition and use the slider to preview how your saved profile photo will appear.
            </DialogDescription>
          </DialogHeader>

          {pendingObjectUrl && (
            <div className="mt-5 flex flex-col items-center">
              <div
                onPointerDown={handleCropDragStart}
                onPointerMove={handleCropDragMove}
                onPointerUp={handleCropDragEnd}
                onPointerCancel={handleCropDragEnd}
                style={{ width: CROP_VIEWPORT_SIZE_PIXELS, height: CROP_VIEWPORT_SIZE_PIXELS }}
                className="border-brand/40 bg-ink/5 relative [cursor:grab] touch-none overflow-hidden rounded-full border-2 border-dashed active:[cursor:grabbing]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- object URLs can't go through next/image's remote loader */}
                <img
                  src={pendingObjectUrl}
                  alt="Selected profile photo, drag to reposition"
                  draggable={false}
                  className="absolute top-1/2 left-1/2 h-full w-full max-w-none object-cover select-none"
                  style={{
                    transform: `translate(-50%, -50%) translate(${50 - offsetXPercent}%, ${50 - offsetYPercent}%) scale(${zoom})`,
                  }}
                />
              </div>
              <p className="text-ink/45 mt-3 flex items-center gap-1.5 text-xs">
                <Move className="size-3.5" />
                Drag the photo to reposition it
              </p>

              <div className="mt-4 flex w-full items-center gap-3">
                <ZoomIn className="text-ink/40 size-4 shrink-0" />
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.05}
                  value={zoom}
                  onChange={(changeEvent) => setZoom(Number(changeEvent.target.value))}
                  aria-label="Zoom"
                  className="bg-ink/10 accent-brand h-1.5 w-full cursor-pointer appearance-none rounded-full"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-lg" disabled={isSaving} onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-brand hover:bg-brand-deep gap-2 rounded-lg text-white"
              onClick={confirmCrop}
              disabled={isSaving}
            >
              <Upload className="size-4" />
              {isSaving ? "Uploading…" : "Use this photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function renderProfileAvatarCropStyle(crop: ProfileAvatarCropResult | null): React.CSSProperties | undefined {
  if (!crop) return undefined;
  return {
    transform: `translate(-50%, -50%) translate(${50 - crop.offsetXPercent}%, ${50 - crop.offsetYPercent}%) scale(${crop.zoom})`,
  };
}

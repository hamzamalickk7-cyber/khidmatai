"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Camera, Move, Upload, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ProfileAvatarCropResult {
  objectUrl: string;
  zoom: number;
  offsetXPercent: number;
  offsetYPercent: number;
}

interface ProfileAvatarUploadDialogProps {
  currentCrop: ProfileAvatarCropResult | null;
  onCropConfirmed: (crop: ProfileAvatarCropResult) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const CROP_VIEWPORT_SIZE_PIXELS = 260;

export function ProfileAvatarUploadDialog({ currentCrop, onCropConfirmed }: ProfileAvatarUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStateRef = useRef<{ pointerId: number; startClientX: number; startClientY: number; startOffsetXPercent: number; startOffsetYPercent: number } | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingObjectUrl, setPendingObjectUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [offsetXPercent, setOffsetXPercent] = useState(50);
  const [offsetYPercent, setOffsetYPercent] = useState(50);

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

  function confirmCrop() {
    if (!pendingObjectUrl) return;
    onCropConfirmed({ objectUrl: pendingObjectUrl, zoom, offsetXPercent, offsetYPercent });
    setIsDialogOpen(false);
    toast.success("Photo ready", { description: "This preview isn't saved anywhere yet — profile editing has no backend." });
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

      <button
        type="button"
        aria-label={currentCrop ? "Change profile photo" : "Upload profile photo"}
        onClick={() => fileInputRef.current?.click()}
        className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center gap-1.5 bg-ink/70 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Camera className="size-3.5" />
        {currentCrop ? "Change" : "Upload"}
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust your photo</DialogTitle>
            <DialogDescription>Drag to reposition and use the slider to zoom. Nothing is uploaded — this is a design preview only.</DialogDescription>
          </DialogHeader>

          {pendingObjectUrl && (
            <div className="mt-5 flex flex-col items-center">
              <div
                onPointerDown={handleCropDragStart}
                onPointerMove={handleCropDragMove}
                onPointerUp={handleCropDragEnd}
                onPointerCancel={handleCropDragEnd}
                style={{ width: CROP_VIEWPORT_SIZE_PIXELS, height: CROP_VIEWPORT_SIZE_PIXELS }}
                className="relative touch-none overflow-hidden rounded-full border-2 border-dashed border-brand/40 bg-ink/5 [cursor:grab] active:[cursor:grabbing]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- object URLs can't go through next/image's remote loader */}
                <img
                  src={pendingObjectUrl}
                  alt="Selected profile photo, drag to reposition"
                  draggable={false}
                  className="absolute left-1/2 top-1/2 h-full w-full max-w-none select-none object-cover"
                  style={{ transform: `translate(-50%, -50%) translate(${50 - offsetXPercent}%, ${50 - offsetYPercent}%) scale(${zoom})` }}
                />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/45">
                <Move className="size-3.5" />
                Drag the photo to reposition it
              </p>

              <div className="mt-4 flex w-full items-center gap-3">
                <ZoomIn className="size-4 shrink-0 text-ink/40" />
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.05}
                  value={zoom}
                  onChange={(changeEvent) => setZoom(Number(changeEvent.target.value))}
                  aria-label="Zoom"
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-brand"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="gap-2 rounded-full" onClick={confirmCrop}>
              <Upload className="size-4" />
              Use this photo
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

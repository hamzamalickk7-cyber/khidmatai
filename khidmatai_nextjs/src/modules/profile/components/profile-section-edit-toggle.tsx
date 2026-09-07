"use client";

import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ProfileSectionEditToggleProps {
  isEditing: boolean;
  editLabel?: string;
  doneLabel?: string;
  onBeginEditing: () => void;
  onCancel: () => void;
  /** Omit when the section is a <form> — Save then submits the form instead. */
  onSave?: () => void;
  /** Associates a header action with a form rendered elsewhere in the card. */
  formId?: string;
  isSaving?: boolean;
}

export function ProfileSectionEditToggle({
  isEditing,
  editLabel = "Edit",
  doneLabel = "Save",
  onBeginEditing,
  onCancel,
  onSave,
  formId,
  isSaving,
}: ProfileSectionEditToggleProps) {
  if (!isEditing) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-brand/20 bg-brand-soft/60 text-brand hover:border-brand/35 hover:bg-brand-soft hover:text-brand-deep h-9 gap-1.5 rounded-lg px-3.5 font-semibold"
        onClick={onBeginEditing}
      >
        <Pencil className="size-3.5" />
        {editLabel}
      </Button>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 rounded-lg px-3.5 font-semibold"
        onClick={onCancel}
      >
        <X className="size-3.5" />
        Cancel
      </Button>
      <Button
        type={onSave ? "button" : "submit"}
        form={onSave ? undefined : formId}
        size="sm"
        className="bg-brand hover:bg-brand-deep h-9 gap-1.5 rounded-lg px-3.5 font-semibold text-white"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? <Spinner className="size-3.5" /> : <Check className="size-3.5" />}
        {isSaving ? "Saving…" : doneLabel}
      </Button>
    </div>
  );
}

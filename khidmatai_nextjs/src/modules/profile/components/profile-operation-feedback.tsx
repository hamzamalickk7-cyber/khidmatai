"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface ProfileFeedbackState { errorMessage?: string; successMessage?: string; }

export function ProfileOperationFeedback({ errorMessage, successMessage }: ProfileFeedbackState) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent<ProfileFeedbackState>("khidmatai:profile-feedback", { detail: { errorMessage, successMessage } }));
  }, [errorMessage, successMessage]);
  return null;
}

export function ProfileFeedbackBanner({ errorMessage, successMessage }: ProfileFeedbackState) {
  if (errorMessage) return <div role="alert" className="flex select-text items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{errorMessage}</span></div>;
  if (successMessage) return <div role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /><span>{successMessage}</span></div>;
  return null;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { submitProviderOnboardingReviewAction } from "@/modules/administration/services/administration-api-service";
import { getAvailableProviderReviewActions, type ProviderReviewActionDefinition } from "@/modules/administration/constants/provider-review-action-catalog";
import type { ProviderAdministrationListItem } from "@/modules/administration/types/provider-administration-types";

interface PendingProviderReviewAction {
  providerProfile: ProviderAdministrationListItem;
  actionDefinition: ProviderReviewActionDefinition;
}

export function ProviderOnboardingReviewTable({ providerOnboardingProfiles, isReadOnly }: { providerOnboardingProfiles: ProviderAdministrationListItem[]; isReadOnly: boolean }) {
  const applicationRouter = useRouter();
  const [pendingProviderReviewAction, setPendingProviderReviewAction] = useState<PendingProviderReviewAction | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [reviewReasonError, setReviewReasonError] = useState("");
  const [isSubmittingReviewAction, setIsSubmittingReviewAction] = useState(false);

  function openProviderReviewActionDialog(providerProfile: ProviderAdministrationListItem, actionDefinition: ProviderReviewActionDefinition) {
    setReviewReason("");
    setReviewReasonError("");
    setPendingProviderReviewAction({ providerProfile, actionDefinition });
  }

  async function confirmPendingProviderReviewAction() {
    if (!pendingProviderReviewAction) return;
    const trimmedReviewReason = reviewReason.trim();
    if (trimmedReviewReason.length < 5) {
      setReviewReasonError("Enter at least 5 characters explaining this decision.");
      return;
    }

    setIsSubmittingReviewAction(true);
    try {
      await submitProviderOnboardingReviewAction({
        providerProfileId: pendingProviderReviewAction.providerProfile.id,
        action: pendingProviderReviewAction.actionDefinition.action,
        reason: trimmedReviewReason,
        expectedVersion: pendingProviderReviewAction.providerProfile.version,
      });
      toast.success(`${pendingProviderReviewAction.actionDefinition.label} applied`, { description: pendingProviderReviewAction.providerProfile.name });
      setPendingProviderReviewAction(null);
      applicationRouter.refresh();
    } catch (requestError) {
      toast.error("Unable to apply this decision", { description: requestError instanceof Error ? requestError.message : undefined });
    } finally {
      setIsSubmittingReviewAction(false);
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-ink/8 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-brand-soft/50 text-xs uppercase tracking-wider text-ink/45">
            <tr>
              {["Provider", "Status", "City", "Experience", "Email", "Actions"].map((columnLabel) => (
                <th key={columnLabel} className="px-4 py-3">{columnLabel}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {providerOnboardingProfiles.map((providerProfile) => {
              const availableActions = getAvailableProviderReviewActions(providerProfile.status);
              return (
                <tr key={providerProfile.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold">{providerProfile.name}</p>
                    <p className="text-xs text-ink/45">{providerProfile.email}</p>
                  </td>
                  <td className="px-4 capitalize">{providerProfile.status.replaceAll("_", " ")}</td>
                  <td className="px-4">{providerProfile.city ?? "Not provided"}</td>
                  <td className="px-4">{providerProfile.yearsOfExperience ?? "Not provided"}</td>
                  <td className="px-4">{providerProfile.emailVerified ? "Verified" : "Pending"}</td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-2">
                      {!isReadOnly && availableActions.length === 0 && <span className="text-xs text-ink/40">No actions available</span>}
                      {!isReadOnly && availableActions.map((actionDefinition) => (
                        <Button
                          key={actionDefinition.action}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openProviderReviewActionDialog(providerProfile, actionDefinition)}
                        >
                          {actionDefinition.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {providerOnboardingProfiles.length === 0 && <p className="p-8 text-center text-ink/50">No providers found.</p>}
      </div>

      {pendingProviderReviewAction && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="presentation">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="provider-review-dialog-title"
            aria-describedby="provider-review-dialog-description"
            className="w-full max-w-lg rounded-2xl border border-ink/10 bg-white p-6 shadow-2xl"
          >
            <h2 id="provider-review-dialog-title" className="text-xl font-semibold">
              {pendingProviderReviewAction.actionDefinition.label} {pendingProviderReviewAction.providerProfile.name}?
            </h2>
            <p id="provider-review-dialog-description" className="mt-2 text-sm leading-6 text-ink/55">
              This creates a permanent review decision and audit record. It cannot be undone from this screen.
            </p>

          <Field className="mt-5" data-invalid={Boolean(reviewReasonError)}>
            <FieldLabel htmlFor="provider-review-reason">Reason</FieldLabel>
            <Textarea
              id="provider-review-reason"
              value={reviewReason}
              onChange={(changeEvent) => { setReviewReason(changeEvent.target.value); if (reviewReasonError) setReviewReasonError(""); }}
              aria-invalid={Boolean(reviewReasonError)}
              aria-describedby={reviewReasonError ? "provider-review-reason-error" : undefined}
              placeholder="Explain this decision for the audit record."
              autoFocus
            />
            {reviewReasonError && <FieldError id="provider-review-reason-error">{reviewReasonError}</FieldError>}
          </Field>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={isSubmittingReviewAction} onClick={() => setPendingProviderReviewAction(null)}>Cancel</Button>
            <Button type="button" onClick={confirmPendingProviderReviewAction} disabled={isSubmittingReviewAction}>
              {isSubmittingReviewAction && <Loader2Icon className="size-4 animate-spin" />}
              Confirm
            </Button>
          </div>
          </div>
        </div>
      )}
    </>
  );
}

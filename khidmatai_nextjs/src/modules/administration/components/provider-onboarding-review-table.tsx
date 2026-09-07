"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { submitProviderOnboardingReviewAction } from "@/modules/administration/services/administration-api-service";
import { KhidmatAiBackendApiError } from "@/services/khidmatai-backend-api-client";
import {
  getAvailableProviderReviewActions,
  type ProviderReviewActionDefinition,
} from "@/modules/administration/constants/provider-review-action-catalog";
import type { ProviderAdministrationListItem } from "@/modules/administration/types/provider-administration-types";

interface PendingProviderReviewAction {
  providerProfile: ProviderAdministrationListItem;
  actionDefinition: ProviderReviewActionDefinition;
}

const providerChangeSectionOptions = [
  ["identity", "Identity and CNIC"],
  ["contact", "Contact information"],
  ["address", "Address and service location"],
  ["services", "Services and coverage areas"],
  ["experience", "Experience and professional title"],
  ["biography", "Professional biography"],
  ["availability", "Availability"],
  ["references", "Professional references"],
] as const;

const reviewActionsRequiringReason = new Set(["request_changes", "reject", "suspend", "remove"]);

export function ProviderOnboardingReviewTable({
  providerOnboardingProfiles,
  isReadOnly,
}: {
  providerOnboardingProfiles: ProviderAdministrationListItem[];
  isReadOnly: boolean;
}) {
  const applicationRouter = useRouter();
  const [pendingProviderReviewAction, setPendingProviderReviewAction] = useState<PendingProviderReviewAction | null>(
    null,
  );
  const [reviewReason, setReviewReason] = useState("");
  const [reviewReasonError, setReviewReasonError] = useState("");
  const [requestedChangeKeys, setRequestedChangeKeys] = useState<string[]>([]);
  const [requestedChangeKeysError, setRequestedChangeKeysError] = useState("");
  const [isSubmittingReviewAction, setIsSubmittingReviewAction] = useState(false);

  function openProviderReviewActionDialog(
    providerProfile: ProviderAdministrationListItem,
    actionDefinition: ProviderReviewActionDefinition,
  ) {
    setReviewReason("");
    setReviewReasonError("");
    setRequestedChangeKeys([]);
    setRequestedChangeKeysError("");
    setPendingProviderReviewAction({ providerProfile, actionDefinition });
  }

  async function confirmPendingProviderReviewAction() {
    if (!pendingProviderReviewAction) return;
    const trimmedReviewReason = reviewReason.trim();
    const action = pendingProviderReviewAction.actionDefinition.action;
    if (action === "request_changes" && requestedChangeKeys.length === 0) {
      setRequestedChangeKeysError("Select at least one section that the provider must update.");
      return;
    }
    if (reviewActionsRequiringReason.has(action) && trimmedReviewReason.length < 10) {
      setReviewReasonError("Enter at least 10 characters explaining this decision.");
      return;
    }

    setIsSubmittingReviewAction(true);
    try {
      await submitProviderOnboardingReviewAction({
        providerProfileId: pendingProviderReviewAction.providerProfile.id,
        action: pendingProviderReviewAction.actionDefinition.action,
        ...(reviewActionsRequiringReason.has(action) ? { reason: trimmedReviewReason } : {}),
        ...(action === "request_changes" ? { requestedChangeKeys } : {}),
        expectedVersion: pendingProviderReviewAction.providerProfile.version,
      });
      toast.success(`${pendingProviderReviewAction.actionDefinition.label} applied`, {
        description: pendingProviderReviewAction.providerProfile.name,
      });
      setPendingProviderReviewAction(null);
      applicationRouter.refresh();
    } catch (requestError) {
      const validationErrors = getReviewActionValidationErrors(requestError);
      if (validationErrors.requestedChangeKeys) {
        setRequestedChangeKeysError(validationErrors.requestedChangeKeys);
      }
      if (validationErrors.reason) {
        setReviewReasonError(validationErrors.reason);
      }
      toast.error("Unable to apply this decision", {
        description:
          validationErrors.firstMessage ?? (requestError instanceof Error ? requestError.message : undefined),
      });
    } finally {
      setIsSubmittingReviewAction(false);
    }
  }

  return (
    <>
      <div className="border-ink/8 overflow-x-auto rounded-3xl border bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-brand-soft/50 text-ink/45 text-xs tracking-wider uppercase">
            <tr>
              {["Provider", "Status", "City", "Experience", "Email", "Actions"].map((columnLabel) => (
                <th key={columnLabel} className="px-4 py-3">
                  {columnLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-ink/8 divide-y">
            {providerOnboardingProfiles.map((providerProfile) => {
              const availableActions = getAvailableProviderReviewActions(providerProfile.status);
              return (
                <tr key={providerProfile.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold">{providerProfile.name}</p>
                    <p className="text-ink/45 text-xs">{providerProfile.email}</p>
                    <Link
                      href={`/admin/providers/${providerProfile.id}`}
                      className="text-primary mt-1 inline-block text-xs font-medium hover:underline"
                    >
                      View provider profile
                    </Link>
                  </td>
                  <td className="px-4 capitalize">{providerProfile.status.replaceAll("_", " ")}</td>
                  <td className="px-4">{providerProfile.city ?? "Not provided"}</td>
                  <td className="px-4">{providerProfile.yearsOfExperience ?? "Not provided"}</td>
                  <td className="px-4">{providerProfile.emailVerified ? "Verified" : "Pending"}</td>
                  <td className="px-4">
                    <div className="flex flex-wrap gap-2">
                      {!isReadOnly && availableActions.length === 0 && (
                        <span className="text-ink/40 text-xs">No actions available</span>
                      )}
                      {!isReadOnly &&
                        availableActions.map((actionDefinition) => (
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
        {providerOnboardingProfiles.length === 0 && <p className="text-ink/50 p-8 text-center">No providers found.</p>}
      </div>

      <Dialog
        open={Boolean(pendingProviderReviewAction)}
        onOpenChange={(open) => {
          if (!open && !isSubmittingReviewAction) setPendingProviderReviewAction(null);
        }}
      >
        {pendingProviderReviewAction && (
          <DialogContent className="max-h-[calc(100dvh-1.5rem)] max-w-lg overflow-y-auto overscroll-contain sm:max-h-[90dvh]">
            <DialogHeader>
              <DialogTitle>
                {pendingProviderReviewAction.actionDefinition.label} {pendingProviderReviewAction.providerProfile.name}?
              </DialogTitle>
              <DialogDescription>
                {pendingProviderReviewAction.actionDefinition.action === "request_changes"
                  ? "Clearly list what the provider must correct. This message will be shown directly on their profile page."
                  : "This creates a permanent review decision and audit record. It cannot be undone from this screen."}
              </DialogDescription>
            </DialogHeader>

            {pendingProviderReviewAction.actionDefinition.action === "request_changes" && (
              <Field className="mt-5" data-invalid={Boolean(requestedChangeKeysError)}>
                <FieldLabel>Which sections need changes?</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {providerChangeSectionOptions.map(([changeKey, label]) => (
                    <label
                      key={changeKey}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                    >
                      <Checkbox
                        checked={requestedChangeKeys.includes(changeKey)}
                        onCheckedChange={(isChecked) => {
                          setRequestedChangeKeys((currentKeys) =>
                            isChecked === true
                              ? [...currentKeys, changeKey]
                              : currentKeys.filter((currentKey) => currentKey !== changeKey),
                          );
                          setRequestedChangeKeysError("");
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {requestedChangeKeysError && <FieldError>{requestedChangeKeysError}</FieldError>}
              </Field>
            )}

            {reviewActionsRequiringReason.has(pendingProviderReviewAction.actionDefinition.action) && (
              <Field className="mt-5" data-invalid={Boolean(reviewReasonError)}>
                <FieldLabel htmlFor="provider-review-reason">
                  {pendingProviderReviewAction.actionDefinition.action === "request_changes"
                    ? "Required changes"
                    : "Reason"}
                </FieldLabel>
                <Textarea
                  id="provider-review-reason"
                  value={reviewReason}
                  onChange={(changeEvent) => {
                    setReviewReason(changeEvent.target.value);
                    if (reviewReasonError) setReviewReasonError("");
                  }}
                  aria-invalid={Boolean(reviewReasonError)}
                  aria-describedby={reviewReasonError ? "provider-review-reason-error" : undefined}
                  placeholder={
                    pendingProviderReviewAction.actionDefinition.action === "request_changes"
                      ? "Example:\n• Correct the CNIC number\n• Add your complete service address\n• Explain your electrical work experience in more detail"
                      : "Explain this decision for the audit record."
                  }
                  autoFocus
                />
                {reviewReasonError && <FieldError id="provider-review-reason-error">{reviewReasonError}</FieldError>}
              </Field>
            )}

            <DialogFooter className="sticky -bottom-6 z-10 -mx-6 -mb-6 border-t border-ink/8 bg-white px-6 py-4 sm:-bottom-7 sm:-mx-7 sm:-mb-7 sm:px-7">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmittingReviewAction}
                onClick={() => setPendingProviderReviewAction(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={confirmPendingProviderReviewAction} disabled={isSubmittingReviewAction}>
                {isSubmittingReviewAction && <Loader2Icon className="size-4 animate-spin" />}
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

function getReviewActionValidationErrors(requestError: unknown) {
  if (!(requestError instanceof KhidmatAiBackendApiError) || requestError.errorCode !== "REQUEST_VALIDATION_FAILED") {
    return {};
  }

  const details = requestError.details as
    { fieldErrors?: Record<string, string[] | undefined>; formErrors?: string[] } | undefined;
  const requestedChangeKeys = details?.fieldErrors?.requestedChangeKeys?.[0];
  const reason = details?.fieldErrors?.reason?.[0];
  const firstMessage = requestedChangeKeys ?? reason ?? details?.formErrors?.[0];
  return { requestedChangeKeys, reason, firstMessage };
}

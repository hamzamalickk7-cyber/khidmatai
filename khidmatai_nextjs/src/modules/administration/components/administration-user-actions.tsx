"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Spinner } from "@/components/ui/spinner";
import { submitAdministrationUserAction } from "../services/administration-api-service";
import type { AdministrationUserDetail } from "../types/administration-workspace-types";

const actionSchema = z
  .object({
    reason: z.string().trim().max(1000).optional(),
    role: z.enum(["customer", "provider"]).optional(),
  })
  .strict();
type ActionValues = z.infer<typeof actionSchema>;
type PendingAction = { type: "role" | "ban" | "status"; action: string; title: string };

export function AdministrationUserActions({
  user,
  isReadOnly,
}: {
  user: AdministrationUserDetail;
  isReadOnly: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const form = useForm<ActionValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: { reason: "", role: undefined },
  });
  const selectedRole = useWatch({ control: form.control, name: "role" });
  function open(action: PendingAction) {
    form.reset({
      reason: "",
      role: action.type === "role" && ["customer", "provider"].includes(user.role)
        ? (user.role as ActionValues["role"])
        : undefined,
    });
    setPending(action);
  }
  async function submit(values: ActionValues) {
    if (!pending) return;
    if (pending.type === "role" && !values.role) {
      form.setError("role", { message: "Select either Customer or Provider." });
      return;
    }
    const actionRequiresReason = pending.type === "role" || pending.action === "ban" || pending.action === "deactivate";
    if (actionRequiresReason && (values.reason?.length ?? 0) < 10) {
      form.setError("reason", { message: "Explain this action in at least 10 characters." });
      return;
    }
    const body =
      pending.type === "role"
        ? { role: values.role, reason: values.reason }
        : { action: pending.action, ...(actionRequiresReason ? { reason: values.reason } : {}) };
    try {
      await submitAdministrationUserAction(user.id, pending.type, body);
      toast.success("Account updated");
      setPending(null);
      router.refresh();
    } catch (error) {
      toast.error("Action failed", { description: error instanceof Error ? error.message : "Try again." });
    }
  }
  if (isReadOnly)
    return (
      <p className="rounded-2xl bg-ink/[.035] p-4 text-sm text-ink/50">
        Support access is read-only. An administrator must perform account actions.
      </p>
    );
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => open({ type: "role", action: "role", title: "Change account role" })}>
          Change role
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            open({
              type: "ban",
              action: user.banned ? "unban" : "ban",
              title: user.banned ? "Unban account" : "Ban account",
            })
          }
        >
          {user.banned ? "Unban" : "Ban"}
        </Button>
        <Button
          variant={user.deactivatedAt ? "outline" : "destructive"}
          onClick={() =>
            open({
              type: "status",
              action: user.deactivatedAt ? "reactivate" : "deactivate",
              title: user.deactivatedAt ? "Reactivate account" : "Deactivate account",
            })
          }
        >
          {user.deactivatedAt ? "Reactivate" : "Deactivate"}
        </Button>
      </div>
      <Dialog open={Boolean(pending)} onOpenChange={(openState) => !openState && setPending(null)}>
        {pending && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{pending.title}</DialogTitle>
              <DialogDescription>
                This security-sensitive action is validated by the server and recorded permanently in the audit log.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(submit)} className="mt-5 space-y-4">
              {pending.type === "role" && (
                <Field data-invalid={Boolean(form.formState.errors.role)}>
                  <FieldLabel>New role</FieldLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      nativeButton={false}
                      render={
                        <Button type="button" variant="outline" className="h-10 w-full justify-between px-3" />
                      }
                    >
                      <span className={selectedRole ? "capitalize" : "text-muted-foreground"}>
                        {selectedRole ?? "Select an account role"}
                      </span>
                      <ChevronDown className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[var(--anchor-width)]">
                      {(["customer", "provider"] as const).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => form.setValue("role", role, { shouldDirty: true, shouldValidate: true })}
                          className="justify-between capitalize"
                        >
                          {role}
                          {selectedRole === role && <Check className="size-4 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {form.formState.errors.role && <FieldError>{form.formState.errors.role.message}</FieldError>}
                </Field>
              )}
              {(pending.type === "role" || pending.action === "ban" || pending.action === "deactivate") && (
                <Field data-invalid={Boolean(form.formState.errors.reason)}>
                  <FieldLabel htmlFor="admin-action-reason">Why is this action necessary?</FieldLabel>
                  <Textarea
                    id="admin-action-reason"
                    {...form.register("reason")}
                    placeholder="Give a clear reason for this security-sensitive action."
                    autoFocus
                  />
                  {form.formState.errors.reason && <FieldError>{form.formState.errors.reason.message}</FieldError>}
                </Field>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" disabled={form.formState.isSubmitting} onClick={() => setPending(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Spinner />}
                  {form.formState.isSubmitting ? "Applying action…" : "Confirm action"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

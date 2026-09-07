"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Plus, Star, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ProfileOperationFeedback } from "@/modules/profile/components/profile-operation-feedback";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import { createAuthenticatedCustomerSavedAddress, deleteAuthenticatedCustomerSavedAddress, updateAuthenticatedCustomerSavedAddress } from "@/modules/profile/services/customer-profile-api-service";
import { toast } from "sonner";

interface SavedAddress {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
}

interface CustomerAddressesSectionProps {
  initialAddressList: SavedAddress[];
  onAddressCountChange: (count: number) => void;
}

const addressSchema = z.object({
  label: z.string().trim().min(2, "Use at least 2 characters.").max(50, "Use no more than 50 characters."),
  addressLine: z.string().trim().min(5, "Enter the house, street and area.").max(200, "Use no more than 200 characters."),
  city: z.string().trim().min(2, "Enter a valid city.").max(100, "Use no more than 100 characters."),
});
type AddressValues = z.infer<typeof addressSchema>;
const emptyAddressDraft: AddressValues = { label: "", addressLine: "", city: "" };

export function CustomerAddressesSection({ initialAddressList, onAddressCountChange }: CustomerAddressesSectionProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [addressList, setAddressList] = useState(initialAddressList);
  const [pendingAddressActionId, setPendingAddressActionId] = useState<string>();
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const form = useForm<AddressValues>({ resolver: zodResolver(addressSchema), defaultValues: emptyAddressDraft });

  useEffect(() => {
    onAddressCountChange(addressList.length);
  }, [addressList, onAddressCountChange]);

  async function removeAddress(addressId: string) {
    setPendingAddressActionId(addressId);
    try { await deleteAuthenticatedCustomerSavedAddress(addressId); setAddressList((current) => current.filter((address) => address.id !== addressId)); setSuccessMessage("The address was removed successfully."); setSubmissionError(""); toast.success("Address removed."); }
    catch (error) { const message = error instanceof Error ? error.message : "Try again."; setSubmissionError(message); toast.error("Could not remove address", { description: message }); }
    finally { setPendingAddressActionId(undefined); }
  }
  async function makeDefault(addressId: string) {
    const address = addressList.find((item) => item.id === addressId); if (!address) return;
    setPendingAddressActionId(addressId);
    try { await updateAuthenticatedCustomerSavedAddress(addressId, { label: address.label, addressLine: address.addressLine, city: address.city, isDefault: true }); setAddressList((current) => current.map((item) => ({ ...item, isDefault: item.id === addressId }))); setSuccessMessage("Your default address was updated successfully."); setSubmissionError(""); toast.success("Default address updated."); }
    catch (error) { const message = error instanceof Error ? error.message : "Try again."; setSubmissionError(message); toast.error("Could not update address", { description: message }); }
    finally { setPendingAddressActionId(undefined); }
  }
  async function addAddress(values: AddressValues) {
    try { const saved = await createAuthenticatedCustomerSavedAddress({ ...values, isDefault: addressList.length === 0 }); setAddressList((current) => [...current, saved]); form.reset(emptyAddressDraft); setSuccessMessage("Your new address was added successfully."); setSubmissionError(""); toast.success("Address added."); }
    catch (error) { const message = error instanceof Error ? error.message : "Try again."; setSubmissionError(message); toast.error("Could not add address", { description: message }); }
  }
  function finishManaging() { if (addressList.length === 0) { setSubmissionError("Add at least one address before finishing."); toast.error("Add at least one address before finishing."); return; } setIsManaging(false); setSuccessMessage("Your saved addresses are ready to use."); toast.success("Addresses saved."); }

  return (
    <ProfileSectionCard
      title="Saved addresses"
      description="Choose a service location faster when creating a booking."
      IconComponent={Home}
      action={
        <ProfileSectionEditToggle
          isEditing={isManaging}
          editLabel="Manage addresses"
          doneLabel="Done"
          onBeginEditing={() => { setSuccessMessage(""); setSubmissionError(""); setIsManaging(true); }}
          onCancel={() => setIsManaging(false)}
          onSave={finishManaging}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {addressList.map((address) => (
          <div key={address.id} className="bg-ink/[.035] rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <strong className="text-sm">{address.label}</strong>
                {address.isDefault && (
                  <span className="bg-brand-soft text-brand flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                    <Star className="size-2.5 fill-current" />
                    Default
                  </span>
                )}
              </div>
              {isManaging && (
                <button
                  type="button"
                  onClick={() => removeAddress(address.id)} disabled={Boolean(pendingAddressActionId)}
                  aria-label={`Remove ${address.label}`}
                  className="text-ink/35 grid size-6 shrink-0 place-items-center rounded-full hover:bg-red-50 hover:text-red-600"
                >
                  {pendingAddressActionId === address.id ? <Spinner className="size-3.5" /> : <X className="size-3.5" />}
                </button>
              )}
            </div>
            <p className="text-ink/60 mt-2 text-sm">
              {address.addressLine}, {address.city}
            </p>
            {isManaging && !address.isDefault && (
              <button
                type="button"
                onClick={() => makeDefault(address.id)} disabled={Boolean(pendingAddressActionId)}
                className="text-brand mt-2 text-xs font-semibold hover:underline"
              >
                Make default
              </button>
            )}
          </div>
        ))}
        {addressList.length === 0 && <p className="text-ink/45 text-sm sm:col-span-2">No saved addresses yet.</p>}
      </div>

      {isManaging && (
        <form onSubmit={form.handleSubmit(addAddress, () => { setSubmissionError("Review the highlighted address fields."); toast.error("Review the highlighted address fields."); })} className="border-ink/15 mt-4 rounded-2xl border border-dashed p-4">
          <p className="text-sm font-semibold">Add an address</p>
          <p className="text-ink/40 mt-1 text-[11px]">All three fields are required when adding a new address.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <AddressField label="Address name" hint="A short name such as Home or Office" error={form.formState.errors.label?.message}>
              <Input {...form.register("label")} aria-invalid={Boolean(form.formState.errors.label)}
                placeholder="e.g. Home"
              />
            </AddressField>
            <AddressField label="Street and area" hint="House, street, sector or neighborhood" error={form.formState.errors.addressLine?.message}>
              <Input {...form.register("addressLine")} aria-invalid={Boolean(form.formState.errors.addressLine)}
                placeholder="e.g. Street 24, F-8/2"
              />
            </AddressField>
            <AddressField label="City" hint="The city where service is needed" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} aria-invalid={Boolean(form.formState.errors.city)}
                placeholder="e.g. Islamabad"
              />
            </AddressField>
          </div>
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting} className="mt-3">
            {form.formState.isSubmitting ? <Spinner className="size-3.5" /> : <Plus className="size-3.5" />}{form.formState.isSubmitting ? "Adding…" : "Add address"}
          </Button>
        </form>
      )}
      <ProfileOperationFeedback errorMessage={submissionError} successMessage={successMessage} />
    </ProfileSectionCard>
  );
}

function AddressField({ label, hint, error, children }: { label: string; hint: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className={`block text-xs font-semibold ${error ? "text-red-600" : "text-ink/60"}`}>
        {label} <span className="text-red-600">*</span>
      </span>
      {children}
      <span className={`block text-[11px] leading-4 ${error ? "text-red-600" : "text-ink/40"}`}>{error ?? hint}</span>
    </label>
  );
}

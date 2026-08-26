"use client";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Home, Mail, MapPin, MessageCircle, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useApplicationDispatch, useApplicationSelector } from "@/application/redux-typed-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ProfileCompletenessCard } from "../components/profile-completeness-card";
import { ProfileDetailFieldRow } from "../components/profile-detail-field-row";
import { ProfileHeaderBanner } from "../components/profile-header-banner";
import { ProfileSectionCard } from "../components/profile-section-card";
import { useCustomerProfileQuery, useUpdateCustomerProfileMutation } from "../hooks/use-customer-profile-query";
import { beginProfileEditing, finishProfileEditing } from "../state/profile-editing-slice";
import {
  customerProfileFormValidationSchema,
  type CustomerProfileFormValues,
} from "../validations/customer-profile-form-validation-schema";

interface CustomerProfileViewProps {
  customerName: string;
  customerEmail: string;
}
const contactOptions = [
  { value: "phone", label: "Phone call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
] as const;
const serviceOptions = ["plumbing", "electrical", "appliance-repair", "home-cleaning"];

export function CustomerProfileView({ customerName, customerEmail }: CustomerProfileViewProps) {
  const dispatch = useApplicationDispatch();
  const isEditing = useApplicationSelector((state) => state.profileEditing.isEditing);
  const profileQuery = useCustomerProfileQuery();
  const updateMutation = useUpdateCustomerProfileMutation();
  const profile = profileQuery.data;
  const form = useForm<CustomerProfileFormValues>({
    resolver: zodResolver(customerProfileFormValidationSchema),
    defaultValues: {
      fullName: customerName,
      phoneNumber: "",
      city: "",
      preferredContactMethod: "whatsapp",
      servicePreferenceKeys: [],
      expectedVersion: 1,
    },
  });
  const selectedContactMethod = useWatch({ control: form.control, name: "preferredContactMethod" });
  const selectedServicePreferenceKeys = useWatch({ control: form.control, name: "servicePreferenceKeys" });
  useEffect(() => {
    if (profile) form.reset(toFormValues(profile));
  }, [profile, form]);

  const current = profile ?? {
    id: "",
    fullName: customerName,
    emailAddress: customerEmail,
    phoneNumber: null,
    city: null,
    preferredContactMethod: "whatsapp" as const,
    servicePreferenceKeys: [],
    savedAddresses: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  function cancelEditing() {
    if (profile) form.reset(toFormValues(profile));
    dispatch(finishProfileEditing());
  }
  async function saveProfile(values: CustomerProfileFormValues) {
    try {
      await updateMutation.mutateAsync(values);
      dispatch(finishProfileEditing());
      toast.success("Profile saved");
    } catch (error) {
      toast.error("Profile could not be saved", { description: error instanceof Error ? error.message : "Try again." });
    }
  }
  const checklist = [
    { label: "Account details", isComplete: Boolean(current.fullName && current.emailAddress) },
    { label: "Phone number", isComplete: Boolean(current.phoneNumber) },
    { label: "Default address", isComplete: current.savedAddresses.some((address) => address.isDefault) },
    { label: "City", isComplete: Boolean(current.city) },
  ];
  if (profileQuery.isLoading)
    return (
      <main className="bg-muted/30 flex flex-1 items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-3 text-sm">
          <Spinner /> Loading your profile…
        </div>
      </main>
    );

  return (
    <main className="bg-muted/30 flex-1 px-5 py-8 sm:px-8 sm:py-10">
      <form onSubmit={form.handleSubmit(saveProfile)} className="mx-auto max-w-6xl">
        <ProfileHeaderBanner
          displayName={current.fullName}
          emailAddress={current.emailAddress}
          roleLabel="Customer"
          locationLabel={current.city ? `${current.city}, Pakistan` : "Add your city"}
          phoneNumberLabel={current.phoneNumber ?? "Add your phone number"}
          quickFactList={[
            `Prefers ${contactOptions.find((option) => option.value === current.preferredContactMethod)?.label}`,
            `${current.savedAddresses.length} saved addresses`,
          ]}
          isEditing={isEditing}
          onBeginEditing={() => dispatch(beginProfileEditing())}
          onCancelEditing={cancelEditing}
        />
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <ProfileSectionCard
              title="Basic information"
              description="Your private contact details for confirmed bookings."
              IconComponent={UserRound}
            >
              {isEditing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" error={form.formState.errors.fullName?.message}>
                    <Input {...form.register("fullName")} />
                  </Field>
                  <Field label="Email address" hint="Email changes require verification and will be added later.">
                    <Input value={current.emailAddress} disabled />
                  </Field>
                  <Field label="Phone number" error={form.formState.errors.phoneNumber?.message}>
                    <Input {...form.register("phoneNumber")} />
                  </Field>
                  <Field label="City" error={form.formState.errors.city?.message}>
                    <Input {...form.register("city")} />
                  </Field>
                </div>
              ) : (
                <>
                  <ProfileDetailFieldRow
                    label="Full name"
                    value={current.fullName}
                    placeholder="Add your name"
                    IconComponent={UserRound}
                  />
                  <ProfileDetailFieldRow
                    label="Email"
                    value={current.emailAddress}
                    placeholder="Add your email"
                    IconComponent={Mail}
                  />
                  <ProfileDetailFieldRow
                    label="Phone"
                    value={current.phoneNumber ?? undefined}
                    placeholder="Add your phone"
                    IconComponent={Phone}
                  />
                  <ProfileDetailFieldRow
                    label="City"
                    value={current.city ?? undefined}
                    placeholder="Add your city"
                    IconComponent={MapPin}
                  />
                </>
              )}
            </ProfileSectionCard>
            <ProfileSectionCard
              title="Preferred contact method"
              description="How providers should contact you after a confirmed booking."
              IconComponent={MessageCircle}
            >
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {contactOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={selectedContactMethod === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => form.setValue("preferredContactMethod", option.value, { shouldDirty: true })}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {contactOptions.find((option) => option.value === current.preferredContactMethod)?.label}
                </p>
              )}
            </ProfileSectionCard>
            <ProfileSectionCard
              title="Saved addresses"
              description="Private service locations available during booking."
              IconComponent={Home}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {current.savedAddresses.map((address) => (
                  <div key={address.id} className="bg-card rounded-xl border p-4">
                    <div className="flex justify-between">
                      <strong className="text-sm">{address.label}</strong>
                      {address.isDefault && <span className="text-primary text-xs font-medium">Default</span>}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {address.addressLine}, {address.city}
                    </p>
                  </div>
                ))}
                {!current.savedAddresses.length && (
                  <p className="text-muted-foreground text-sm">
                    No saved addresses yet. You can add one while creating a booking.
                  </p>
                )}
              </div>
            </ProfileSectionCard>
            <ProfileSectionCard
              title="Service preferences"
              description="Optional interests used for relevant recommendations."
              IconComponent={Heart}
            >
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((key) => {
                    const selected = selectedServicePreferenceKeys.includes(key);
                    return (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant={selected ? "default" : "outline"}
                        onClick={() =>
                          form.setValue(
                            "servicePreferenceKeys",
                            selected
                              ? form.getValues("servicePreferenceKeys").filter((item) => item !== key)
                              : [...form.getValues("servicePreferenceKeys"), key],
                            { shouldDirty: true },
                          )
                        }
                      >
                        {humanize(key)}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {current.servicePreferenceKeys.length ? (
                    current.servicePreferenceKeys.map((key) => (
                      <span key={key} className="bg-card rounded-full border px-3 py-1.5 text-xs font-medium">
                        {humanize(key)}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No preferences selected.</p>
                  )}
                </div>
              )}
            </ProfileSectionCard>
            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Spinner />} Save changes
                </Button>
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <ProfileCompletenessCard checklist={checklist} />
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <ShieldCheck className="size-5 text-emerald-700" />
              <h2 className="mt-3 text-sm font-semibold text-emerald-950">Private by design</h2>
              <p className="mt-2 text-xs leading-5 text-emerald-900/70">
                Your phone and addresses are never public. Only a provider on a confirmed booking receives the necessary
                job details.
              </p>
            </div>
          </aside>
        </div>
      </form>
    </main>
  );
}
function toFormValues(
  profile: NonNullable<ReturnType<typeof useCustomerProfileQuery>["data"]>,
): CustomerProfileFormValues {
  return {
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber ?? "",
    city: profile.city ?? "",
    preferredContactMethod: profile.preferredContactMethod,
    servicePreferenceKeys: profile.servicePreferenceKeys,
    expectedVersion: profile.version,
  };
}
function humanize(value: string) {
  return value
    .split("-")
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}
function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold">{label}</span>
      {children}
      {hint && <span className="text-muted-foreground mt-1.5 block text-xs">{hint}</span>}
      {error && <span className="text-destructive mt-1.5 block text-xs">{error}</span>}
    </label>
  );
}

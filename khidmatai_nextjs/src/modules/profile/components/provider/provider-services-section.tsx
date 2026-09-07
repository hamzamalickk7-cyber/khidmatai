"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Plus, Sparkles, Trash2, Wrench } from "lucide-react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ProfileSectionCard } from "@/modules/profile/components/profile-section-card";
import { ProfileSectionEditToggle } from "@/modules/profile/components/profile-section-edit-toggle";
import type { PublicServiceCategory } from "@/modules/explore/types/public-provider-directory-types";
import type { ProviderProfileData, ProviderProfileUpdateInput } from "@/modules/profile/types/provider-profile-types";

const servicesSchema = z.object({
  categorySlug: z.string().min(1, "Choose a primary service category."),
  services: z.array(z.object({
    name: z.string().trim().min(2, "Use at least 2 characters.").max(100, "Use no more than 100 characters."),
    startingPriceAmount: z.string().trim().min(1, "Enter a starting price.").regex(/^\d+$/, "Enter numbers only.").refine((value) => Number(value) > 0, "Price must be greater than zero."),
  })).min(1, "Add at least one service."),
});

type ServicesFormValues = z.infer<typeof servicesSchema>;

const suggestedServicesByCategory: Record<string, string[]> = {
  "electrical-services": ["Electrical fault diagnosis", "Ceiling fan installation", "House wiring", "Switch and socket repair"],
  "plumbing-services": ["Water leak repair", "Tap installation", "Drain blockage removal", "Bathroom fitting installation"],
  "air-conditioning-refrigeration": ["AC servicing", "AC installation", "Gas refilling", "Refrigerator repair"],
  "appliance-repair": ["Washing machine repair", "Microwave repair", "Water dispenser repair", "Electric oven repair"],
  "home-cleaning": ["Deep home cleaning", "Kitchen cleaning", "Bathroom cleaning", "Move-in cleaning"],
  "painting-wall-finishing": ["Interior wall painting", "Exterior painting", "Wall putty and finishing", "Door polishing"],
  "carpentry-furniture-repair": ["Door repair", "Cabinet installation", "Furniture repair", "Custom woodwork"],
  "welding-metal-fabrication": ["Gate repair", "Grill fabrication", "Railing installation", "Metal frame welding"],
  "automotive-repair": ["Engine diagnosis", "Oil change", "Brake repair", "Roadside assistance"],
  "pest-control": ["Termite treatment", "Cockroach treatment", "Rodent control", "Bed bug treatment"],
  "gardening-landscaping": ["Garden maintenance", "Plant trimming", "Lawn installation", "Seasonal planting"],
  "moving-packing": ["Home shifting", "Office relocation", "Packing service", "Furniture moving"],
  "locksmith-services": ["Lock replacement", "Emergency lock opening", "Door lock repair", "Key duplication"],
  "roofing-waterproofing": ["Roof waterproofing", "Seepage treatment", "Roof crack repair", "Water tank waterproofing"],
  "masonry-general-construction": ["Brickwork", "Wall plastering", "Tile installation", "Concrete repair"],
  "solar-installation-maintenance": ["Solar panel installation", "Inverter setup", "Battery replacement", "Solar system inspection"],
  "cctv-security-systems": ["CCTV installation", "Camera repair", "DVR setup", "Security alarm installation"],
  "internet-network-installation": ["Wi-Fi setup", "Router installation", "Network cabling", "Internet troubleshooting"],
  "generator-ups-services": ["Generator servicing", "UPS repair", "Inverter installation", "Backup battery replacement"],
  "laundry-dry-cleaning": ["Wash and fold", "Dry cleaning", "Clothes pressing", "Curtain cleaning"],
};

interface ProviderServicesSectionProps {
  profile: ProviderProfileData;
  availableCategories: PublicServiceCategory[];
  onSaveProfile: (patch: Partial<ProviderProfileUpdateInput>) => Promise<void>;
  onCompletenessChange: (isComplete: boolean) => void;
}

function getSavedValues(profile: ProviderProfileData, categories: PublicServiceCategory[]): ServicesFormValues {
  return {
    categorySlug: profile.categoryKeys[0] ?? categories[0]?.slug ?? "",
    services: profile.services.map((service) => ({ name: service.name, startingPriceAmount: String(service.startingPriceAmount) })),
  };
}

export function ProviderServicesSection({ profile, availableCategories, onSaveProfile, onCompletenessChange }: ProviderServicesSectionProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState("");
  const [categoryMenuWidth, setCategoryMenuWidth] = useState<number>();
  const [categoryMenuMaximumHeight, setCategoryMenuMaximumHeight] = useState(320);
  const categoryMenuTriggerReference = useRef<HTMLButtonElement>(null);
  const savedValues = getSavedValues(profile, availableCategories);
  const form = useForm<ServicesFormValues>({ resolver: zodResolver(servicesSchema), defaultValues: savedValues });
  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "services" });
  const categorySlug = useWatch({ control: form.control, name: "categorySlug" });
  const watchedServiceValues = useWatch({ control: form.control, name: "services" });
  const serviceValues = useMemo(() => watchedServiceValues ?? [], [watchedServiceValues]);
  const selectedCategory = availableCategories.find((category) => category.slug === categorySlug);
  const suggestedServiceList = suggestedServicesByCategory[categorySlug] ?? [];

  function addSuggestedService(serviceName: string) {
    const isAlreadyAdded = serviceValues.some((service) => service.name.trim().toLowerCase() === serviceName.toLowerCase());
    if (isAlreadyAdded) { toast.info(`${serviceName} is already listed.`); return; }
    append({ name: serviceName, startingPriceAmount: "" });
  }

  function changePrimaryCategory(nextCategorySlug: string) {
    if (nextCategorySlug === categorySlug) return;
    form.setValue("categorySlug", nextCategorySlug, { shouldDirty: true, shouldValidate: true });
    replace([]);
    form.clearErrors("services");
    setSuccessMessage("");
    setSubmissionErrorMessage("");
  }

  useEffect(() => {
    onCompletenessChange(Boolean(categorySlug) && serviceValues.some((service) => service.name.trim() && Number(service.startingPriceAmount) > 0));
  }, [categorySlug, serviceValues, onCompletenessChange]);

  async function saveServices(values: ServicesFormValues) {
    try {
      await onSaveProfile({
        categoryKeys: [values.categorySlug],
        services: values.services.map((service) => ({ categorySlug: values.categorySlug, name: service.name.trim(), startingPriceAmount: Number(service.startingPriceAmount) })),
      });
      form.reset(values);
      setIsManaging(false);
      setSubmissionErrorMessage("");
      setSuccessMessage("Your services were saved successfully.");
      toast.success("Services saved successfully.");
    } catch (error) {
      setSuccessMessage("");
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      setSubmissionErrorMessage(errorMessage);
      toast.error("Could not save services", { description: errorMessage });
    }
  }

  return (
    <ProfileSectionCard title="My services" description="Individual services and starting prices customers see on your listing." IconComponent={Wrench}
      action={<ProfileSectionEditToggle isEditing={isManaging} editLabel="Manage services" doneLabel="Save changes"
        isSaving={form.formState.isSubmitting}
        onBeginEditing={() => { setSuccessMessage(""); setSubmissionErrorMessage(""); setIsManaging(true); }}
        onCancel={() => { form.reset(savedValues); setSubmissionErrorMessage(""); setSuccessMessage(""); setIsManaging(false); }}
        onSave={form.handleSubmit(saveServices, () => toast.error("Check the highlighted service fields before saving."))} />}
    >
      <div className="mb-5 grid gap-3 md:grid-cols-2 md:items-stretch">
      <div className="border-ink/10 rounded-xl border bg-white p-4">
        <div className="mb-3 flex items-center gap-2.5"><span className="bg-brand text-white grid size-6 place-items-center rounded-full text-[11px] font-bold">1</span><div><p className="text-sm font-semibold">Choose your main category</p><p className="text-ink/45 text-[11px]">Help customers find the right professional.</p></div></div>
        <div className="space-y-1.5">
        <span className={`block text-xs font-semibold ${form.formState.errors.categorySlug ? "text-red-600" : "text-ink/60"}`}>Primary service category <span className="text-red-600">*</span></span>
        <DropdownMenu onOpenChange={(isOpen) => {
          if (!isOpen) return;
          const triggerBounds = categoryMenuTriggerReference.current?.getBoundingClientRect();
          setCategoryMenuWidth(triggerBounds?.width);
          setCategoryMenuMaximumHeight(Math.max(120, window.innerHeight - (triggerBounds?.bottom ?? 0) - 24));
        }}>
          <DropdownMenuTrigger ref={categoryMenuTriggerReference} disabled={!isManaging} aria-invalid={Boolean(form.formState.errors.categorySlug)} className="border-ink/10 aria-invalid:border-red-600 aria-invalid:ring-3 aria-invalid:ring-red-600/20 disabled:bg-ink/[.025] flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm disabled:cursor-not-allowed">
            <span className={selectedCategory ? "text-ink" : "text-ink/40"}>{selectedCategory?.displayName ?? "Choose a category"}</span>
            <ChevronDown className="text-ink/40 size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            collisionAvoidance={{ side: "none" }}
            className="min-w-0 overflow-hidden"
            style={{ width: categoryMenuWidth }}
          >
            <div
              className="overscroll-contain overflow-y-auto pr-1 [scrollbar-color:rgba(20,83,45,0.45)_transparent] [scrollbar-width:thin]"
              style={{ maxHeight: categoryMenuMaximumHeight }}
            >
              {availableCategories.map((category) => (
                <DropdownMenuItem key={category.slug} onClick={() => changePrimaryCategory(category.slug)}
                  className={category.slug === categorySlug ? "bg-brand-soft text-brand font-semibold" : undefined}>
                  {category.displayName}
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {form.formState.errors.categorySlug ? <p className="text-xs text-red-600">{form.formState.errors.categorySlug.message}</p> : null}
        <p className="text-ink/40 text-[11px]">Choose the category that best represents the work you offer.</p>
        </div>
      </div>
      <div className="border-brand/15 bg-brand-soft/35 rounded-xl border p-4">
        <div className="flex items-center gap-2.5"><span className="bg-brand-soft text-brand grid size-8 place-items-center rounded-lg"><Sparkles className="size-4" /></span><div><p className="text-sm font-semibold">Quick suggestions</p><p className="text-ink/45 text-[11px]">Add a common service, then set its price.</p></div></div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestedServiceList.length ? suggestedServiceList.map((serviceName) => {
            const isAdded = serviceValues.some((service) => service.name.trim().toLowerCase() === serviceName.toLowerCase());
            return <Button key={serviceName} type="button" variant="outline" size="sm" disabled={!isManaging || isAdded} onClick={() => addSuggestedService(serviceName)} className="h-8 rounded-full bg-white px-3 text-xs">
              <Plus className="size-3" /> {isAdded ? "Added" : serviceName}
            </Button>;
          }) : <span className="text-ink/40 text-xs">Choose a category to see suggestions.</span>}
        </div>
      </div>
      </div>

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2.5"><span className="bg-brand text-white grid size-6 place-items-center rounded-full text-[11px] font-bold">2</span><div><p className="text-sm font-semibold">Services and pricing <span className="text-red-600">*</span></p><p className="text-ink/40 mt-0.5 text-[11px]">Add a service and its starting price.</p></div></div>
        {isManaging ? <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", startingPriceAmount: "" })}><Plus className="size-4" /> Add custom service</Button> : null}
        {form.formState.errors.services?.root?.message ? <p className="mt-1 text-xs text-red-600">{form.formState.errors.services.root.message}</p> : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {fields.map((field, index) => (
          <div key={field.id} className="border-ink/8 rounded-xl border bg-white p-3.5 transition hover:border-brand/15">
            {isManaging ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-ink/50 text-xs font-semibold">Service {index + 1}</span><Button type="button" variant="ghost" size="icon" className="size-7 text-red-600" onClick={() => remove(index)} aria-label={`Remove service ${index + 1}`}><Trash2 className="size-3.5" /></Button></div>
                <div className="grid grid-cols-[minmax(0,1fr)_9rem] gap-3">
                <ServiceField label="Service name" description="Use 2–100 characters." error={form.formState.errors.services?.[index]?.name?.message}>
                  <Input {...form.register(`services.${index}.name`)} aria-invalid={Boolean(form.formState.errors.services?.[index]?.name)} placeholder="e.g. Ceiling fan installation" maxLength={100} />
                </ServiceField>
                <ServiceField label="Starting price (PKR)" description="Enter numbers only." error={form.formState.errors.services?.[index]?.startingPriceAmount?.message}>
                  <Input {...form.register(`services.${index}.startingPriceAmount`)} aria-invalid={Boolean(form.formState.errors.services?.[index]?.startingPriceAmount)} inputMode="numeric" placeholder="1500" maxLength={9} />
                </ServiceField>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3"><span className="bg-brand-soft text-brand grid size-8 place-items-center rounded-lg text-xs font-bold">{index + 1}</span><div><p className="text-sm font-semibold">{serviceValues[index]?.name}</p><p className="text-ink/45 mt-0.5 text-xs">From PKR {Number(serviceValues[index]?.startingPriceAmount || 0).toLocaleString()}</p></div></div>
            )}
          </div>
        ))}
        {fields.length === 0 ? <div className="border-ink/15 text-ink/40 rounded-2xl border border-dashed px-4 py-3 text-sm">No services added yet.</div> : null}
      </div>

      {submissionErrorMessage ? <p role="alert" className="mt-4 select-text rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submissionErrorMessage}</p> : null}
      {successMessage ? <p role="status" className="mt-4 text-sm font-medium text-emerald-700">{successMessage}</p> : null}
    </ProfileSectionCard>
  );
}

function ServiceField({ label, description, error, children }: { label: string; description: string; error?: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5">
    <span className={`block text-xs font-semibold ${error ? "text-red-600" : "text-ink/60"}`}>{label} <span className="text-red-600">*</span></span>
    {children}
    <span className={`block text-[11px] leading-4 ${error ? "text-red-600" : "text-ink/40"}`}>{error ?? description}</span>
  </label>;
}

"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2, CircleOff, Layers3, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdministrationServiceCategory,
  deleteAdministrationServiceCategory,
  updateAdministrationServiceCategory,
  type AdministrationServiceCategory,
} from "../services/administration-api-service";

const formSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(500),
  iconIdentifier: z.string().trim().min(2).max(60),
  displayOrder: z.number().int().min(0).max(10_000),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof formSchema>;
const defaults: FormValues = { displayName: "", slug: "", description: "", iconIdentifier: "wrench", displayOrder: 0, isActive: true };

export function AdministrationServiceCategoryManager({ initialCategories }: { initialCategories: AdministrationServiceCategory[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<AdministrationServiceCategory | null | undefined>(undefined);
  const [deletingCategory, setDeletingCategory] = useState<AdministrationServiceCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults });
  const isActive = useWatch({ control: form.control, name: "isActive" });

  function openCreate() {
    setEditing(null);
    form.reset({ ...defaults, displayOrder: categories.length * 10 + 10 });
  }
  function openEdit(category: AdministrationServiceCategory) {
    setEditing(category);
    form.reset(category);
  }
  async function save(values: FormValues) {
    try {
      if (editing) {
        const updated = await updateAdministrationServiceCategory(editing.id, values);
        setCategories((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createAdministrationServiceCategory({ ...values, parentCategoryId: null });
        setCategories((items) => [...items, created]);
      }
      setEditing(undefined);
      toast.success(editing ? "Category updated." : "Category added.");
    } catch (error) {
      toast.error("Could not save category", { description: error instanceof Error ? error.message : "Try again." });
    }
  }
  async function confirmDelete() {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await deleteAdministrationServiceCategory(deletingCategory.id);
      setCategories((items) => items.filter((item) => item.id !== deletingCategory.id));
      toast.success("Category deleted.");
      setDeletingCategory(null);
    } catch (error) {
      toast.error("Could not delete category", { description: error instanceof Error ? error.message : "Deactivate it instead." });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add category
        </Button>
      </div>

      <div className="border-ink/10 overflow-hidden rounded-2xl border bg-white">
        <div className="divide-ink/8 divide-y">
          {categories.map((category) => (
            <article key={category.id} className="grid gap-3 p-4 sm:grid-cols-[48px_1fr_auto] sm:items-center">
              <span className="bg-brand-soft text-brand grid size-11 place-items-center rounded-xl">
                <Layers3 className="size-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{category.displayName}</h2>
                  <code className="bg-ink/[.04] rounded px-2 py-0.5 text-[10px]">{category.slug}</code>
                </div>
                <p className="text-ink/45 mt-1 text-xs leading-5">{category.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {category.isActive ? <CheckCircle2 className="size-3.5" /> : <CircleOff className="size-3.5" />}
                  {category.isActive ? "Active" : "Inactive"}
                </span>
                <Button variant="outline" size="icon-sm" onClick={() => openEdit(category)} aria-label={`Edit ${category.displayName}`}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => setDeletingCategory(category)} aria-label={`Delete ${category.displayName}`}>
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Dialog open={editing !== undefined} onOpenChange={(open) => !open && setEditing(undefined)}>
        <DialogContent>
          <form onSubmit={form.handleSubmit(save)}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit service category" : "Add service category"}</DialogTitle>
              <DialogDescription>Categories become available in provider profiles and Explore filters.</DialogDescription>
            </DialogHeader>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Display name" error={form.formState.errors.displayName?.message}>
                <Input {...form.register("displayName")} />
              </Field>
              <Field label="Slug" error={form.formState.errors.slug?.message}>
                <Input disabled={Boolean(editing)} {...form.register("slug")} />
              </Field>
              <Field label="Description" error={form.formState.errors.description?.message} wide>
                <Textarea {...form.register("description")} />
              </Field>
              <Field label="Icon identifier" error={form.formState.errors.iconIdentifier?.message}>
                <Input {...form.register("iconIdentifier")} />
              </Field>
              <Field label="Display order" error={form.formState.errors.displayOrder?.message}>
                <Input type="number" {...form.register("displayOrder", { valueAsNumber: true })} />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={isActive} onCheckedChange={(value) => form.setValue("isActive", value === true)} />
                Active
              </label>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditing(undefined)} disabled={form.formState.isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Spinner className="size-4" />}
                {editing ? "Save changes" : "Add category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deletingCategory !== null} onOpenChange={(open) => !open && !isDeleting && setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deletingCategory?.displayName}?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Categories already in use by a provider profile cannot be deleted — deactivate them instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setDeletingCategory(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Spinner className="size-4" />}
              Delete category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-semibold">
        {label} <span className="text-red-600">*</span>
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

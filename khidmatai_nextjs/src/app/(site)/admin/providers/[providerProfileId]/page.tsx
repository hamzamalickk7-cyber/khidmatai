import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft, BriefcaseBusiness, FileText, IdCard, MapPin, Phone, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProviderOnboardingReviewTable } from "@/modules/administration/components/provider-onboarding-review-table";
import { getProviderProfileForAdministration } from "@/modules/administration/services/administration-api-service";
import { requireAuthenticatedAccountRole } from "@/server/authentication/current-session";

export default async function AdministrationProviderProfilePage({
  params,
}: {
  params: Promise<{ providerProfileId: string }>;
}) {
  const { authenticatedAccountRole } = await requireAuthenticatedAccountRole(["admin", "support"]);
  const { providerProfileId } = await params;
  const requestHeaders = await headers();
  const provider = await getProviderProfileForAdministration(requestHeaders.get("cookie") ?? "", providerProfileId);
  const profileImage = provider.mediaAssets.find((asset) => asset.mediaPurpose === "profile_image");
  const workGallery = provider.mediaAssets.filter((asset) => asset.mediaPurpose === "work_gallery");
  const verificationDocuments = provider.mediaAssets.filter((asset) =>
    ["identity_document", "professional_certificate"].includes(asset.mediaPurpose),
  );
  const facts = [
    { label: "Phone", value: provider.phoneNumber ?? "Not provided", icon: Phone },
    { label: "CNIC", value: maskIdentity(provider.governmentIdentityNumber), icon: IdCard },
    { label: "Location", value: [provider.addressLine, provider.city].filter(Boolean).join(", ") || "Not provided", icon: MapPin },
    { label: "Experience", value: provider.yearsOfExperience === null ? "Not provided" : `${provider.yearsOfExperience} years`, icon: BriefcaseBusiness },
  ];

  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <Link href="/admin/providers" className={buttonVariants({ variant: "outline", size: "lg" })}>
          <ArrowLeft />
          Back to providers
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-brand-soft text-xl font-semibold text-brand ring-4 ring-white shadow-sm">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL is already transformed and admin-only.
                <img src={profileImage.url} alt={`${provider.name}'s profile`} className="size-full object-cover" />
              ) : (
                provider.name.split(" ").map((part) => part[0]).slice(0, 2).join("")
              )}
            </div>
            <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold">{provider.name}</h1>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold capitalize text-brand">
                {provider.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-2 text-ink/55">
              {provider.professionalTitle ?? "Service provider"} · {provider.email}
            </p>
            </div>
          </div>
          <Link href={`/admin/users/${encodeURIComponent(provider.userId)}`} className={buttonVariants({ variant: "default", size: "lg" })}>
            Open account security
          </Link>
        </div>

        {(provider.banned || provider.deactivatedAt) && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            This provider account is {provider.deactivatedAt ? "deactivated" : "banned"}. Provider approval does not
            override account restrictions.
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <h2 className="font-semibold">Professional profile</h2>
              <p className="mt-4 text-sm leading-7 text-ink/55">{provider.professionalBio ?? "No professional biography provided."}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {facts.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl bg-ink/[.035] p-4">
                    <Icon className="size-4 text-brand" />
                    <p className="mt-3 text-xs text-ink/45">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <h2 className="font-semibold">Services and availability</h2>
              <LabelList title="Service categories" values={provider.categoryKeys} />
              <LabelList title="Service areas" values={provider.serviceAreas} />
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Availability</p>
                <p className="mt-2 text-sm">{provider.availabilitySummary ?? "Not provided"}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {provider.services.map((service) => (
                  <div key={service.id} className="rounded-2xl border border-ink/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">{service.name}</p>
                      <span className="text-xs font-semibold text-brand">
                        {service.startingPriceAmount ? `${service.currencyCode} ${Number(service.startingPriceAmount).toLocaleString("en-PK")}` : "Price on request"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink/55">{service.description ?? "No description provided."}</p>
                  </div>
                ))}
                {!provider.services.length && <p className="text-sm text-ink/45">No services added.</p>}
              </div>
              <LabelList title="Languages" values={provider.languages.map(({ name }) => name)} />
              <LabelList title="Weekly availability" values={provider.weeklyAvailability.map((item) => `${dayName(item.dayOfWeek)} · ${formatTime(item.startTime)}–${formatTime(item.endTime)}`)} />
            </section>

            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <h2 className="font-semibold">Work gallery</h2>
              <p className="mt-1 text-sm text-ink/50">Submitted examples of completed work.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {workGallery.map((asset) => (
                  <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-ink/10 bg-ink/[.035]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary URL is already transformed and admin-only. */}
                    <img src={asset.url} alt={asset.originalFileName ?? "Provider work"} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
                    <p className="truncate p-2 text-xs text-ink/50">{asset.originalFileName ?? "Work image"}</p>
                  </a>
                ))}
              </div>
              {!workGallery.length && <p className="mt-4 rounded-2xl border border-dashed p-5 text-sm text-ink/45">No work images uploaded.</p>}
            </section>

            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <h2 className="font-semibold">Verification documents</h2>
              <p className="mt-1 text-sm text-ink/50">CNIC and professional certificates supplied for verification.</p>
              {authenticatedAccountRole === "admin" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {verificationDocuments.map((asset) => (
                    <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-ink/10 bg-ink/[.025] transition hover:shadow-md">
                      {asset.mimeType.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element -- Signed Cloudinary document URL is generated per authorized admin request.
                        <img
                          src={asset.url}
                          alt={asset.mediaPurpose === "identity_document" ? `CNIC ${asset.documentSide ?? "document"}` : "Professional certificate"}
                          className="aspect-[4/3] w-full bg-white object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <span className="grid aspect-[4/3] place-items-center bg-white text-brand"><FileText className="size-10" /></span>
                      )}
                      <span className="flex items-center gap-3 border-t border-ink/10 bg-white p-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><FileText className="size-4" /></span>
                        <span className="min-w-0"><span className="block text-sm font-medium capitalize">{asset.mediaPurpose === "identity_document" ? `CNIC ${asset.documentSide ?? "document"}` : "Professional certificate"}</span><span className="block truncate text-xs text-ink/45">{asset.originalFileName ?? "Open full image"}</span></span>
                      </span>
                    </a>
                  ))}
                  {!verificationDocuments.length && <p className="text-sm text-ink/45">No verification documents uploaded.</p>}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">Sensitive documents are visible only to full administrators.</p>
              )}
            </section>

            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <h2 className="font-semibold">Professional references</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {provider.references.map((reference) => (
                  <div key={reference.id} className="rounded-2xl bg-ink/[.035] p-4">
                    <p className="font-medium">{reference.fullName}</p>
                    <p className="mt-1 text-xs text-ink/45">{reference.relationship}</p>
                    <p className="mt-3 text-sm">{reference.email ?? reference.phoneNumber}</p>
                  </div>
                ))}
                {!provider.references.length && <p className="text-sm text-ink/45">No references submitted.</p>}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
                <ShieldCheck className="size-4" />
              </span>
              <h2 className="mt-3 font-semibold">Verification summary</h2>
              <dl className="mt-4 divide-y divide-ink/6 text-sm">
                <Row label="Email" value={provider.emailVerified ? "Verified" : "Pending"} />
                <Row label="Profile version" value={String(provider.version)} />
                <Row label="Submitted" value={formatDate(provider.submittedAt)} />
                <Row label="Approved" value={formatDate(provider.approvedAt)} />
                <Row label="Last updated" value={formatDate(provider.updatedAt)} />
              </dl>
            </section>

            <section className="rounded-3xl border border-ink/10 bg-white p-6">
              <h2 className="font-semibold">Review history</h2>
              <div className="mt-4 space-y-3">
                {provider.reviewDecisions.map((decision) => (
                  <div key={decision.id} className="rounded-2xl bg-ink/[.035] p-4">
                    <p className="text-sm font-medium capitalize">{decision.action.replaceAll("_", " ")}</p>
                    <p className="mt-1 text-xs text-ink/45">
                      {decision.previousStatus} → {decision.nextStatus}
                    </p>
                    <p className="mt-2 text-sm text-ink/55">{decision.reason}</p>
                    <p className="mt-2 text-xs text-ink/40">{formatDate(decision.createdAt)}</p>
                  </div>
                ))}
                {!provider.reviewDecisions.length && <p className="text-sm text-ink/45">No review decisions yet.</p>}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 font-semibold">Available review actions</h2>
          <ProviderOnboardingReviewTable providerOnboardingProfiles={[provider]} isReadOnly={authenticatedAccountRole !== "admin"} />
        </section>
      </div>
    </main>
  );
}

function LabelList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.length ? (
          values.map((value) => (
            <span key={value} className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand">
              {value.replaceAll("-", " ")}
            </span>
          ))
        ) : (
          <span className="text-sm text-ink/45">Not provided</span>
        )}
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-ink/50">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not yet";
}
function maskIdentity(value: string | null) {
  if (!value) return "Not provided";
  return `•••••-•••••••-${value.slice(-1)}`;
}
function dayName(day: number) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day] ?? `Day ${day}`;
}
function formatTime(value: string) {
  const [hours = "0", minutes = "00"] = value.split(":");
  return new Date(2000, 0, 1, Number(hours), Number(minutes)).toLocaleTimeString("en-PK", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, ChevronLeft, MapPin, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { PublicProviderDetails } from "../types/public-provider-directory-types";
import type { AccountRole } from "@/modules/authentication/types/authentication-role";

export function PublicProviderProfileDetailsView({
  provider,
  viewerRole,
}: {
  provider: PublicProviderDetails;
  viewerRole: AccountRole | null;
}) {
  const gallery = provider.media.filter((item) => item.purpose === "work_gallery");
  return (
    <main className="flex-1 bg-[#f7f9f7] pb-16">
      <div className="border-ink/8 border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <Link
            href="/explore"
            className="text-ink/50 hover:text-brand inline-flex items-center gap-1.5 text-xs font-semibold"
          >
            <ChevronLeft className="size-4" />
            All professionals
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <section className="border-ink/10 overflow-hidden rounded-3xl border bg-white shadow-[0_24px_55px_-42px_rgba(8,47,32,.5)]">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-[#123b2d] via-[#1d6b4b] to-[#b9f35a] sm:h-36">
            <div className="absolute -top-24 -right-8 size-64 rounded-full bg-[#d9ff82]/45 blur-2xl" />
            <div className="absolute inset-y-0 right-0 w-[34%] bg-[#b9f35a]" />
            <div className="absolute inset-y-0 right-[34%] w-24 bg-gradient-to-l from-[#b9f35a] to-transparent" />
            <div className="absolute -bottom-24 left-1/3 size-48 rounded-full bg-[#d9f45c]/15 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 px-5 pb-4 sm:px-6">
              {provider.categories.slice(0, 3).map((category) => <span key={category.slug} className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur">{category.displayName}</span>)}
              {provider.isAvailableForNewJobs && <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-[#17543b]">Available now</span>}
            </div>
          </div>
          <div className="flex flex-col gap-5 bg-gradient-to-r from-white via-white to-[#e8ffc0] p-6 sm:flex-row sm:items-center">
            <div className="ring-brand-soft text-brand relative z-20 grid size-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-2xl font-bold shadow-lg ring-4">
              {provider.profileImageUrl ? (
                <Image
                  src={provider.profileImageUrl}
                  alt={`${provider.fullName} profile`}
                  width={112}
                  height={112}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                provider.fullName
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">{provider.fullName}</h1>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck className="size-3.5" />
                  Approved provider
                </span>
              </div>
              <p className="text-brand mt-1.5 font-semibold">{provider.professionalTitle}</p>
              <p className="text-ink/40 mt-1 text-xs">@{provider.username}</p>
            </div>
            {viewerRole === "customer" && (
              <Link
                href="/bookings"
                className={buttonVariants({ className: "bg-brand hover:bg-brand-deep text-white" })}
              >
                Request a booking
              </Link>
            )}
            {!viewerRole && (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/explore/${provider.username}`)}`}
                className={buttonVariants({ className: "bg-brand hover:bg-brand-deep text-white" })}
              >
                Log in to book
              </Link>
            )}
          </div>
        </section>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <div className="space-y-5">
            <Content title="About">
              <p className="text-ink/60 text-sm leading-7">{provider.professionalBio}</p>
            </Content>
            <Content title="Services">
              <div className="grid gap-3 sm:grid-cols-2">
                {provider.categories.map((category) => (
                  <article key={category.slug} className="border-ink/8 rounded-xl border p-4">
                    <h3 className="text-sm font-semibold">{category.displayName}</h3>
                    {category.description && (
                      <p className="text-ink/45 mt-2 text-xs leading-5">{category.description}</p>
                    )}
                  </article>
                ))}
              </div>
            </Content>
            {gallery.length > 0 && (
              <Content title="Work gallery">
                <div className="grid gap-3 sm:grid-cols-2">
                  {gallery.map((media, index) => (
                    <div key={media.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={media.url}
                        alt={`${provider.fullName} completed work ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width:640px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </Content>
            )}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <Content title="Provider details">
              <Fact icon={MapPin} label="Location" value={provider.cityName} />
              <Fact icon={BriefcaseBusiness} label="Experience" value={`${provider.yearsOfExperience} years`} />
              {provider.serviceAreas.length > 0 && (
                <Fact icon={MapPin} label="Areas served" value={provider.serviceAreas.join(", ")} />
              )}
            </Content>
            <section className="border-brand/15 bg-brand-soft rounded-2xl border p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-brand size-5" />
                <h2 className="font-semibold">Privacy and trust</h2>
              </div>
              <p className="text-ink/55 mt-3 text-xs leading-5">
                KhidmatAI reviewed this profile. Private identity, contact, address, document, and reference information
                is never displayed here.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
function Content({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-ink/10 rounded-2xl border bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="mb-4 flex gap-3 last:mb-0">
      <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-lg">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-ink/35 text-[10px] font-semibold uppercase">{label}</p>
        <p className="text-ink/65 mt-1 text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

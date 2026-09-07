import Link from "next/link";
import { headers } from "next/headers";
import { ProviderOnboardingReviewTable } from "@/modules/administration/components/provider-onboarding-review-table";
import { getProviderOnboardingProfilesForAdministration } from "@/modules/administration/services/administration-api-service";
import { requireAuthenticatedAccountRole } from "@/server/authentication/current-session";

const DEFAULT_PROVIDER_LIST_PAGE_SIZE = 20;

interface AdministrationProviderReviewPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdministrationProviderReviewPage({
  searchParams,
}: AdministrationProviderReviewPageProps) {
  const { authenticatedAccountRole } = await requireAuthenticatedAccountRole(["admin", "support"]);
  const incomingRequestHeaders = await headers();
  const requestedPage = Number((await searchParams).page ?? "1");
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const { data: providerOnboardingProfiles, meta } = await getProviderOnboardingProfilesForAdministration(
    incomingRequestHeaders.get("cookie") ?? "",
    currentPage,
    DEFAULT_PROVIDER_LIST_PAGE_SIZE,
  );

  return (
    <main className="bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Administration</p>
            <h1 className="mt-2 text-3xl font-semibold">Provider review</h1>
            <p className="mt-2 text-ink/55">Review onboarding, verification state, and account decisions.</p>
          </div>
          <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold capitalize text-brand">
            {authenticatedAccountRole} access
          </span>
        </div>

        {authenticatedAccountRole === "support" && (
          <p className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Support access is read-only. Administrator role is required for provider decisions.
          </p>
        )}

        <div className="mt-6">
          <ProviderOnboardingReviewTable
            providerOnboardingProfiles={providerOnboardingProfiles}
            isReadOnly={authenticatedAccountRole !== "admin"}
          />
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-sm text-ink/55">
            <p>
              Page {meta.page} of {meta.totalPages} &middot; {meta.total} providers total
            </p>
            <div className="flex gap-2">
              <ProviderReviewPageLink page={meta.page - 1} disabled={meta.page <= 1}>
                Previous
              </ProviderReviewPageLink>
              <ProviderReviewPageLink page={meta.page + 1} disabled={meta.page >= meta.totalPages}>
                Next
              </ProviderReviewPageLink>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ProviderReviewPageLink({
  page,
  disabled,
  children,
}: {
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="rounded-lg border border-ink/10 px-3 py-1.5 text-ink/30">{children}</span>;
  }
  return (
    <Link
      href={`/admin/providers?page=${page}`}
      className="rounded-lg border border-ink/10 px-3 py-1.5 hover:border-brand hover:text-brand"
    >
      {children}
    </Link>
  );
}

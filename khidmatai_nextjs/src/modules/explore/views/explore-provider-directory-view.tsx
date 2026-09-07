"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Filter, MapPin, Search, SlidersHorizontal, UsersRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicProviderSummaryCard } from "@/modules/explore/components/public-provider-summary-card";
import type { PublicProviderDirectoryItem, PublicServiceCategory } from "@/modules/explore/types/public-provider-directory-types";

const heroShowcaseSlides = [
  {
    workImageUrl: "/images/landing/electrical-category-repair.png",
    workLabel: "Electrical repair · F-8",
    providerImageUrl: "/images/landing/bilal-ahmed-provider-portrait.png",
    providerName: "Bilal Ahmed",
    providerTrade: "Verified electrician",
    rating: "4.9",
  },
  {
    workImageUrl: "/images/landing/ac-cooling-category-repair.png",
    workLabel: "AC servicing · G-9",
    providerImageUrl: "/images/landing/provider-ready-for-service-job.png",
    providerName: "Saad Khan",
    providerTrade: "Verified AC technician",
    rating: "4.8",
  },
  {
    workImageUrl: "/images/landing/customer-requesting-home-service.png",
    workLabel: "Home maintenance · F-10",
    providerImageUrl: "/images/landing/hamza-ali-automotive-provider.png",
    providerName: "Hamza Ali",
    providerTrade: "Verified car mechanic",
    rating: "4.7",
  },
] as const;

export function ExploreProviderDirectoryView({ providers, categories }: { providers: PublicProviderDirectoryItem[]; categories: PublicServiceCategory[] }) {
  const searchParameters = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParameters.get("query") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const requestedService = searchParameters.get("service")?.trim().toLowerCase();
    return categories.find((category) => category.slug === requestedService || category.displayName.toLowerCase() === requestedService)?.displayName ?? "All services";
  });
  const [selectedCity, setSelectedCity] = useState("All cities");
  const [selectedArea, setSelectedArea] = useState("All areas");
  const [areMobileFiltersVisible, setAreMobileFiltersVisible] = useState(false);
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotionQuery.matches) return;
    const rotationInterval = window.setInterval(() => {
      setActiveHeroSlideIndex((currentIndex) => (currentIndex + 1) % heroShowcaseSlides.length);
    }, 4500);
    return () => window.clearInterval(rotationInterval);
  }, []);

  const activeHeroSlide = heroShowcaseSlides[activeHeroSlideIndex];
  const availableCities = useMemo(
    () => [...new Set(providers.map((provider) => provider.cityName).filter(Boolean))].sort(
      (firstCity, secondCity) => firstCity.localeCompare(secondCity),
    ),
    [providers],
  );
  const availableAreas = useMemo(
    () =>
      [...new Set(providers
        .filter((provider) => selectedCity === "All cities" || provider.cityName === selectedCity)
        .flatMap((provider) => provider.serviceAreas ?? [])
        .filter(Boolean))].sort(
        (firstArea, secondArea) => firstArea.localeCompare(secondArea),
      ),
    [providers, selectedCity],
  );

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          [
            provider.fullName,
            provider.professionalTitle,
            provider.cityName,
            ...(provider.serviceAreas ?? []),
            ...provider.categories.map((category) => category.displayName),
          ].some((value) => value.toLowerCase().includes(normalizedSearch));
        return (
          matchesSearch &&
          (selectedCategory === "All services" || provider.categories.some((category) => category.displayName === selectedCategory)) &&
          (selectedCity === "All cities" || provider.cityName === selectedCity) &&
          (selectedArea === "All areas" || (provider.serviceAreas ?? []).includes(selectedArea))
        );
      }),
    [providers, searchQuery, selectedArea, selectedCategory, selectedCity],
  );

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("All services");
    setSelectedCity("All cities");
    setSelectedArea("All areas");
  }

  return (
    <main className="bg-background flex-1">
      <section className="relative overflow-hidden bg-[#edf5ef] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="absolute inset-0 [background-image:radial-gradient(#86ad92_1px,transparent_1px)] [background-size:22px_22px] opacity-40" />
        <div className="relative mx-auto grid max-w-screen-2xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <span className="border-brand/15 text-brand inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1.5 text-xs font-bold backdrop-blur">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Trusted professionals in Islamabad
            </span>
            <h1 className="text-ink mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
              The right local expert is closer than you think.
            </h1>
            <p className="text-ink/55 mt-4 max-w-xl text-sm leading-6 sm:text-base">
              Search by job or area, compare verified experience and starting prices, then choose with confidence.
            </p>
            <div className="border-ink/10 mt-6 flex max-w-xl items-center rounded-xl border bg-white p-1.5 shadow-[0_18px_45px_-30px_rgba(20,83,45,.5)]">
              <Search className="text-ink/35 ml-3 size-5 shrink-0" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search electricians, plumbers, areas..."
                className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                type="button"
                onClick={() => document.getElementById("explore-results")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-brand hover:bg-brand-deep h-10 rounded-lg px-5 text-white"
              >
                Find providers
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <HeaderStat value={String(categories.length)} label="Service categories" />
              <HeaderStat value={String(providers.length)} label="Approved professionals" />
            </div>
          </div>
          <div className="relative mx-auto hidden w-full max-w-lg lg:block">
            <span className="absolute top-3 left-12 z-20 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink/55 uppercase backdrop-blur">
              Illustrative preview
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeHeroSlide.workImageUrl}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative ml-auto aspect-[16/11] w-[88%] overflow-hidden rounded-[28px] shadow-[0_30px_80px_-45px_rgba(20,83,45,.7)]">
                  <Image
                    src={activeHeroSlide.workImageUrl}
                    alt={activeHeroSlide.workLabel}
                    fill
                    loading="eager"
                    quality={72}
                    className="object-cover"
                    sizes="520px"
                  />
                  <div className="from-ink/55 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                  <span className="text-ink absolute bottom-5 left-5 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold backdrop-blur">
                    {activeHeroSlide.workLabel}, Islamabad
                  </span>
                </div>
                <div className="absolute -bottom-5 left-0 flex w-72 items-center gap-3 rounded-2xl border border-white/80 bg-white p-3.5 shadow-xl">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={activeHeroSlide.providerImageUrl}
                      alt={activeHeroSlide.providerName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{activeHeroSlide.providerName}</p>
                    <p className="text-brand text-[11px] font-semibold">{activeHeroSlide.providerTrade}</p>
                  </div>
                  <span className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold">★ {activeHeroSlide.rating}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute top-5 -right-2 rounded-xl border border-white bg-white/95 p-3 shadow-lg">
              <p className="text-ink/40 text-[10px] font-semibold uppercase">Available now</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span className="size-2 rounded-full bg-emerald-500" />
                {providers.length} approved {providers.length === 1 ? "professional" : "professionals"}
              </p>
            </div>
            <div className="absolute right-3 -bottom-5 flex gap-1.5">
              {heroShowcaseSlides.map((slide, index) => (
                <button
                  key={slide.workImageUrl}
                  type="button"
                  aria-label={`Show ${slide.providerName}`}
                  onClick={() => setActiveHeroSlideIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${index === activeHeroSlideIndex ? "bg-brand w-6" : "bg-brand/25 w-1.5"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="explore-results" className="scroll-mt-20 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-screen-2xl gap-7 lg:items-start">
          <aside className="border-ink/10 sticky top-20 hidden h-[calc(100vh-6.5rem)] w-64 shrink-0 [scrollbar-width:none] overflow-y-auto rounded-2xl border bg-white p-5 lg:block [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <SlidersHorizontal className="text-brand size-4" />
                Filters
              </h2>
              <button onClick={clearFilters} className="text-brand text-xs font-semibold hover:underline">
                Clear
              </button>
            </div>
            <FilterGroup title="Service category">
              <div className="space-y-1.5">
                {["All services", ...categories.map((category) => category.displayName)].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium ${selectedCategory === category ? "bg-brand-soft text-brand" : "text-ink/55 hover:bg-ink/[.035]"}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="City">
              <div className="space-y-1.5">
                {["All cities", ...availableCities].map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setSelectedArea("All areas");
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium ${selectedCity === city ? "bg-brand-soft text-brand" : "text-ink/55 hover:bg-ink/[.035]"}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </FilterGroup>
            <FilterGroup title="Service area">
              <div className="space-y-1.5">
                {["All areas", ...availableAreas].map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium ${selectedArea === area ? "bg-brand-soft text-brand" : "text-ink/55 hover:bg-ink/[.035]"}`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </FilterGroup>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Recommended professionals</h2>
                <p className="text-ink/45 mt-1 flex items-center gap-1.5 text-xs">
                  <UsersRound className="size-3.5" />
                  {filteredProviders.length} professionals match your search
                </p>
              </div>
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setAreMobileFiltersVisible((current) => !current)}
              >
                <Filter className="size-4" />
                Filters
              </Button>
            </div>
            {areMobileFiltersVisible && (
              <div className="border-ink/10 mb-5 rounded-2xl border bg-white p-4 lg:hidden">
                <div className="flex flex-wrap gap-2">
                  {["All services", ...categories.map((category) => category.displayName)].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selectedCategory === category ? "border-brand bg-brand-soft text-brand" : "border-ink/10 text-ink/55"}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-ink/40">City</p>
                <div className="flex flex-wrap gap-2">
                  {["All cities", ...availableCities].map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setSelectedArea("All areas");
                      }}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selectedCity === city ? "border-brand bg-brand-soft text-brand" : "border-ink/10 text-ink/55"}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-ink/40">Service area</p>
                <div className="flex flex-wrap gap-2">
                  {["All areas", ...availableAreas].map((area) => (
                    <button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${selectedArea === area ? "border-brand bg-brand-soft text-brand" : "border-ink/10 text-ink/55"}`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-brand mt-3">
                  Clear filters
                </Button>
              </div>
            )}
            {selectedCategory !== "All services" && (
              <div className="mb-4 flex items-center gap-2">
                <span className="bg-brand-soft text-brand flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("All services")}>
                    <X className="size-3" />
                  </button>
                </span>
              </div>
            )}
            {selectedArea !== "All areas" && (
              <div className="mb-4 flex items-center gap-2">
                <span className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                  <MapPin className="size-3" />
                  {selectedArea}
                  <button onClick={() => setSelectedArea("All areas")} aria-label="Remove area filter"><X className="size-3" /></button>
                </span>
              </div>
            )}
            {selectedCity !== "All cities" && (
              <div className="mb-4 flex items-center gap-2">
                <span className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
                  <MapPin className="size-3" />
                  {selectedCity}
                  <button
                    onClick={() => {
                      setSelectedCity("All cities");
                      setSelectedArea("All areas");
                    }}
                    aria-label="Remove city filter"
                  ><X className="size-3" /></button>
                </span>
              </div>
            )}
            {filteredProviders.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProviders.map((provider) => (
                  <PublicProviderSummaryCard key={provider.username} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="border-ink/15 grid min-h-72 place-items-center rounded-2xl border border-dashed bg-white p-8 text-center">
                <div>
                  <MapPin className="text-brand mx-auto size-8" />
                  <h3 className="mt-3 font-semibold">No providers match these filters</h3>
                  <p className="text-ink/45 mt-2 text-sm">Try another service, area, or search term.</p>
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function HeaderStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <p className="text-brand text-sm font-bold">{value}</p>
      <p className="text-ink/40 text-[11px] font-medium">{label}</p>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-ink/8 mt-5 border-t pt-5">
      <h3 className="text-ink/40 mb-3 text-[10px] font-bold tracking-wider uppercase">{title}</h3>
      {children}
    </div>
  );
}

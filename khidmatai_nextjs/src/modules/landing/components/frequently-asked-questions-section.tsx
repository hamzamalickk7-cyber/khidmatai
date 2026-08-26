import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SectionEyebrowLabel } from "@/modules/landing/components/section-eyebrow-label";

const frequentlyAskedQuestionList = [
  { question: "How does KhidmatAI choose providers?", answer: "Providers must match the requested service, area, availability, and any category-specific requirements before they can appear. Ranking can then consider relevant experience, responsiveness, and completed-job feedback." },
  { question: "Does verified mean the work is guaranteed?", answer: "No. Verification states exactly what KhidmatAI checked and when. It reduces uncertainty, but it cannot guarantee future behavior or workmanship. Booking records and support provide additional accountability." },
  { question: "When is my exact address shared?", answer: "You can search using an approximate area. Your precise service address should only be shared with the selected provider when it is needed to complete the booking." },
  { question: "Can I compare prices before booking?", answer: "For services that require diagnosis, you can request structured quotes showing labor, materials, travel, inclusions, and exclusions. Some standardized services may support direct booking." },
  { question: "What happens if the job changes after work starts?", answer: "The provider should propose a scope change with the additional work and price. You approve the change before it becomes part of the booking record." },
];

export function FrequentlyAskedQuestionsSection() {
  return (
    <section className="border-t border-ink/8 bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-screen-2xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:px-10">
        <div><SectionEyebrowLabel>Common questions</SectionEyebrowLabel><h2 className="mt-3 text-4xl sm:text-5xl">Know what to expect before you book.</h2><p className="mt-5 max-w-md leading-7 text-ink/60">Clear expectations are part of trust. If your question is not answered, talk to the KhidmatAI team.</p><Link href="mailto:hello@khidmatai.com" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-deep">Ask a question <ArrowRight className="size-4" /></Link></div>
        <div className="divide-y divide-ink/8 border-y border-ink/8">{frequentlyAskedQuestionList.map((item) => <details key={item.question} className="group"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left font-semibold text-ink [&::-webkit-details-marker]:hidden">{item.question}<ChevronDown className="size-5 shrink-0 text-ink/40 transition group-open:rotate-180" /></summary><p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-ink/60">{item.answer}</p></details>)}</div>
      </div>
    </section>
  );
}

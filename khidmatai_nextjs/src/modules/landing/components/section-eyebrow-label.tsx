import type { ReactNode } from "react";

interface SectionEyebrowLabelProps {
  children: ReactNode;
  isOnDarkBackground?: boolean;
}

export function SectionEyebrowLabel({ children, isOnDarkBackground = false }: SectionEyebrowLabelProps) {
  return (
    <p
      className={`text-xs font-bold uppercase tracking-[.2em] ${
        isOnDarkBackground ? "text-white/60" : "text-brand"
      }`}
    >
      {children}
    </p>
  );
}

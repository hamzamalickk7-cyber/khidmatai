import type { ReactNode } from "react";

interface SectionEyebrowLabelProps {
  children: ReactNode;
  isOnDarkBackground?: boolean;
}

export function SectionEyebrowLabel({ children, isOnDarkBackground = false }: SectionEyebrowLabelProps) {
  return (
    <p className={`text-xs font-bold tracking-[.2em] uppercase ${isOnDarkBackground ? "text-white/60" : "text-brand"}`}>
      {children}
    </p>
  );
}

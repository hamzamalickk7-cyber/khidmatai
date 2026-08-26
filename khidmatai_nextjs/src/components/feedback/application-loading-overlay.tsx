"use client";

import { motion } from "framer-motion";

interface ApplicationLoadingOverlayProps {
  title: string;
  description?: string;
}

/**
 * A full-viewport blocking overlay for actions the user must wait through
 * (e.g. signing out). Not used for ordinary route navigation — NextTopLoader
 * already covers that, and stacking a second, full-page loading indicator on
 * top of it reads as a jarring "blink" rather than useful feedback.
 */
export function ApplicationLoadingOverlay({ title, description }: ApplicationLoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative grid size-20 place-items-center">
          <motion.span
            className="absolute inset-0 rounded-full border-[3px] border-brand/15 border-t-brand"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-deep text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.75)]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            Kh
          </motion.span>
        </div>
        <p className="mt-6 text-lg font-semibold text-ink">{title}</p>
        {description && <p className="mt-2 max-w-sm text-sm leading-6 text-ink/50">{description}</p>}
      </div>
    </motion.div>
  );
}

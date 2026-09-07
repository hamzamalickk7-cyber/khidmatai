"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RouteLoadingStateProps {
  label?: string;
  description?: string;
  compact?: boolean;
}

// The shared loading placeholder for every route (via loading.tsx) and every
// client-side data fetch (profile pages' TanStack Query isLoading state) —
// one component, one look, everywhere in the app. `fixed inset-0` centers it
// against the actual browser viewport rather than the box it happens to sit
// in — an in-flow `min-h-screen` div still starts below whatever's above it
// in the DOM (a header, a sidebar), which visually centers it too low/high
// relative to the page instead of the screen. Positioning is deliberately
// unchanged from prior review — only the visual treatment below is new.
//
// Standard: z-[60], above the site header's sticky z-50, so it covers the
// whole screen including the header — this is the "whole page" case.
// `compact`: for the admin shell, which keeps its fixed sidebar (z-40) and
// sticky top bar (z-30) visible as chrome while only the content area
// loads — z-20 stays under both, and `lg:left-60` centers within the
// content column rather than the full screen (the sidebar occupies the
// left 15rem on large screens).
export function RouteLoadingState({ label = "Loading", description, compact = false }: RouteLoadingStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const gradientId = useId();

  const outerSize = compact ? 92 : 124;
  const ringSize = compact ? 58 : 76;
  const strokeWidth = compact ? 3 : 3.5;
  const radius = ringSize / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.3;

  return (
    <div
      className={`bg-background fixed inset-0 flex items-center justify-center overflow-hidden px-4 ${compact ? "z-20 lg:left-60" : "z-[60]"}`}
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(0 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.03) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 55% at 50% 50%, black, transparent 75%)",
        }}
      />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-6 text-center"
      >
        <div className="relative grid place-items-center" style={{ width: outerSize, height: outerSize }}>
          <motion.span
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ backgroundImage: "radial-gradient(circle, color-mix(in oklab, var(--brand) 42%, transparent) 0%, transparent 72%)" }}
            aria-hidden="true"
            animate={prefersReducedMotion ? undefined : { opacity: [0.4, 0.85, 0.4], scale: [0.85, 1.12, 0.85] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="border-brand/20 absolute inset-0 rounded-full border border-dashed"
            aria-hidden="true"
            animate={prefersReducedMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute inset-0"
            aria-hidden="true"
            animate={prefersReducedMotion ? undefined : { rotate: -360 }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "linear" }}
          >
            <span
              className="bg-brand absolute left-1/2 top-0 size-[7px] -translate-x-1/2 rounded-full"
              style={{ boxShadow: "0 0 10px 2px var(--brand)" }}
            />
          </motion.div>

          <div className="relative grid place-items-center" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize} className="absolute inset-0" aria-hidden="true">
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-brand/12"
              />
            </svg>

            <motion.svg
              width={ringSize}
              height={ringSize}
              className="absolute inset-0"
              aria-hidden="true"
              animate={prefersReducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity="0" />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity="1" />
                </linearGradient>
              </defs>
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
              />
            </motion.svg>

            <motion.span
              className={`from-brand to-brand-deep grid place-items-center rounded-2xl bg-gradient-to-br font-bold text-white ring-4 ring-white shadow-[0_12px_28px_-10px_rgba(22,101,52,0.6)] ${compact ? "size-8 text-[10px]" : "size-11 text-xs"}`}
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.07, 1] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            >
              Kh
            </motion.span>
          </div>
        </div>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <p className={`text-ink flex items-center justify-center gap-1 font-semibold tracking-tight ${compact ? "text-sm" : "text-base"}`}>
            {label}
            <span className="inline-flex" aria-hidden="true">
              {[0, 1, 2].map((dotIndex) => (
                <motion.span
                  key={dotIndex}
                  className="bg-brand mx-px inline-block size-1 rounded-full"
                  animate={prefersReducedMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: dotIndex * 0.2 }}
                />
              ))}
            </span>
          </p>
          {description && <p className="text-ink/45 mt-1.5 max-w-xs text-xs leading-5">{description}</p>}
        </motion.div>
      </motion.div>
    </div>
  );
}

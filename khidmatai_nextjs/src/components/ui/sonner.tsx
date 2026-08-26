"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(toasterProperties: ToasterProps) {
  return <SonnerToaster position="top-right" richColors closeButton toastOptions={{ className: "font-[var(--font-body-text)]" }} {...toasterProperties} />;
}

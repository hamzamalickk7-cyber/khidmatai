"use client";

import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export function Toaster(toasterProperties: ToasterProps) {
  return <SonnerToaster position="top-right" richColors closeButton toastOptions={{ className: "!border-0 font-[var(--font-body-text)]" }} {...toasterProperties} />;
}

"use client";

import { useEffect } from "react";
import { ApplicationErrorState } from "@/components/feedback/application-error-state";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ApplicationErrorState onRetry={reset} />;
}

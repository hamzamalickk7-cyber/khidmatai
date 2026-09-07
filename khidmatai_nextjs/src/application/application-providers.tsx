"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScrollToPageTopOnRouteChange } from "@/components/layout/scroll-to-page-top-on-route-change";

export function ApplicationProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToPageTopOnRouteChange />
      {children}
    </QueryClientProvider>
  );
}

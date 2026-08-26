"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { applicationReduxStore } from "./application-redux-store";

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
    <ReduxProvider store={applicationReduxStore}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ReduxProvider>
  );
}

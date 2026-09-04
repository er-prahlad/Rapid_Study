"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,   // 5 min — don't refetch if data is fresh
            gcTime:    1000 * 60 * 10,   // 10 min — keep in memory cache
            retry: 1,
            refetchOnWindowFocus: false,  // don't refetch when tab gains focus
            refetchOnMount: false,        // use cached data on component remount
            refetchOnReconnect: false,    // don't refetch on network reconnect
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

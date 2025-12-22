"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

// Cache time constants in milliseconds
export const CACHE_TIMES = {
  LEAGUES_STALE: 24 * 60 * 60 * 1000, // 24 hours
  PLAYERS_ACTIVE_STALE: 2 * 60 * 60 * 1000, // 2 hours
  PLAYERS_INACTIVE_STALE: 24 * 60 * 60 * 1000, // 24 hours
  MATCHES_ACTIVE_STALE: 1 * 60 * 60 * 1000, // 1 hour
  MATCHES_INACTIVE_STALE: 24 * 60 * 60 * 1000, // 24 hours
  GC_TIME: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_TIMES.LEAGUES_STALE,
        gcTime: CACHE_TIMES.GC_TIME,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient()
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export { getQueryClient }

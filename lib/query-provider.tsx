"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { get, set, del } from "idb-keyval"
import { useState, useEffect } from "react"

// IndexedDB persister with error handling
function createIDBPersister() {
  return {
    persistClient: async (client: unknown) => {
      try {
        await set("tennis-league-query-cache", client)
      } catch (error) {
        console.error("Failed to persist query cache:", error)
      }
    },
    restoreClient: async () => {
      try {
        return await get("tennis-league-query-cache")
      } catch (error) {
        console.error("Failed to restore query cache:", error)
        // Return undefined to skip restoration and fetch fresh data
        return undefined
      }
    },
    removeClient: async () => {
      try {
        await del("tennis-league-query-cache")
      } catch (error) {
        console.error("Failed to remove query cache:", error)
      }
    },
  }
}

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
  const [persister, setPersister] = useState<ReturnType<typeof createIDBPersister> | null>(null)

  useEffect(() => {
    setPersister(createIDBPersister())
  }, [])

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        buster: "v2", // Increment to invalidate old cache
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days instead of 30
      }}
      onSuccess={() => {
        // Resume queries after cache is restored
        queryClient.resumePausedMutations()
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

export { getQueryClient }

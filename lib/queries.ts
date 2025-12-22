"use client"

import { useQuery } from "@tanstack/react-query"
import { airtable } from "@/lib/airtable"
import { CACHE_TIMES } from "@/lib/query-provider"
import type { League, LeaguePlayer, Match } from "@/types"

// ============ QUERY KEYS ============
// Centralized query keys for consistency and easy invalidation

export const queryKeys = {
  leagues: ["leagues"] as const,
  league: (slug: string) => ["league", slug] as const,
  leaguePlayers: (leagueId: string) => ["leaguePlayers", leagueId] as const,
  matches: (leagueId: string) => ["matches", leagueId] as const,
  playerInfo: ["playerInfo"] as const,
}

// ============ LEAGUE QUERIES ============

export function useLeagues() {
  return useQuery({
    queryKey: queryKeys.leagues,
    queryFn: () => airtable.getLeagues(),
    staleTime: CACHE_TIMES.LEAGUES_STALE,
  })
}

export function useLeague(slug: string) {
  const { data: leagues, ...rest } = useLeagues()

  // Derive single league from the leagues query to avoid duplicate requests
  const league = leagues?.find((l) => l.slug === slug) ?? null

  return {
    ...rest,
    data: league,
  }
}

// ============ PLAYER QUERIES ============

export function useLeaguePlayers(leagueId: string | undefined, isActive: boolean = true) {
  return useQuery({
    queryKey: queryKeys.leaguePlayers(leagueId ?? ""),
    queryFn: () => airtable.getLeaguePlayers(leagueId!),
    enabled: !!leagueId,
    staleTime: isActive
      ? CACHE_TIMES.PLAYERS_ACTIVE_STALE
      : CACHE_TIMES.PLAYERS_INACTIVE_STALE,
  })
}

// ============ MATCH QUERIES ============

export function useMatches(leagueId: string | undefined, isActive: boolean = true) {
  return useQuery({
    queryKey: queryKeys.matches(leagueId ?? ""),
    queryFn: () => airtable.getMatches(leagueId!),
    enabled: !!leagueId,
    staleTime: isActive
      ? CACHE_TIMES.MATCHES_ACTIVE_STALE
      : CACHE_TIMES.MATCHES_INACTIVE_STALE,
  })
}

// ============ PLAYER INFO QUERIES ============

export function usePlayerInfo() {
  return useQuery({
    queryKey: queryKeys.playerInfo,
    queryFn: () => airtable.getPlayerInfo(),
    // Player info changes infrequently (only when new players register)
    staleTime: CACHE_TIMES.PLAYERS_ACTIVE_STALE,
  })
}

// ============ COMBINED HOOKS ============

// Convenience hook for league page that fetches all data
export function useLeagueData(slug: string) {
  const leagueQuery = useLeague(slug)
  const league = leagueQuery.data

  const playersQuery = useLeaguePlayers(league?.id, league?.isActive ?? true)
  const matchesQuery = useMatches(league?.id, league?.isActive ?? true)

  // Consider loading if:
  // 1. Actively fetching (isLoading/isFetching)
  // 2. OR no data yet and no error (waiting for first fetch to start on client)
  const leagueNotReady = leagueQuery.isLoading || leagueQuery.isFetching || (!league && !leagueQuery.isError)
  const playersNotReady = league && (playersQuery.isLoading || playersQuery.isFetching)
  const matchesNotReady = league && (matchesQuery.isLoading || matchesQuery.isFetching)

  const isLoading = leagueNotReady || playersNotReady || matchesNotReady

  const isError = leagueQuery.isError || playersQuery.isError || matchesQuery.isError

  return {
    league,
    players: playersQuery.data ?? [],
    matches: matchesQuery.data ?? [],
    isLoading: !!isLoading,
    isError,
    // Expose individual query states for more granular control
    queries: {
      league: leagueQuery,
      players: playersQuery,
      matches: matchesQuery,
    },
  }
}

// Hook for home page that fetches leagues and stats for each
export function useLeaguesWithStats() {
  const leaguesQuery = useLeagues()
  const leagues = leaguesQuery.data ?? []

  // Create individual queries for each league's players and matches
  // These will be cached independently
  const leagueIds = leagues.map((l) => l.id)

  // We can't use hooks conditionally, so we'll fetch stats differently
  // The home page will use separate useLeaguePlayers/useMatches calls

  return {
    leagues,
    isLoading: leaguesQuery.isLoading,
    isError: leaguesQuery.isError,
  }
}

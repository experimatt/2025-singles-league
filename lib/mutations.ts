"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { airtable } from "@/lib/airtable"
import { queryKeys } from "@/lib/queries"

// ============ MATCH MUTATIONS ============

interface CreateMatchData {
  player1Id: string
  player2Id: string
  winnerId: string
  score_summary: string
  completedAt: string
  leagueId: string
  notes?: string
}

export function useCreateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMatchData) => airtable.createMatch(data),
    onSuccess: (_data, variables) => {
      // Only invalidate matches for this league - not players or leagues
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches(variables.leagueId),
      })
    },
  })
}

// ============ PLAYER REGISTRATION MUTATIONS ============

interface RegisterForLeagueData {
  name: string
  username?: string
  email: string
  phone?: string
  location?: string
  leagueId: string
  division: string
  rating?: string
}

export function useRegisterForLeague() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterForLeagueData) => airtable.registerForLeague(data),
    onSuccess: (_data, variables) => {
      // Invalidate players for this league so the new player appears
      queryClient.invalidateQueries({
        queryKey: queryKeys.leaguePlayers(variables.leagueId),
      })
      // Also invalidate player info since a new player was created
      queryClient.invalidateQueries({
        queryKey: queryKeys.playerInfo,
      })
    },
  })
}

// For returning players who already have a PlayerInfo record
interface CreateLeaguePlayerData {
  playerId: string
  leagueId: string
  division: string
  rating?: string
}

export function useCreateLeaguePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeaguePlayerData) => airtable.createLeaguePlayer(data),
    onSuccess: (_data, variables) => {
      // Invalidate players for this league so the new player appears
      queryClient.invalidateQueries({
        queryKey: queryKeys.leaguePlayers(variables.leagueId),
      })
    },
  })
}

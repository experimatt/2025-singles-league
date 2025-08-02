"use client"

import { useState, useMemo } from "react"
import { Trophy } from "lucide-react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Player, Match, PlayerStats } from "@/types"
import { getDivisionColors } from "@/lib/utils"
import StandingsDesktop from "./standings-desktop"
import StandingsMobile from "./standings-mobile"

interface StandingsViewProps {
  players: Player[]
  matches: Match[]
}

export default function StandingsView({ players, matches }: StandingsViewProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>("All Divisions")
  const divisions = ["Leonardo", "Donatello", "Michelangelo", "Raphael"]
  const playerStats = useMemo(() => {
    const stats: { [playerId: string]: PlayerStats } = {}

    // Initialize stats for all players using their IDs
    players.forEach((player) => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        division: player.division,
        matchWins: 0,
        matchLosses: 0,
        setsWon: 0,
        setsLost: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDifferential: 0,
        totalMatches: 0,
        matchWinPercentage: 0,
        setWinPercentage: 0,
        gameWinPercentage: 0,
      }
    })

    // Calculate stats from matches using player IDs
    matches.forEach((match) => {
      const { player1Id, player2Id, winnerId, player1Sets, player2Sets, player1Games, player2Games } = match

              if (stats[player1Id]) {
          stats[player1Id].totalMatches++
          stats[player1Id].setsWon += player1Sets
          stats[player1Id].setsLost += player2Sets
          stats[player1Id].gamesWon += player1Games
          stats[player1Id].gamesLost += player2Games

          if (winnerId === player1Id) {
            stats[player1Id].matchWins++
          } else {
            stats[player1Id].matchLosses++
          }
        }

        if (stats[player2Id]) {
          stats[player2Id].totalMatches++
          stats[player2Id].setsWon += player2Sets
          stats[player2Id].setsLost += player1Sets
          stats[player2Id].gamesWon += player2Games
          stats[player2Id].gamesLost += player1Games

          if (winnerId === player2Id) {
            stats[player2Id].matchWins++
          } else {
            stats[player2Id].matchLosses++
          }
        }
    })

    // Calculate win percentages and differentials
    Object.values(stats).forEach((stat) => {
      stat.matchWinPercentage = stat.totalMatches > 0 ? (stat.matchWins / stat.totalMatches) * 100 : 0

      const totalSets = stat.setsWon + stat.setsLost
      stat.setWinPercentage = totalSets > 0 ? (stat.setsWon / totalSets) * 100 : 0

      const totalGames = stat.gamesWon + stat.gamesLost
      stat.gameWinPercentage = totalGames > 0 ? (stat.gamesWon / totalGames) * 100 : 0

      // Calculate games differential
      stat.gamesDifferential = stat.gamesWon - stat.gamesLost
    })

    return Object.values(stats)
  }, [players, matches])

  const filteredStats = useMemo(() => {
    const sortPlayers = (players: typeof playerStats) => {
      return players.sort((a, b) => {
        // Players who have played matches should rank higher than those who haven't
        if (a.totalMatches === 0 && b.totalMatches > 0) {
          return 1 // a goes after b
        }
        if (b.totalMatches === 0 && a.totalMatches > 0) {
          return -1 // a goes before b
        }
        
        // For players who have both played matches (or both haven't), sort by win percentage
        if (b.matchWinPercentage !== a.matchWinPercentage) {
          return b.matchWinPercentage - a.matchWinPercentage
        }
        
        // If win percentages are equal, sort by total wins
        return b.matchWins - a.matchWins
      })
    }

    if (selectedDivision === "All Divisions") {
      // Group by division and sort within each division
      const divisions = ["Leonardo", "Donatello", "Michelangelo", "Raphael"]
      const grouped: typeof playerStats = []
      
      divisions.forEach(division => {
        const divisionPlayers = playerStats.filter(stat => stat.division === division)
        const sortedDivisionPlayers = sortPlayers(divisionPlayers)
        grouped.push(...sortedDivisionPlayers)
      })
      
      return grouped
    } else {
      // Single division view
      const filtered = playerStats.filter((stat) => stat.division === selectedDivision)
      return sortPlayers(filtered)
    }
  }, [playerStats, selectedDivision])

  const matchesPlayedCount = useMemo(() => {
    if (selectedDivision === "All Divisions") {
      return matches.length
    } else {
      // Count matches where at least one player is in the selected division
      return matches.filter(match => {
        const player1 = players.find(p => p.id === match.player1Id)
        const player2 = players.find(p => p.id === match.player2Id)
        return player1?.division === selectedDivision || player2?.division === selectedDivision
      }).length
    }
  }, [matches, players, selectedDivision])

  return (
    <div className="space-y-6">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 pb-4">
              <Trophy className="w-5 h-5 text-green-600" />
              League Standings
            </CardTitle>
            <CardDescription>
              {selectedDivision === "All Divisions"
                ? "All divisions"
                : `${selectedDivision} division`}{" "}
              • {filteredStats.length} players • {matchesPlayedCount} matches played
            </CardDescription>
          </div>

          <Select value={selectedDivision} onValueChange={setSelectedDivision}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Divisions">
                <Badge className="text-xs border border-gray-300 text-gray-600 bg-gray-50">
                  All Divisions
                </Badge>
              </SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  <Badge className={`text-xs border ${getDivisionColors(division)}`}>
                    {division}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Desktop/Tablet View */}
        <div className="hidden md:block">
          <StandingsDesktop
            filteredStats={filteredStats}
            selectedDivision={selectedDivision}
            players={players}
            matches={matches}
          />
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          <StandingsMobile
            filteredStats={filteredStats}
            selectedDivision={selectedDivision}
            players={players}
            matches={matches}
          />
        </div>

        {filteredStats.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredStats.length} players •&nbsp;
            {selectedDivision === "All Divisions" 
              ? "Grouped by division, ranked within each division" 
              : "Sorted by match win percentage, then total match wins"}
          </div>
        )}
      </CardContent>
    </div>
  );
}

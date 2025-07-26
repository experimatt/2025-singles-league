"use client"

import { useState, useMemo } from "react"
import { Trophy, Medal, Award } from "lucide-react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Player, Match, PlayerStats } from "@/types"
import { getDivisionColors } from "@/lib/utils"

interface StandingsViewProps {
  players: Player[]
  matches: Match[]
}

export default function StandingsView({ players, matches }: StandingsViewProps) {
  const [selectedDivision, setSelectedDivision] = useState<string>("All Divisions")

  const divisions = ["Leonardo", "Donatello", "Michelangelo", "Raphael"]

  // Format name to show only last initial for privacy
  const formatNameForPrivacy = (fullName: string): string => {
    const parts = fullName.trim().split(' ')
    if (parts.length < 2) return fullName // Return as-is if no last name

    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0] // Get first letter of last name

    return `${firstName} ${lastInitial}`
  }

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
      const { player1_id, player2_id, winner_id, player1_sets, player2_sets, player1_games, player2_games } = match

      if (stats[player1_id]) {
        stats[player1_id].totalMatches++
        stats[player1_id].setsWon += player1_sets
        stats[player1_id].setsLost += player2_sets
        stats[player1_id].gamesWon += player1_games
        stats[player1_id].gamesLost += player2_games

        if (winner_id === player1_id) {
          stats[player1_id].matchWins++
        } else {
          stats[player1_id].matchLosses++
        }
      }

      if (stats[player2_id]) {
        stats[player2_id].totalMatches++
        stats[player2_id].setsWon += player2_sets
        stats[player2_id].setsLost += player1_sets
        stats[player2_id].gamesWon += player2_games
        stats[player2_id].gamesLost += player1_games

        if (winner_id === player2_id) {
          stats[player2_id].matchWins++
        } else {
          stats[player2_id].matchLosses++
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
        const player1 = players.find(p => p.id === match.player1_id)
        const player2 = players.find(p => p.id === match.player2_id)
        return player1?.division === selectedDivision || player2?.division === selectedDivision
      }).length
    }
  }, [matches, players, selectedDivision])

  const getRankIcon = (index: number, divisionIndex?: number) => {
    // For "All Divisions" view, calculate rank within division
    if (selectedDivision === "All Divisions" && divisionIndex !== undefined) {
      switch (divisionIndex) {
        case 0:
          return <Trophy className="w-5 h-5 text-yellow-500" />
        case 1:
          return <Medal className="w-5 h-5 text-gray-400" />
        case 2:
          return <Award className="w-5 h-5 text-amber-600" />
        default:
          return (
            <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-600">
              {divisionIndex + 1}
            </span>
          )
      }
    }

    // For single division view, use regular index
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-600">
            {index + 1}
          </span>
        )
    }
  }

  const getDifferentialColor = (differential: number) => {
    if (differential > 0) return "text-green-600"
    if (differential < 0) return "text-red-600"
    return "text-gray-600"
  }

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
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 bg-gray-50">
                  All Divisions
                </Badge>
              </SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  <Badge variant="outline" className={`text-xs ${getDivisionColors(division)}`}>
                    {division}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {/* Grouped Header Row */}
              <TableRow className="border-b-2">
                <TableHead
                  colSpan={3}
                  className="text-center font-bold bg-gray-100 text-gray-900 border-r"
                >
                  Player Info
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="text-center font-bold bg-blue-100 text-gray-900 border-r"
                >
                  Matches
                </TableHead>
                <TableHead
                  colSpan={2}
                  className="text-center font-bold bg-green-100 text-gray-900 border-r"
                >
                  Sets
                </TableHead>
                <TableHead
                  colSpan={3}
                  className="text-center font-bold bg-orange-100 text-gray-900"
                >
                  Games
                </TableHead>
              </TableRow>
              {/* Detail Header Row */}
              <TableRow>
                <TableHead className="w-16 text-gray-900">Rank</TableHead>
                <TableHead className="text-gray-900">Player</TableHead>
                <TableHead className="text-gray-900 border-r">&nbsp;&nbsp;Division</TableHead>
                {/* Matches Group */}
                <TableHead className="text-center bg-blue-50 text-gray-900">
                  Won
                </TableHead>
                <TableHead className="text-center bg-blue-50 text-gray-900">
                  Lost
                </TableHead>
                <TableHead className="text-center bg-blue-50 text-gray-900 border-r">
                  %
                </TableHead>
                {/* Sets Group */}
                <TableHead className="text-center bg-green-50 text-gray-900">
                  Won
                </TableHead>
                <TableHead className="text-center bg-green-50 text-gray-900 border-r">
                  Lost
                </TableHead>
                {/* Games Group */}
                <TableHead className="text-center bg-orange-50 text-gray-900">
                  Won
                </TableHead>
                <TableHead className="text-center bg-orange-50 text-gray-900">
                  Lost
                </TableHead>
                <TableHead className="text-center bg-orange-50 text-gray-900">
                  Diff
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-8 text-gray-500"
                  >
                    No players found for the selected division
                  </TableCell>
                </TableRow>
              ) : selectedDivision === "All Divisions" ? (
                // Group by divisions for "All Divisions" view
                 (() => {
                   const divisions = ["Leonardo", "Donatello", "Michelangelo", "Raphael"]
                   let globalIndex = 0
                   
                   return divisions.map((division, divisionIdx) => {
                     const divisionPlayers = filteredStats.filter(stat => stat.division === division)
                     globalIndex += divisionPlayers.length
                     const isAlternateDivision = divisionIdx % 2 === 1 // Shade odd-indexed divisions
                     
                     return divisionPlayers.map((stat, divisionIndex) => {
                       return (
                        <TableRow
                           key={stat.id}
                           className={isAlternateDivision ? "bg-muted/50" : ""}
                         >
                          <TableCell className="font-medium">
                            {getRankIcon(divisionIndex, divisionIndex)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatNameForPrivacy(stat.name)}
                          </TableCell>
                          <TableCell className="border-r">
                            <Badge variant="outline" className={`text-xs ${getDivisionColors(stat.division)}`}>
                              {stat.division}
                            </Badge>
                          </TableCell>
                          {/* Matches */}
                          <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                            {stat.matchWins}
                          </TableCell>
                          <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                            {stat.matchLosses}
                          </TableCell>
                          <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600 border-r">
                            {stat.matchWinPercentage.toFixed(0)}%
                          </TableCell>
                          {/* Sets */}
                          <TableCell className="text-center bg-green-50/30 font-normal text-gray-600">
                            {stat.setsWon}
                          </TableCell>
                          <TableCell className="text-center bg-green-50/30 font-normal text-gray-600 border-r">
                            {stat.setsLost}
                          </TableCell>
                          {/* Games */}
                          <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                            {stat.gamesWon}
                          </TableCell>
                          <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                            {stat.gamesLost}
                          </TableCell>
                          <TableCell
                            className={`text-center bg-orange-50/30 font-normal ${getDifferentialColor(
                              stat.gamesDifferential
                            )}`}
                          >
                            {stat.gamesDifferential > 0 ? "+" : ""}
                            {stat.gamesDifferential}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  }).flat()
                })()
              ) : (
                // Single division view
                filteredStats.map((stat, index) => (
                  <TableRow
                     key={stat.id}
                     className={index < 3 ? "bg-muted/50" : ""}
                   >
                     <TableCell className="font-medium">
                       {getRankIcon(index)}
                     </TableCell>
                     <TableCell className="font-medium">
                       {formatNameForPrivacy(stat.name)}
                     </TableCell>
                     <TableCell className="border-r">
                       <Badge variant="outline" className={`text-xs ${getDivisionColors(stat.division)}`}>
                         {stat.division}
                       </Badge>
                     </TableCell>
                    {/* Matches */}
                    <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                      {stat.matchWins}
                    </TableCell>
                    <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                      {stat.matchLosses}
                    </TableCell>
                    <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600 border-r">
                      {stat.matchWinPercentage.toFixed(0)}%
                    </TableCell>
                    {/* Sets */}
                    <TableCell className="text-center bg-green-50/30 font-normal text-gray-600">
                      {stat.setsWon}
                    </TableCell>
                    <TableCell className="text-center bg-green-50/30 font-normal text-gray-600 border-r">
                      {stat.setsLost}
                    </TableCell>
                    {/* Games */}
                    <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                      {stat.gamesWon}
                    </TableCell>
                    <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                      {stat.gamesLost}
                    </TableCell>
                    <TableCell
                      className={`text-center bg-orange-50/30 font-normal ${getDifferentialColor(
                        stat.gamesDifferential
                      )}`}
                    >
                      {stat.gamesDifferential > 0 ? "+" : ""}
                      {stat.gamesDifferential}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

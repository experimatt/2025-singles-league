"use client"

import { useMemo } from "react"
import { Calendar, Trophy, History } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Player, Match } from "@/types"
import { getDivisionColors, formatNameForPrivacy, formatDate, getDifferentialColor, formatMatchScore } from "@/lib/utils"

interface PlayerMatchesProps {
  playerId: string | null
  isOpen: boolean
  onClose: () => void
  players: Player[]
  matches: Match[]
}

export default function PlayerMatches({ 
  playerId, 
  isOpen, 
  onClose, 
  players, 
  matches 
}: PlayerMatchesProps) {
  const player = players.find(p => p.id === playerId)
  
  const playerMatches = useMemo(() => {
    if (!playerId) return []
    
    return matches
      .filter(match => match.player1Id === playerId || match.player2Id === playerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(match => {
        const opponent = match.player1Id === playerId
          ? players.find(p => p.id === match.player2Id)
          : players.find(p => p.id === match.player1Id)
        
        const isPlayer1 = match.player1Id === playerId
        const playerSets = isPlayer1 ? match.player1Sets : match.player2Sets
        const opponentSets = isPlayer1 ? match.player2Sets : match.player1Sets
        const playerGames = isPlayer1 ? match.player1Games : match.player2Games
        const opponentGames = isPlayer1 ? match.player2Games : match.player1Games
        const won = match.winnerId === playerId
        
        return {
          ...match,
          opponent,
          playerSets,
          opponentSets,
          playerGames,
          opponentGames,
          won
        }
      })
  }, [playerId, matches, players])

  const stats = useMemo(() => {
    const wins = playerMatches.filter(match => match.won).length
    const losses = playerMatches.length - wins
    const winPercentage = playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0
    
    // Calculate sets stats
    const totalSetsWon = playerMatches.reduce((sum, match) => sum + match.playerSets, 0)
    const totalSetsLost = playerMatches.reduce((sum, match) => sum + match.opponentSets, 0)
    const totalSets = totalSetsWon + totalSetsLost
    const setWinPercentage = totalSets > 0 ? (totalSetsWon / totalSets) * 100 : 0
    
    // Calculate games stats
    const totalGamesWon = playerMatches.reduce((sum, match) => sum + match.playerGames, 0)
    const totalGamesLost = playerMatches.reduce((sum, match) => sum + match.opponentGames, 0)
    const totalGames = totalGamesWon + totalGamesLost
    const gameWinPercentage = totalGames > 0 ? (totalGamesWon / totalGames) * 100 : 0
    const gamesDifferential = totalGamesWon - totalGamesLost
    
    return { 
      wins, 
      losses, 
      winPercentage, 
      total: playerMatches.length,
      totalSetsWon,
      totalSetsLost,
      setWinPercentage,
      totalGamesWon,
      totalGamesLost,
      gameWinPercentage,
      gamesDifferential
    }
  }, [playerMatches])



  if (!player) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pb-2">
            <History className="w-5 h-5" />
            {formatNameForPrivacy(player.name)}'s match history
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-muted-foreground space-y-1 flex flex-col items-start">
            <Badge
              variant="outline"
              className={`text-xs ${getDivisionColors(player.division)}`}
            >
              {player.division}
            </Badge>
            <div className="flex items-center">
              <span className="font-medium pr-1">Matches:</span> {stats.wins}-
              {stats.losses} ({stats.winPercentage.toFixed(0)}%)
            </div>
            <div className="flex items-center">
              <span className="font-medium pr-1">Sets:</span> {stats.totalSetsWon}-
              {stats.totalSetsLost} ({stats.setWinPercentage.toFixed(0)}%)
            </div>
            <div className="flex items-center">
              <span className="font-medium pr-1">Games:</span> {stats.totalGamesWon}
              -{stats.totalGamesLost} (
              <span className={getDifferentialColor(stats.gamesDifferential)}>
                {`${stats.gamesDifferential > 0 ? "+" : ""}${
                  stats.gamesDifferential
                }`}
              </span>
              )
            </div>
          </div>
        </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {playerMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No matches played yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Result</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerMatches.map((match) => (
                      <TableRow
                        key={match.id}
                        className={match.won ? "bg-green-50" : "bg-red-50"}
                      >
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(match.date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {match.opponent
                            ? formatNameForPrivacy(match.opponent.name)
                            : "Unknown"}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {formatMatchScore(match, playerId || undefined)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={match.won ? "default" : "secondary"}
                            className={
                              match.won
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700 text-white"
                            }
                          >
                            {match.won ? "W" : "L"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 italic">
                          {match.notes || ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {playerMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border ${
                      match.won
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {/* Opponent and Date */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-gray-900">
                        {match.opponent
                          ? formatNameForPrivacy(match.opponent.name)
                          : "Unknown"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(match.date)}
                        </span>
                      </div>
                    </div>

                    {/* Score and Result */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-mono text-gray-700 text-sm">
                        {formatMatchScore(match, playerId || undefined)}
                      </div>
                      <Badge
                        variant={match.won ? "default" : "secondary"}
                        className={
                          match.won
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }
                      >
                        {match.won ? "W" : "L"}
                      </Badge>
                    </div>

                    {/* Notes */}
                    {match.notes && (
                      <div className="text-sm text-gray-600 italic">
                        {match.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
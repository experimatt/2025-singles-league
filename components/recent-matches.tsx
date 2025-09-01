"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Trophy, Calendar, Users } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Match, Player } from "@/types"
import { formatDate, formatNameForPrivacy, getDivisionColors, formatMatchScore } from "@/lib/utils"
import PlayerMatches from "@/components/player-matches"

interface RecentMatchesProps {
  matches: Match[]
  players: Player[]
}

export default function RecentMatches({ matches, players }: RecentMatchesProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  // Get the last 3 matches, sorted by date (most recent first)
  const recentMatches = matches
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId)
  }

  const handleClosePlayerMatches = () => {
    setSelectedPlayerId(null)
  }



  if (recentMatches.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-700">Recent Matches</h2>
        </div>
        <p className="text-gray-500">No matches have been played yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <Accordion type="single" collapsible defaultValue="recent-matches">
          <AccordionItem value="recent-matches">
            <AccordionTrigger className="text-center justify-center gap-2">
              Recent Matches
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-6">
                <div className="space-y-3">
                  {recentMatches.map((match) => {
                    const player1 = players.find(p => p.id === match.player1Id)
                    const player2 = players.find(p => p.id === match.player2Id)
                    
                    if (!player1 || !player2) return null

                    const isPlayer1Winner = match.winnerId === match.player1Id
                    const winner = isPlayer1Winner ? player1 : player2
                    const loser = isPlayer1Winner ? player2 : player1

                    return (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePlayerClick(winner.id)}
                                className="font-medium hover:text-blue-600 hover:underline transition-colors cursor-pointer text-sm text-gray-700"
                              >
                                {formatNameForPrivacy(winner.name)}
                              </button>
                            </div>
                            <span className="text-gray-400 text-sm">defeated</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePlayerClick(loser.id)}
                                className="font-medium hover:text-blue-600 hover:underline transition-colors cursor-pointer text-sm text-gray-700"
                              >
                                {formatNameForPrivacy(loser.name)}
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(match.date)}</span>
                            </div>
                            <Badge variant="outline" className={`text-xs ${getDivisionColors(winner.division)}`}>
                              {winner.division}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-left min-w-[120px]">
                          <div className="text-sm font-mono font-medium text-gray-800">
                            {formatMatchScore(match, match.winnerId)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Score
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <PlayerMatches
        playerId={selectedPlayerId}
        isOpen={!!selectedPlayerId}
        onClose={handleClosePlayerMatches}
        players={players}
        matches={matches}
      />
    </>
  )
} 
"use client"

import type React from "react"
import { useState } from "react"
import { Send, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { formatNameForPrivacy } from "@/lib/utils"
import type { LeaguePlayer, Match, League } from "@/types"

interface MatchFormProps {
  players: LeaguePlayer[]
  matches: Match[]
  league: League
  onSubmit: (matchData: {
    player1Id: string
    player2Id: string
    winnerId: string
    score_summary: string
    completedAt: string
    notes?: string
  }) => Promise<void>
  onSuccess?: () => void
}

export default function MatchForm({ players, matches, league, onSubmit, onSuccess }: MatchFormProps) {
  const [formData, setFormData] = useState({
    player1Id: "",
    player2Id: "",
    set1Player1Score: "",
    set1Player2Score: "",
    set2Player1Score: "",
    set2Player2Score: "",
    set3Player1Score: "",
    set3Player2Score: "",
    completedAt: new Date().toLocaleDateString('en-CA'),
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const existingMatchError = "A match between these players has already been reported for this day (±1)"

  // Get player by ID
  const getPlayer = (id: string) => players.find(p => p.id === id)

  // Helper function to check for existing matches between two players within date range
  const checkForExistingMatch = (player1Id: string, player2Id: string, matchDate: string) => {
    if (!player1Id || !player2Id || !matchDate) return null

    const selectedDate = new Date(matchDate)
    const oneDayInMs = 24 * 60 * 60 * 1000

    return matches.find(match => {
      // Check if this match involves the same two players (in either order)
      const matchPlayerIds = [match.player1Id, match.player2Id]
      const samePlayers = matchPlayerIds.includes(player1Id) && matchPlayerIds.includes(player2Id)

      if (!samePlayers) return false

      // Check if match date is within +/- 1 day
      const existingMatchDate = new Date(match.date)
      const dateDiff = Math.abs(selectedDate.getTime() - existingMatchDate.getTime())

      return dateDiff <= oneDayInMs
    })
  }

  // Helper function to determine who won a set
  const getSetWinner = (player1Score: string, player2Score: string) => {
    const p1Score = Number.parseInt(player1Score)
    const p2Score = Number.parseInt(player2Score)
    if (isNaN(p1Score) || isNaN(p2Score)) return null
    return p1Score > p2Score ? 1 : 2
  }

  // Helper function to validate pro set score (8 or 10 games, winning by 2)
  const isValidProSet = (player1Score: string, player2Score: string) => {
    const p1Score = Number.parseInt(player1Score)
    const p2Score = Number.parseInt(player2Score)

    if (isNaN(p1Score) || isNaN(p2Score)) return false

    // Pro set must be to 8 or 10 games
    const maxScore = Math.max(p1Score, p2Score)
    if (maxScore !== 8 && maxScore !== 10) return false

    // Must win by 2 games
    const scoreDiff = Math.abs(p1Score - p2Score)
    if (scoreDiff < 2) return false

    return true
  }

  // Helper function to check if the match is ready for submission
  const isSubmissionValid = () => {
    if (!formData.player1Id || !formData.player2Id) return false

    const matchResult = getMatchResult()

    // Check for pro set match (single set to 8 or 10)
    const hasSet1 = formData.set1Player1Score && formData.set1Player2Score
    const hasSet2 = formData.set2Player1Score && formData.set2Player2Score
    const hasSet3 = formData.set3Player1Score && formData.set3Player2Score

    // If only set 1 has scores, check if it's a valid pro set
    if (hasSet1 && !hasSet2 && !hasSet3) {
      return isValidProSet(formData.set1Player1Score, formData.set1Player2Score)
    }

    // Otherwise, require at least 2 sets with a winner
    return matchResult.setsPlayed >= 2 && (matchResult.player1Sets === 2 || matchResult.player2Sets === 2)
  }

  // Helper function to determine match winner and format scores
  const getMatchResult = () => {
    const sets = [
      {
        p1: formData.set1Player1Score,
        p2: formData.set1Player2Score,
      },
      {
        p1: formData.set2Player1Score,
        p2: formData.set2Player2Score,
      },
      {
        p1: formData.set3Player1Score,
        p2: formData.set3Player2Score,
      },
    ]

    let player1Sets = 0
    let player2Sets = 0
    const setScoresFromPlayer1Perspective: string[] = []

    // Check if this is a pro set match (only set 1 has scores)
    const hasSet1 = formData.set1Player1Score && formData.set1Player2Score
    const hasSet2 = formData.set2Player1Score && formData.set2Player2Score
    const hasSet3 = formData.set3Player1Score && formData.set3Player2Score

    if (hasSet1 && !hasSet2 && !hasSet3 && isValidProSet(formData.set1Player1Score, formData.set1Player2Score)) {
      // Pro set match
      const winner = getSetWinner(formData.set1Player1Score, formData.set1Player2Score)
      if (winner === 1) {
        player1Sets = 1
      } else if (winner === 2) {
        player2Sets = 1
      }
      setScoresFromPlayer1Perspective.push(`${formData.set1Player1Score}-${formData.set1Player2Score}`)
    } else {
      // Standard match
      for (let i = 0; i < sets.length; i++) {
        const set = sets[i]
        if (set.p1 && set.p2) {
          const winner = getSetWinner(set.p1, set.p2)
          if (winner === 1) {
            player1Sets++
          } else if (winner === 2) {
            player2Sets++
          }
          setScoresFromPlayer1Perspective.push(`${set.p1}-${set.p2}`)
        }
      }
    }

    const winnerId = player1Sets > player2Sets ? formData.player1Id : formData.player2Id
    const player1IsWinner = player1Sets > player2Sets
    const setsFromWinnerPerspective = player1IsWinner ? `${player1Sets}-${player2Sets}` : `${player2Sets}-${player1Sets}`

    // Convert scores to winner's perspective for storage
    // If Player 1 won, scores are already correct; if Player 2 won, flip each set score
    const setResultsFromWinnerPerspective = player1IsWinner
      ? setScoresFromPlayer1Perspective
      : setScoresFromPlayer1Perspective.map(score => {
          const [p1Score, p2Score] = score.split('-')
          return `${p2Score}-${p1Score}`
        })

    return {
      winnerId,
      player1Sets,
      player2Sets,
      setResults: setResultsFromWinnerPerspective,
      setsPlayed: setScoresFromPlayer1Perspective.length,
      setsFromWinnerPerspective,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.player1Id || !formData.player2Id) {
      setError("Please select both players")
      setIsSubmitting(false)
      return
    }

    if (formData.player1Id === formData.player2Id) {
      setError("Please select different players")
      setIsSubmitting(false)
      return
    }

    // Check for existing match within date range
    const existingMatch = checkForExistingMatch(formData.player1Id, formData.player2Id, formData.completedAt)
    if (existingMatch) {
      setError(existingMatchError)
      setIsSubmitting(false)
      return
    }

    // Check for valid match format
    const hasSet1 = formData.set1Player1Score && formData.set1Player2Score
    const hasSet2 = formData.set2Player1Score && formData.set2Player2Score
    const hasSet3 = formData.set3Player1Score && formData.set3Player2Score

    // Check if this is a pro set match (only set 1 filled)
    if (hasSet1 && !hasSet2 && !hasSet3) {
      if (!isValidProSet(formData.set1Player1Score, formData.set1Player2Score)) {
        setError("Pro set must be to 8 or 10 games with a 2-game margin")
        setIsSubmitting(false)
        return
      }
    } else if (!hasSet1 || !hasSet2) {
      setError("Please enter scores for at least the first two sets")
      setIsSubmitting(false)
      return
    }

    // Validate all entered scores are positive
    const allScores = [
      formData.set1Player1Score,
      formData.set1Player2Score,
      formData.set2Player1Score,
      formData.set2Player2Score,
      hasSet3 ? formData.set3Player1Score : "",
      hasSet3 ? formData.set3Player2Score : "",
    ].filter(score => score !== "")

    for (const score of allScores) {
      const numScore = Number.parseInt(score)
      if (numScore < 0) {
        setError("Scores must be positive numbers")
        setIsSubmitting(false)
        return
      }
    }

    const matchResult = getMatchResult()

    const matchData = {
      player1Id: formData.player1Id,
      player2Id: formData.player2Id,
      winnerId: matchResult.winnerId,
      score_summary: matchResult.setResults.join(", "),
      completedAt: formData.completedAt,
      notes: formData.notes || undefined,
    }

    try {
      await onSubmit(matchData)

      // Show success toast
      toast.success("Scores recorded, thank you!")

      // Reset form
      setFormData({
        player1Id: "",
        player2Id: "",
        set1Player1Score: "",
        set1Player2Score: "",
        set2Player1Score: "",
        set2Player2Score: "",
        set3Player1Score: "",
        set3Player2Score: "",
        completedAt: new Date().toLocaleDateString('en-CA'),
        notes: "",
      })

      // Call onSuccess callback to refresh data and redirect
      onSuccess?.()
    } catch (err) {
      setError("Failed to submit match. Please try again.")
    }

    setIsSubmitting(false)
  }

  const availablePlayer2Options = players.filter((p) => p.id !== formData.player1Id)
  const matchResult = getMatchResult()

  // Check for existing match in real-time
  const existingMatch = formData.player1Id && formData.player2Id && formData.completedAt
    ? checkForExistingMatch(formData.player1Id, formData.player2Id, formData.completedAt)
    : null

  // Use league divisions for grouping
  const divisionOrder = league.divisions
  const hasDivisions = divisionOrder.length > 0

  const createPlayerGroups = (playerList: typeof players) => {
    // If no divisions, return all players in a single ungrouped list
    if (!hasDivisions) {
      return [{
        label: "All Players",
        options: playerList
          .sort((a, b) => a.playerName.localeCompare(b.playerName))
          .map(player => ({
            value: player.id,
            label: formatNameForPrivacy(player.playerName),
          }))
      }]
    }

    // Group by divisions
    const groups = divisionOrder.map(division => ({
      label: division,
      options: playerList
        .filter(player => player.division === division)
        .sort((a, b) => a.playerName.localeCompare(b.playerName))
        .map(player => ({
          value: player.id,
          label: formatNameForPrivacy(player.playerName),
        }))
    })).filter(group => group.options.length > 0)

    // Add unassigned players if any
    const unassignedPlayers = playerList.filter(player => !player.division || !divisionOrder.includes(player.division))
    if (unassignedPlayers.length > 0) {
      groups.push({
        label: "Unassigned",
        options: unassignedPlayers
          .sort((a, b) => a.playerName.localeCompare(b.playerName))
          .map(player => ({
            value: player.id,
            label: formatNameForPrivacy(player.playerName),
          }))
      })
    }

    return groups
  }

  const playerGroups = createPlayerGroups(players)
  const availablePlayer2Groups = createPlayerGroups(availablePlayer2Options)

  const player1 = getPlayer(formData.player1Id)
  const player2 = getPlayer(formData.player2Id)
  const winner = getPlayer(matchResult.winnerId)

  return (
    <div className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pb-2">
          <Send className="w-5 h-5 text-blue-600" />
          Record scores
        </CardTitle>
        <CardDescription>
          Enter match details and scores below.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {(error || existingMatch) && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <AlertDescription className="text-red-600">
              {existingMatch ? existingMatchError : error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Players Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1">Player 1</Label>
              <Combobox
                groups={playerGroups}
                value={formData.player1Id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, player1Id: value }))
                }
                placeholder="Select first player"
                searchPlaceholder="Search players..."
                emptyText="No players found."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player2">Player 2</Label>
              <Combobox
                groups={availablePlayer2Groups}
                value={formData.player2Id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, player2Id: value }))
                }
                placeholder="Select second player"
                searchPlaceholder="Search players..."
                emptyText="No players found."
                disabled={!formData.player1Id}
              />
            </div>
          </div>

          {/* Match Date */}
          <div className="space-y-2">
            <Label htmlFor="completedAt" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Match date
            </Label>
            <Input
              id="completedAt"
              type="date"
              value={formData.completedAt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  completedAt: e.target.value,
                }))
              }
            />
          </div>

          {/* Set Scores - Tennis Broadcast Style */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Set Scores</Label>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* Header row */}
                <div className="text-sm font-medium text-gray-600"></div>
                <div className="text-sm font-medium text-gray-600 text-center">Set 1</div>
                <div className="text-sm font-medium text-gray-600 text-center">Set 2</div>
                <div className="text-sm font-medium text-gray-600 text-center">Set 3</div>

                {/* Player 1 row */}
                <div className="text-sm font-medium text-gray-800">
                  {player1 ? formatNameForPrivacy(player1.playerName) : "Player 1"}
                </div>
                <Input
                  id="set1_player1"
                  type="number"
                  min="0"
                  value={formData.set1Player1Score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      set1Player1Score: e.target.value,
                    }))
                  }
                  placeholder=""
                  className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label={`Set 1 ${
                    player1
                      ? formatNameForPrivacy(player1.playerName)
                      : "Player 1"
                  } score`}
                />
                <Input
                  id="set2_player1"
                  type="number"
                  min="0"
                  value={formData.set2Player1Score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      set2Player1Score: e.target.value,
                    }))
                  }
                  placeholder=""
                  className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label={`Set 2 ${
                    player1
                      ? formatNameForPrivacy(player1.playerName)
                      : "Player 1"
                  } score`}
                />
                <Input
                  id="set3_player1"
                  type="number"
                  min="0"
                  value={formData.set3Player1Score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      set3Player1Score: e.target.value,
                    }))
                  }
                  placeholder=""
                  className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label={`Set 3 ${
                    player1
                      ? formatNameForPrivacy(player1.playerName)
                      : "Player 1"
                  } score`}
                />

                {/* Player 2 row */}
                <div className="text-sm font-medium text-gray-800">
                  {player2 ? formatNameForPrivacy(player2.playerName) : "Player 2"}
                </div>
                <Input
                  id="set1_player2"
                  type="number"
                  min="0"
                  value={formData.set1Player2Score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      set1Player2Score: e.target.value,
                    }))
                  }
                  placeholder=""
                  className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label={`Set 1 ${
                    player2
                      ? formatNameForPrivacy(player2.playerName)
                      : "Player 2"
                  } score`}
                />
                <Input
                  id="set2_player2"
                  type="number"
                  min="0"
                  value={formData.set2Player2Score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      set2Player2Score: e.target.value,
                    }))
                  }
                  placeholder=""
                  className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label={`Set 2 ${
                    player2
                      ? formatNameForPrivacy(player2.playerName)
                      : "Player 2"
                  } score`}
                />
                <Input
                  id="set3_player2"
                  type="number"
                  min="0"
                  value={formData.set3Player2Score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      set3Player2Score: e.target.value,
                    }))
                  }
                  placeholder=""
                  className="text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  aria-label={`Set 3 ${
                    player2
                      ? formatNameForPrivacy(player2.playerName)
                      : "Player 2"
                  } score`}
                />
              </div>

              {/* Help text */}
              <div className="mt-3 text-xs text-gray-600">
                <strong>Match Formats:</strong> Standard matches require at least 2 sets. Pro set matches (to 8 or 10 games) only require Set 1.
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Any additional notes about the match..."
              rows={3}
            />
          </div>

          {/* Match Result Preview */}
          {isSubmissionValid() && !error && !existingMatch && (
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Preview of results
              </Label>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Winner:</strong>{" "}
                  {winner
                    ? formatNameForPrivacy(winner.playerName)
                    : ""}
                </p>
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Sets:</strong> {matchResult.setsFromWinnerPerspective}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Score:</strong> {matchResult.setResults.join(", ")}
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting || !isSubmissionValid() || !!existingMatch}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting scores...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit scores
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </div>
  )
}

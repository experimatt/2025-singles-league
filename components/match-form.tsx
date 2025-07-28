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
import type { Player } from "@/types"

interface MatchFormProps {
  players: Player[]
  onSubmit: (matchData: any) => void
  onSuccess?: () => void // Optional callback for successful submission
}

export default function MatchForm({ players, onSubmit, onSuccess }: MatchFormProps) {
  const [formData, setFormData] = useState({
    player1: "",
    player2: "",
    set1_player1_score: "",
    set1_player2_score: "",
    set2_player1_score: "",
    set2_player2_score: "",
    set3_player1_score: "",
    set3_player2_score: "",
    completedAt: new Date().toLocaleDateString('en-CA'),
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Helper function to determine who won a set
  const getSetWinner = (player1Score: string, player2Score: string) => {
    const p1Score = Number.parseInt(player1Score)
    const p2Score = Number.parseInt(player2Score)
    if (isNaN(p1Score) || isNaN(p2Score)) return null
    return p1Score > p2Score ? 1 : 2
  }

  // Helper function to check if the match is ready for submission
  const isSubmissionValid = () => {
    if (!formData.player1 || !formData.player2) return false

    const matchResult = getMatchResult()
    return matchResult.setsPlayed >= 2 && (matchResult.player1Sets === 2 || matchResult.player2Sets === 2)
  }

  // Helper function to determine match winner and format scores
  const getMatchResult = () => {
    const sets = [
      {
        p1: formData.set1_player1_score,
        p2: formData.set1_player2_score,
      },
      {
        p1: formData.set2_player1_score,
        p2: formData.set2_player2_score,
      },
      {
        p1: formData.set3_player1_score,
        p2: formData.set3_player2_score,
      },
    ]

    let player1Sets = 0
    let player2Sets = 0
    const setResults = []

    for (let i = 0; i < sets.length; i++) {
      const set = sets[i]
      if (set.p1 && set.p2) {
        const winner = getSetWinner(set.p1, set.p2)
        if (winner === 1) {
          player1Sets++
          setResults.push(`${set.p1}-${set.p2}`)
        } else if (winner === 2) {
          player2Sets++
          setResults.push(`${set.p2}-${set.p1}`)
        }
      }
    }

    const matchWinner = player1Sets > player2Sets ? formData.player1 : formData.player2
    return {
      winner: matchWinner,
      player1Sets,
      player2Sets,
      setResults,
      setsPlayed: setResults.length,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.player1 || !formData.player2) {
      setError("Please select both players")
      setIsSubmitting(false)
      return
    }

    if (formData.player1 === formData.player2) {
      setError("Please select different players")
      setIsSubmitting(false)
      return
    }

    // Check that at least two sets have scores
    const hasSet1 = formData.set1_player1_score && formData.set1_player2_score
    const hasSet2 = formData.set2_player1_score && formData.set2_player2_score
    const hasSet3 = formData.set3_player1_score && formData.set3_player2_score

    if (!hasSet1 || !hasSet2) {
      setError("Please enter scores for at least the first two sets")
      setIsSubmitting(false)
      return
    }

    // Validate all entered scores are positive
    const allScores = [
      formData.set1_player1_score,
      formData.set1_player2_score,
      formData.set2_player1_score,
      formData.set2_player2_score,
      hasSet3 ? formData.set3_player1_score : "",
      hasSet3 ? formData.set3_player2_score : "",
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

    // Get player divisions
    const player1Division = players.find((p) => p.name === formData.player1)?.division || ""
    const player2Division = players.find((p) => p.name === formData.player2)?.division || ""

    // For cross-division matches, use the first player's division
    const matchDivision = player1Division === player2Division ? player1Division : player1Division

    const matchData = {
      player1: formData.player1,
      player2: formData.player2,
      set1_player1_score: hasSet1 ? Number.parseInt(formData.set1_player1_score) : null,
      set1_player2_score: hasSet1 ? Number.parseInt(formData.set1_player2_score) : null,
      set2_player1_score: hasSet2 ? Number.parseInt(formData.set2_player1_score) : null,
      set2_player2_score: hasSet2 ? Number.parseInt(formData.set2_player2_score) : null,
      set3_player1_score: hasSet3 ? Number.parseInt(formData.set3_player1_score) : null,
      set3_player2_score: hasSet3 ? Number.parseInt(formData.set3_player2_score) : null,
      winner: matchResult.winner,
      sets_score: `${matchResult.player1Sets}-${matchResult.player2Sets}`,
      score_summary: matchResult.setResults.join(", "),
      division: matchDivision,
      completedAt: formData.completedAt,
      notes: formData.notes,
    }

    try {
      await onSubmit(matchData)

      // Show success toast
      toast.success("Scores recorded, thank you!")

      // Reset form
      setFormData({
        player1: "",
        player2: "",
        set1_player1_score: "",
        set1_player2_score: "",
        set2_player1_score: "",
        set2_player2_score: "",
        set3_player1_score: "",
        set3_player2_score: "",
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

  const availablePlayer2Options = players.filter((p) => p.name !== formData.player1)
  const matchResult = getMatchResult()

  // Transform players to combobox format
  const playerOptions = players.map((player) => ({
    value: player.name,
    label: `${formatNameForPrivacy(player.name)} (${player.division})`,
  }))

  const availablePlayer2ComboboxOptions = availablePlayer2Options.map((player) => ({
    value: player.name,
    label: `${formatNameForPrivacy(player.name)} (${player.division})`,
  }))

  return (
    <div className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pb-2">
          <Send className="w-5 h-5 text-blue-600" />
          Record match scores
        </CardTitle>
        <CardDescription>
          Enter the match details and scores below.<br />At least 2 sets are required.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Players Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1">Player 1</Label>
              <Combobox
                options={playerOptions}
                value={formData.player1}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, player1: value }))}
                placeholder="Select first player"
                searchPlaceholder="Search players..."
                emptyText="No players found."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player2">Player 2</Label>
              <Combobox
                options={availablePlayer2ComboboxOptions}
                value={formData.player2}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, player2: value }))}
                placeholder="Select second player"
                searchPlaceholder="Search players..."
                emptyText="No players found."
                disabled={!formData.player1}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, completedAt: e.target.value }))}
            />
          </div>

          {/* Set Scores */}
          <div className="space-y-4">
            {/* Set 1 */}
            <div className="space-y-2">
              <Label>Set 1 *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="set1_player1"
                  type="number"
                  min="0"
                  value={formData.set1_player1_score}
                  onChange={(e) => setFormData((prev) => ({ ...prev, set1_player1_score: e.target.value }))}
                  placeholder={`${formData.player1 ? formatNameForPrivacy(formData.player1) : "Player 1"} score`}
                  aria-label={`Set 1 ${formData.player1 ? formatNameForPrivacy(formData.player1) : "Player 1"} score`}
                />
                <Input
                  id="set1_player2"
                  type="number"
                  min="0"
                  value={formData.set1_player2_score}
                  onChange={(e) => setFormData((prev) => ({ ...prev, set1_player2_score: e.target.value }))}
                  placeholder={`${formData.player2 ? formatNameForPrivacy(formData.player2) : "Player 2"} score`}
                  aria-label={`Set 1 ${formData.player2 ? formatNameForPrivacy(formData.player2) : "Player 2"} score`}
                />
              </div>
            </div>

            {/* Set 2 */}
            <div className="space-y-2">
              <Label>Set 2 *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="set2_player1"
                  type="number"
                  min="0"
                  value={formData.set2_player1_score}
                  onChange={(e) => setFormData((prev) => ({ ...prev, set2_player1_score: e.target.value }))}
                  placeholder={`${formData.player1 ? formatNameForPrivacy(formData.player1) : "Player 1"} score`}
                  aria-label={`Set 2 ${formData.player1 ? formatNameForPrivacy(formData.player1) : "Player 1"} score`}
                />
                <Input
                  id="set2_player2"
                  type="number"
                  min="0"
                  value={formData.set2_player2_score}
                  onChange={(e) => setFormData((prev) => ({ ...prev, set2_player2_score: e.target.value }))}
                  placeholder={`${formData.player2 ? formatNameForPrivacy(formData.player2) : "Player 2"} score`}
                  aria-label={`Set 2 ${formData.player2 ? formatNameForPrivacy(formData.player2) : "Player 2"} score`}
                />
              </div>
            </div>

            {/* Set 3 */}
            <div className="space-y-2">
              <Label>Set 3 (if applicable)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="set3_player1"
                  type="number"
                  min="0"
                  value={formData.set3_player1_score}
                  onChange={(e) => setFormData((prev) => ({ ...prev, set3_player1_score: e.target.value }))}
                  placeholder={`${formData.player1 ? formatNameForPrivacy(formData.player1) : "Player 1"} score`}
                  aria-label={`Set 3 ${formData.player1 ? formatNameForPrivacy(formData.player1) : "Player 1"} score`}
                />
                <Input
                  id="set3_player2"
                  type="number"
                  min="0"
                  value={formData.set3_player2_score}
                  onChange={(e) => setFormData((prev) => ({ ...prev, set3_player2_score: e.target.value }))}
                  placeholder={`${formData.player2 ? formatNameForPrivacy(formData.player2) : "Player 2"} score`}
                  aria-label={`Set 3 ${formData.player2 ? formatNameForPrivacy(formData.player2) : "Player 2"} score`}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about the match..."
              rows={3}
            />
          </div>

          {/* Match Result Preview */}
          {isSubmissionValid() && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Preview of results</Label>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Winner:</strong> {matchResult.winner ? formatNameForPrivacy(matchResult.winner) : ""}
                </p>
                <p className="text-sm text-blue-800 mb-1">
                  <strong>Sets:</strong> {matchResult.player1Sets}-{matchResult.player2Sets}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Score:</strong> {matchResult.setResults.join(", ")}
                </p>
              </div>
            </div>
          )}

          <Button type="submit" variant="default" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || !isSubmissionValid()}>
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

"use client"

import type React from "react"

import { useState } from "react"
import { Send, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Player } from "@/types"

interface MatchFormProps {
  players: Player[]
  onSubmit: (matchData: any) => void
}

export default function MatchForm({ players, onSubmit }: MatchFormProps) {
  const [formData, setFormData] = useState({
    player1: "",
    player2: "",
    player1_score: "",
    player2_score: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

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

    if (!formData.player1_score || !formData.player2_score) {
      setError("Please enter scores for both players")
      setIsSubmitting(false)
      return
    }

    const player1Score = Number.parseInt(formData.player1_score)
    const player2Score = Number.parseInt(formData.player2_score)

    if (player1Score < 0 || player2Score < 0) {
      setError("Scores must be positive numbers")
      setIsSubmitting(false)
      return
    }

    // Determine winner
    const winner = player1Score > player2Score ? formData.player1 : formData.player2

    // Get player divisions
    const player1Division = players.find((p) => p.name === formData.player1)?.division || ""
    const player2Division = players.find((p) => p.name === formData.player2)?.division || ""

    // For cross-division matches, use the first player's division
    const matchDivision = player1Division === player2Division ? player1Division : player1Division

    const matchData = {
      player1: formData.player1,
      player2: formData.player2,
      player1_score: player1Score,
      player2_score: player2Score,
      winner,
      division: matchDivision,
      notes: formData.notes,
    }

    try {
      await onSubmit(matchData)
      setSuccess(true)

      // Reset form
      setFormData({
        player1: "",
        player2: "",
        player1_score: "",
        player2_score: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      })

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError("Failed to submit match. Please try again.")
    }

    setIsSubmitting(false)
  }

  const availablePlayer2Options = players.filter((p) => p.name !== formData.player1)

  return (
    <div className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Submit Match Result
        </CardTitle>
        <CardDescription>
          Enter the match details and scores. The winner will be determined automatically.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Match submitted successfully! Check the standings to see updated results.
            </AlertDescription>
          </Alert>
        )}

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
              <Select
                value={formData.player1}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, player1: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select first player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.name}>
                      {player.name} ({player.division})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="player2">Player 2</Label>
              <Select
                value={formData.player2}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, player2: value }))}
                disabled={!formData.player1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select second player" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlayer2Options.map((player) => (
                    <SelectItem key={player.id} value={player.name}>
                      {player.name} ({player.division})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1_score">{formData.player1 || "Player 1"} Score</Label>
              <Input
                id="player1_score"
                type="number"
                min="0"
                value={formData.player1_score}
                onChange={(e) => setFormData((prev) => ({ ...prev, player1_score: e.target.value }))}
                placeholder="Enter score"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player2_score">{formData.player2 || "Player 2"} Score</Label>
              <Input
                id="player2_score"
                type="number"
                min="0"
                value={formData.player2_score}
                onChange={(e) => setFormData((prev) => ({ ...prev, player2_score: e.target.value }))}
                placeholder="Enter score"
              />
            </div>
          </div>

          {/* Match Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Match Date
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about the match..."
              rows={3}
            />
          </div>

          {/* Winner Preview */}
          {formData.player1_score && formData.player2_score && formData.player1 && formData.player2 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Winner:</strong>{" "}
                {Number.parseInt(formData.player1_score) > Number.parseInt(formData.player2_score)
                  ? formData.player1
                  : formData.player2}{" "}
                (
                {Number.parseInt(formData.player1_score) > Number.parseInt(formData.player2_score)
                  ? formData.player1_score
                  : formData.player2_score}{" "}
                -{" "}
                {Number.parseInt(formData.player1_score) > Number.parseInt(formData.player2_score)
                  ? formData.player2_score
                  : formData.player1_score}
                )
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting Match...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Match Result
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </div>
  )
}

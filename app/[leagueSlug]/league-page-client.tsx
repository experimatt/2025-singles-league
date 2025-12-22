"use client"

import { useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Trophy, Users, Plus, Loader2, UserPlus, ChevronLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import StandingsView from "@/components/standings-view"
import MatchForm from "@/components/match-form"
import RecentMatches from "@/components/recent-matches"
import PlayerSignupForm from "@/components/player-signup-form"
import { useLeagueData } from "@/lib/queries"
import { useCreateMatch } from "@/lib/mutations"
import { getDivisionColors } from "@/lib/utils"

interface LeaguePageClientProps {
  leagueSlug: string
}

export default function LeaguePageClient({ leagueSlug }: LeaguePageClientProps) {
  const [activeTab, setActiveTab] = useState("standings")

  const { league, players, matches, isLoading } = useLeagueData(leagueSlug)
  const createMatchMutation = useCreateMatch()

  const handleMatchSubmit = async (matchData: {
    player1Id: string
    player2Id: string
    winnerId: string
    score_summary: string
    completedAt: string
    notes?: string
  }) => {
    if (!league) return

    await createMatchMutation.mutateAsync({
      ...matchData,
      leagueId: league.id,
    })
  }

  const handleMatchSuccess = () => {
    // Cache is automatically invalidated by the mutation
    setActiveTab("standings")
  }

  const handleSignupSuccess = () => {
    // Cache is automatically invalidated by the mutation in PlayerSignupForm
    setActiveTab("standings")
  }

  // Calculate division summaries using league's divisions
  const divisionSummaries = () => {
    if (!league) return []

    return league.divisions.map(division => {
      const divisionPlayers = players.filter(player => player.division === division)
      const divisionMatches = matches.filter(match => {
        const player1 = players.find(p => p.id === match.player1Id)
        const player2 = players.find(p => p.id === match.player2Id)
        return player1?.division === division && player2?.division === division
      })

      // Calculate total possible matches for round-robin: n * (n-1) / 2
      const totalPossibleMatches = divisionPlayers.length > 1
        ? (divisionPlayers.length * (divisionPlayers.length - 1)) / 2
        : 0

      const matchPercentage = totalPossibleMatches > 0
        ? Math.round((divisionMatches.length / totalPossibleMatches) * 100)
        : 0

      return {
        division,
        playerCount: divisionPlayers.length,
        matchCount: divisionMatches.length,
        totalPossibleMatches,
        matchPercentage
      }
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-lime-400 animate-spin" />
          <p className="text-lg text-gray-600">Loading tennis league data...</p>
        </div>
      </div>
    )
  }

  if (!league) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            All Leagues
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              {league.name} Tennis League
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Track standings and record match results
          </p>
        </div>

        {/* Division Overview */}
        {league.divisions.length > 0 && matches.length > 0 && (
          <div className="mb-4">
            <Accordion type="single" collapsible className="max-w-6xl mx-auto">
              <AccordionItem value="division-summary">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{players.length} Players</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>{matches.length} Matches Played</span>
                  </div>
                </div>
                <AccordionTrigger className="text-center justify-center gap-2">
                  Division Breakdown
                </AccordionTrigger>
                <AccordionContent>
                  <div className={`grid grid-cols-2 md:grid-cols-${Math.min(league.divisions.length, 4)} gap-4`}>
                    {divisionSummaries().map((summary) => (
                      <Card
                        key={summary.division}
                        className={`p-4 text-center border-2 ${getDivisionColors(
                          summary.division,
                          league.divisions
                        )}`}
                      >
                        <h3 className="font-medium mb-2">{summary.division}</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{summary.playerCount} Players</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Trophy className="w-3 h-3" />
                            <span>{summary.matchCount} Matches ({summary.matchPercentage}%)</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Recent Matches */}
        {matches.length > 0 && (
          <div className="mb-8">
            <RecentMatches matches={matches} players={players} league={league} />
          </div>
        )}

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="standings"
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Standings
              </TabsTrigger>
              <TabsTrigger
                value="submit"
                className="flex items-center gap-2"
                disabled={!league.isActive}
                title={!league.isActive ? "This league has ended" : undefined}
              >
                <Plus className="w-4 h-4" />
                Record scores
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="flex items-center gap-2"
                disabled={!league.isActive}
                title={!league.isActive ? "This league has ended" : undefined}
              >
                <UserPlus className="w-4 h-4" />
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="mt-6">
              <StandingsView players={players} matches={matches} league={league} />
            </TabsContent>

            <TabsContent value="submit" className="mt-6">
              <MatchForm
                players={players}
                matches={matches}
                league={league}
                onSubmit={handleMatchSubmit}
                onSuccess={handleMatchSuccess}
              />
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <PlayerSignupForm
                league={league}
                onSuccess={handleSignupSuccess}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Airtable • Hosted on GitHub Pages</p>
        </div>
      </div>
    </div>
  )
}

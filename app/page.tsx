"use client"

import { useState, useEffect } from "react"
import { Trophy, Users, Plus, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import StandingsView from "@/components/standings-view"
import MatchForm from "@/components/match-form"
import RecentMatches from "@/components/recent-matches"
import { airtable } from "@/lib/airtable"
import { mockPlayers, mockMatches } from "@/static/mockData"
import type { Player, Match } from "@/types"
import { getDivisionColors } from "@/lib/utils"

export default function TennisLeagueApp() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("standings")

  const loadData = async () => {
    try {
      setLoading(true)

      // Load real data from Airtable
      const [playersData, matchesData] = await Promise.all([airtable.getPlayers(), airtable.getMatches()])

      setPlayers(playersData)
      setMatches(matchesData)
    } catch (error) {
      console.error("Error loading data from Airtable:", error)
      // Fall back to mock data on error
      setPlayers(mockPlayers)
      setMatches(mockMatches)
    } finally {
      setLoading(false)
    }
  }

  // Initial data load
  useEffect(() => {
    loadData()
  }, [])

  const handleMatchSubmit = async (matchData: any) => {
    console.log("Submitting match to Airtable:", matchData)
    // Submit to Airtable - let MatchForm handle success/error states
    await airtable.createMatch(matchData)
  }

  const handleMatchSuccess = () => {
    // Refresh data and switch to standings tab
    loadData()
    setActiveTab("standings")
  }

  // Calculate division summaries
  const divisionSummaries = () => {
    const divisions = ["Leonardo", "Donatello", "Michelangelo", "Raphael"]

    return divisions.map(division => {
      const divisionPlayers = players.filter(player => player.division === division)
      const divisionMatches = matches.filter(match => {
        const player1 = players.find(p => p.id === match.player1Id)
        const player2 = players.find(p => p.id === match.player2Id)
        return player1?.division === division || player2?.division === division
      })

      return {
        division,
        playerCount: divisionPlayers.length,
        matchCount: divisionMatches.length
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-lime-400 animate-spin" />
          <p className="text-lg text-gray-600">Loading tennis league data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Summer Tennis League
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Track standings and record match results
          </p>
        </div>

        {/* Division Overview */}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {divisionSummaries().map((summary) => (
                    <Card
                      key={summary.division}
                      className={`p-4 text-center border-2 ${getDivisionColors(
                        summary.division
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
                          <span>{summary.matchCount} Matches</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Recent Matches */}
        <div className="mb-8">
          <RecentMatches matches={matches} players={players} />
        </div>

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="standings"
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Standings
              </TabsTrigger>
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Record scores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standings" className="mt-6">
              <StandingsView players={players} matches={matches} />
            </TabsContent>

            <TabsContent value="submit" className="mt-6">
              <MatchForm
                players={players}
                matches={matches}
                onSubmit={handleMatchSubmit}
                onSuccess={handleMatchSuccess}
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
  );
}

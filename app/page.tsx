"use client"

import { useState, useEffect } from "react"
import { Trophy, Users, Plus, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
import StandingsView from "@/components/standings-view"
import MatchForm from "@/components/match-form"
import { airtable } from "@/lib/airtable"
import { mockPlayers, mockMatches } from "@/static/mockData"
import type { Player, Match } from "@/types"
// import { getDivisionColors } from "@/lib/utils"

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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">Summer Tennis League</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">Track standings and submit match results</p>

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
        </div>

        {/* Division Badges */}
        {/* <div className="flex flex-wrap justify-center gap-2 mb-8">
          {["Leonardo", "Donatello", "Michelangelo", "Raphael"].map((division) => (
            <Badge key={division} variant="outline" className={`px-3 py-1 w-[calc(50%-4px)] md:w-auto text-center ${getDivisionColors(division)}`}>
              {division}
            </Badge>
          ))}
        </div> */}

        {/* Main Content */}
        <Card className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="standings" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Standings
                </TabsTrigger>
                <TabsTrigger value="submit" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Submit Match Scores
                </TabsTrigger>
              {/* <a
                href="https://airtable.com/app4aWZlRyqQfMuZr/shrSehNBPgJkAWb2e"
                target="_blank"
                rel="noopener noreferrer"
                className="justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Submit Match Scores
              </a> */}
            </TabsList>

            <TabsContent value="standings" className="mt-6">
              <StandingsView players={players} matches={matches} />
            </TabsContent>

            <TabsContent value="submit" className="mt-6">
              <MatchForm players={players} onSubmit={handleMatchSubmit} onSuccess={handleMatchSuccess} />
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

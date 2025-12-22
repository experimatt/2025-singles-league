"use client"

import Link from "next/link"
import { Loader2, Trophy, Calendar, Users, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLeagues, useLeaguePlayers, useMatches } from "@/lib/queries"
import type { League } from "@/types"
import { formatDate } from "@/lib/utils"

// Component to fetch and display stats for a single league
function LeagueStats({ leagueId, isActive }: { leagueId: string; isActive: boolean }) {
  const { data: players } = useLeaguePlayers(leagueId, isActive)
  const { data: matches } = useMatches(leagueId, isActive)

  if (!players || !matches) return null

  return (
    <>
      <span>{players.length} players</span>
      <span className="text-gray-300">•</span>
      <span>{matches.length} matches</span>
      <span className="text-gray-300">•</span>
    </>
  )
}

function LeagueCard({ league }: { league: League }) {
  return (
    <Link href={`/${league.slug}`} className="block">
      <Card className="p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-300 h-full">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {league.name}
              </h2>
              {league.isActive && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Active
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2 flex-wrap">
                <Users className="w-4 h-4" />
                <LeagueStats leagueId={league.id} isActive={league.isActive} />
                <span>{league.divisions.length} divisions</span>
              </div>

              {(league.startDate || league.endDate) && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {league.startDate ? formatDate(league.startDate) : "Start TBD"}
                    {" — "}
                    {league.endDate ? formatDate(league.endDate) : "Ongoing"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </Card>
    </Link>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>{message}</p>
    </div>
  )
}

export default function Home() {
  const { data: leagues, isLoading, isError } = useLeagues()

  // Separate leagues into current and past
  const currentLeagues = (leagues ?? []).filter((league) => {
    if (league.isActive) return true
    if (!league.endDate) return true
    return new Date(league.endDate) >= new Date()
  })

  const pastLeagues = (leagues ?? []).filter((league) => {
    if (league.isActive) return false
    if (!league.endDate) return false
    return new Date(league.endDate) < new Date()
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-lime-400 animate-spin" />
          <p className="text-lg text-gray-600">Loading tennis leagues...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Failed to load leagues. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Discord Tennis League
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Select a league to view standings and record matches
          </p>
        </div>

        {!leagues || leagues.length === 0 ? (
          <EmptyState message="No leagues found. Please set up a league in Airtable." />
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Current Leagues */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                Current Leagues
                {currentLeagues.length > 0 && (
                  <Badge variant="secondary">{currentLeagues.length}</Badge>
                )}
              </h2>
              {currentLeagues.length === 0 ? (
                <EmptyState message="No current leagues. Check back soon!" />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentLeagues.map((league) => (
                    <LeagueCard key={league.id} league={league} />
                  ))}
                </div>
              )}
            </section>

            {/* Past Leagues */}
            <section>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                Past Leagues
                {pastLeagues.length > 0 && (
                  <Badge variant="secondary">{pastLeagues.length}</Badge>
                )}
              </h2>
              {pastLeagues.length === 0 ? (
                <EmptyState message="No past leagues yet." />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pastLeagues.map((league) => (
                    <LeagueCard key={league.id} league={league} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by Airtable • Hosted on GitHub Pages</p>
        </div>
      </div>
    </div>
  )
}

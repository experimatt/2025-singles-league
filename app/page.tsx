"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trophy } from "lucide-react"
import { airtable } from "@/lib/airtable"
import type { League } from "@/types"

export default function Home() {
  const router = useRouter()
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAndRedirect = async () => {
      try {
        const activeLeague = await airtable.getActiveLeague()

        if (activeLeague) {
          router.replace(`/${activeLeague.slug}`)
          return
        }

        // No active league - show league list
        const allLeagues = await airtable.getLeagues()
        setLeagues(allLeagues)
        setLoading(false)
      } catch (err) {
        console.error("Error loading leagues:", err)
        setError("Failed to load leagues. Please try again.")
        setLoading(false)
      }
    }

    loadAndRedirect()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-lime-400 animate-spin" />
          <p className="text-lg text-gray-600">Loading tennis leagues...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  // No active league - show list of all leagues
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Tennis Leagues
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Select a league to view standings and record matches
          </p>
        </div>

        {leagues.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No leagues found. Please set up a league in Airtable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {leagues.map((league) => (
              <a
                key={league.id}
                href={`/${league.slug}`}
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-300"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {league.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {league.divisions.length} divisions
                </p>
                {league.startDate && (
                  <p className="text-sm text-gray-400 mt-1">
                    {league.startDate} - {league.endDate || "Ongoing"}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

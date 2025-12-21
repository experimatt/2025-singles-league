import { airtable } from "@/lib/airtable"
import LeaguePageClient from "./league-page-client"

// Generate static params for all leagues at build time
export async function generateStaticParams() {
  try {
    const leagues = await airtable.getLeagues()
    return leagues.map((league) => ({
      leagueSlug: league.slug,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Return empty array - pages will be generated on-demand or show 404
    return []
  }
}

export default async function LeaguePage({
  params,
}: {
  params: Promise<{ leagueSlug: string }>
}) {
  const { leagueSlug } = await params
  return <LeaguePageClient leagueSlug={leagueSlug} />
}

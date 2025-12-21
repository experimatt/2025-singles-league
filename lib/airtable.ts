import Airtable from 'airtable'
import type { League, PlayerInfo, LeaguePlayer, Match } from "@/types"

const AIRTABLE_PERSONAL_ACCESS_TOKEN = process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID

if (AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  Airtable.configure({
    apiKey: AIRTABLE_PERSONAL_ACCESS_TOKEN
  })
} else {
  console.error('No Airtable credentials found')
}

const base = Airtable.base(AIRTABLE_BASE_ID!)

class AirtableAPI {
  // ============ LEAGUES ============

  async getLeagues(): Promise<League[]> {
    try {
      const records = await base('Leagues').select().all()

      return records.map(record => {
        // Handle divisions - could be multi-select (array) or text (string)
        const divisionsRaw = record.get('divisions')
        let divisions: string[] = []

        if (Array.isArray(divisionsRaw)) {
          // Multi-select field returns an array
          divisions = divisionsRaw as string[]
        } else if (typeof divisionsRaw === 'string') {
          // Text field returns a comma-separated string
          divisions = divisionsRaw.split(',').map(d => d.trim()).filter(Boolean)
        }

        return {
          id: record.id,
          name: record.get('name') as string || '',
          slug: record.get('slug') as string || '',
          divisions,
          isActive: record.get('isActive') as boolean || false,
          startDate: record.get('startDate') as string || '',
          endDate: record.get('endDate') as string || '',
        }
      })
    } catch (error) {
      console.error('Error fetching leagues:', error)
      throw error
    }
  }

  async getActiveLeague(): Promise<League | null> {
    try {
      const leagues = await this.getLeagues()
      return leagues.find(l => l.isActive) || leagues[0] || null
    } catch (error) {
      console.error('Error fetching active league:', error)
      throw error
    }
  }

  async getLeagueBySlug(slug: string): Promise<League | null> {
    try {
      const leagues = await this.getLeagues()
      return leagues.find(l => l.slug === slug) || null
    } catch (error) {
      console.error('Error fetching league by slug:', error)
      throw error
    }
  }

  // ============ PLAYER INFO ============

  async getPlayerInfo(): Promise<PlayerInfo[]> {
    try {
      const records = await base('PlayerInfo').select().all()

      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string || '',
        username: record.get('username') as string || '',
        email: record.get('email') as string || '',
        phone: record.get('phone') as string || '',
        location: record.get('location') as string || '',
        createdAt: record.get('createdAt') as string || '',
      }))
    } catch (error) {
      console.error('Error fetching player info:', error)
      throw error
    }
  }

  async getPlayerInfoByEmail(email: string): Promise<PlayerInfo | null> {
    try {
      const records = await base('PlayerInfo')
        .select({
          filterByFormula: `{email} = "${email}"`,
          maxRecords: 1
        })
        .all()

      if (records.length === 0) return null

      const record = records[0]
      return {
        id: record.id,
        name: record.get('name') as string || '',
        username: record.get('username') as string || '',
        email: record.get('email') as string || '',
        phone: record.get('phone') as string || '',
        location: record.get('location') as string || '',
        createdAt: record.get('createdAt') as string || '',
      }
    } catch (error) {
      console.error('Error fetching player info by email:', error)
      throw error
    }
  }

  async createPlayerInfo(data: {
    name: string
    email: string
    phone?: string
    location?: string
  }): Promise<PlayerInfo> {
    try {
      const record = await base('PlayerInfo').create({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        location: data.location || '',
        createdAt: new Date().toISOString().split('T')[0],
      })

      return {
        id: record.id,
        name: record.get('name') as string || '',
        email: record.get('email') as string || '',
        phone: record.get('phone') as string || '',
        location: record.get('location') as string || '',
        createdAt: record.get('createdAt') as string || '',
      }
    } catch (error) {
      console.error('Error creating player info:', error)
      throw error
    }
  }

  // ============ LEAGUE PLAYERS ============

  async getLeaguePlayers(leagueId: string): Promise<LeaguePlayer[]> {
    try {
      const records = await base('LeaguePlayers').select().all()

      // Filter by league ID (linked field is an array)
      const filteredRecords = records.filter(record => {
        const leagueIds = record.get('league') as string[] || []
        return leagueIds.includes(leagueId)
      })

      return filteredRecords.map(record => {
        const playerIds = record.get('player') as string[] || []
        const leagueIds = record.get('league') as string[] || []

        // playerName can be a lookup field (array) or a direct field (string)
        const playerNameRaw = record.get('playerName')
        let playerName = ''
        if (Array.isArray(playerNameRaw)) {
          playerName = playerNameRaw[0] || ''
        } else if (typeof playerNameRaw === 'string') {
          playerName = playerNameRaw
        }

        return {
          id: record.id,
          playerId: playerIds[0] || '',
          leagueId: leagueIds[0] || '',
          playerName,
          division: record.get('group') as string || '',
          rating: record.get('rating') as string || '',
        }
      })
    } catch (error) {
      console.error('Error fetching league players:', error)
      throw error
    }
  }

  async createLeaguePlayer(data: {
    playerId: string
    leagueId: string
    division: string
    rating?: string
  }): Promise<LeaguePlayer> {
    try {
      const record = await base('LeaguePlayers').create({
        player: [data.playerId],
        league: [data.leagueId],
        group: data.division,
        rating: data.rating || '',
      })

      const playerIds = record.get('player') as string[] || []
      const leagueIds = record.get('league') as string[] || []

      // playerName can be a lookup field (array) or a direct field (string)
      const playerNameRaw = record.get('playerName')
      let playerName = ''
      if (Array.isArray(playerNameRaw)) {
        playerName = playerNameRaw[0] || ''
      } else if (typeof playerNameRaw === 'string') {
        playerName = playerNameRaw
      }

      return {
        id: record.id,
        playerId: playerIds[0] || '',
        leagueId: leagueIds[0] || '',
        playerName,
        division: record.get('group') as string || '',
        rating: record.get('rating') as string || '',
      }
    } catch (error) {
      console.error('Error creating league player:', error)
      throw error
    }
  }

  // Combined signup method: creates PlayerInfo if needed, then creates LeaguePlayer
  async registerForLeague(data: {
    name: string
    email: string
    phone?: string
    location?: string
    leagueId: string
    division: string
    rating?: string
  }): Promise<LeaguePlayer> {
    try {
      // Check if PlayerInfo exists by email
      let playerInfo = await this.getPlayerInfoByEmail(data.email)

      // Create PlayerInfo if not exists
      if (!playerInfo) {
        playerInfo = await this.createPlayerInfo({
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
        })
      }

      // Create LeaguePlayer record
      const leaguePlayer = await this.createLeaguePlayer({
        playerId: playerInfo.id,
        leagueId: data.leagueId,
        division: data.division,
        rating: data.rating,
      })

      return leaguePlayer
    } catch (error) {
      console.error('Error registering for league:', error)
      throw error
    }
  }

  // ============ MATCHES ============

  async getMatches(leagueId?: string): Promise<Match[]> {
    try {
      const records = await base('Matches').select().all()

      const matches = records.map(record => {
        // Get player record IDs from the players array (these are LeaguePlayer IDs)
        const playersArray = record.get('players') as string[] || []
        const player1Id = playersArray[0] || ''
        const player2Id = playersArray[1] || ''

        // Handle winner field (it's an array of record IDs)
        const winnerIds = record.get('winner') as string[] || []
        const winnerId = winnerIds[0] || ''

        // Get league ID from the match (linked field)
        const leagueIds = record.get('league') as string[] || []
        const matchLeagueId = leagueIds[0] || ''

        // Parse score field to calculate detailed scoring
        const scoreField = record.get('score') as string || ''
        let player1Sets = 0
        let player2Sets = 0
        let player1_total_games = 0
        let player2_total_games = 0
        const setsDetail: Array<{
          player1Games: number
          player2Games: number
          setWinnerId: string
        }> = []

        if (scoreField && winnerId) {
          // Parse scores like "6-2, 6-0" or "6-0, 3-6, 11-9"
          // Scores are reported from the WINNER'S perspective
          const sets = scoreField.split(',').map(set => set.trim())
          const winnerIsPlayer1 = winnerId === player1Id

          sets.forEach((set, setIndex) => {
            const scores = set.split('-').map(s => parseInt(s.trim()) || 0)
            if (scores.length === 2) {
              const [winnerScore, loserScore] = scores

              // Assign scores based on who actually won the match
              let p1Score, p2Score
              if (winnerIsPlayer1) {
                p1Score = winnerScore
                p2Score = loserScore
              } else {
                p1Score = loserScore
                p2Score = winnerScore
              }

              // For 3rd set (index 2), it's always a tiebreak - count as 1-0 games
              let p1Games, p2Games
              if (setIndex === 2) {
                // Third set tiebreak: winner gets 1 game, loser gets 0
                if (p1Score > p2Score) {
                  p1Games = 1
                  p2Games = 0
                } else {
                  p1Games = 0
                  p2Games = 1
                }
              } else {
                // Regular set: use actual game scores
                p1Games = p1Score
                p2Games = p2Score
              }

              // Add to total games
              player1_total_games += p1Games
              player2_total_games += p2Games

              // Determine set winner ID
              let setWinnerId = ''
              if (p1Score > p2Score) {
                player1Sets++
                setWinnerId = player1Id
              } else if (p2Score > p1Score) {
                player2Sets++
                setWinnerId = player2Id
              }

              // Store set details (keep original scores for display)
              setsDetail.push({
                player1Games: setIndex === 2 ? p1Score : p1Games,
                player2Games: setIndex === 2 ? p2Score : p2Games,
                setWinnerId
              })
            }
          })
        }

        return {
          id: record.id,
          player1Id,
          player2Id,
          player1Sets,
          player2Sets,
          player1Games: player1_total_games,
          player2Games: player2_total_games,
          setsDetail,
          winnerId,
          date: record.get('completedAt') as string || '',
          notes: record.get('notes') as string || '',
          leagueId: matchLeagueId,
        }
      })

      // Filter by league if provided
      if (leagueId) {
        return matches.filter(m => m.leagueId === leagueId)
      }

      return matches
    } catch (error) {
      console.error('Error fetching matches:', error)
      throw error
    }
  }

  async createMatch(matchData: {
    player1Id: string  // LeaguePlayer ID
    player2Id: string  // LeaguePlayer ID
    winnerId: string   // LeaguePlayer ID
    score_summary: string
    completedAt: string
    leagueId: string
    notes?: string
  }) {
    try {
      const record = await base('Matches').create({
        players: [matchData.player1Id, matchData.player2Id],
        winner: [matchData.winnerId],
        completedAt: matchData.completedAt,
        score: matchData.score_summary,
        league: [matchData.leagueId],
        notes: matchData.notes || '',
        source: 'API'
      })

      return record
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
    }
  }

  // ============ UTILITIES ============

  async testConnection() {
    try {
      if (!AIRTABLE_PERSONAL_ACCESS_TOKEN) {
        return {
          success: false,
          message: 'No Airtable credentials found. Please set NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN'
        }
      }

      if (!AIRTABLE_BASE_ID) {
        return {
          success: false,
          message: 'Base ID is missing. Please check your NEXT_PUBLIC_AIRTABLE_BASE_ID environment variable.'
        }
      }

      // Test Leagues table access
      console.log('Testing Leagues table access...')
      const leagues = await this.getLeagues()
      console.log(`Found ${leagues.length} leagues`)

      const activeLeague = await this.getActiveLeague()
      if (activeLeague) {
        // Test LeaguePlayers table access
        console.log('Testing LeaguePlayers table access...')
        const players = await this.getLeaguePlayers(activeLeague.id)
        console.log(`Found ${players.length} players in ${activeLeague.name}`)

        // Test Matches table access
        console.log('Testing Matches table access...')
        const matches = await this.getMatches(activeLeague.id)
        console.log(`Found ${matches.length} matches in ${activeLeague.name}`)

        return {
          success: true,
          message: `Connection successful! Found ${leagues.length} leagues, ${players.length} players and ${matches.length} matches in ${activeLeague.name}.`
        }
      }

      return {
        success: true,
        message: `Connection successful! Found ${leagues.length} leagues (no active league set).`
      }
    } catch (error) {
      console.error('Connection test error:', error)

      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

export const airtable = new AirtableAPI()

import Airtable from 'airtable'
import type { Player, Match } from "@/types"

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
  async getPlayers(): Promise<Player[]> {
    try {
      const records = await base('Players').select().all()

      return records.map(record => ({
        id: record.id,
        name: record.get('name') as string || '',
        division: record.get('group') as string || '',
        email: '',
      }))
    } catch (error) {
      console.error('Error fetching players:', error)
      throw error
    }
  }

  async getMatches(): Promise<Match[]> {
    try {
      const records = await base('Matches').select().all()

      return records.map(record => {
        // Get player record IDs from the players array
        const playersArray = record.get('players') as string[] || []
        const player1_id = playersArray[0] || ''
        const player2_id = playersArray[1] || ''

        // Handle winner field (it's an array of record IDs)
        const winnerIds = record.get('winner') as string[] || []
        const winner_id = winnerIds[0] || ''

        // Parse score field to calculate detailed scoring
        const scoreField = record.get('score') as string || ''
        let player1_sets = 0
        let player2_sets = 0
        let player1_total_games = 0
        let player2_total_games = 0
        const sets_detail: Array<{
          player1_games: number
          player2_games: number
          set_winner_id: string
        }> = []

        if (scoreField && winner_id) {
          // Parse scores like "6-2, 6-0" or "6-0, 3-6, 11-9"
          // Scores are reported from the WINNER'S perspective
          const sets = scoreField.split(',').map(set => set.trim())
          const winnerIsPlayer1 = winner_id === player1_id

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
              let set_winner_id = ''
              if (p1Score > p2Score) {
                player1_sets++
                set_winner_id = player1_id
              } else if (p2Score > p1Score) {
                player2_sets++
                set_winner_id = player2_id
              }

              // Store set details (keep original scores for display)
              sets_detail.push({
                player1_games: setIndex === 2 ? p1Score : p1Games,
                player2_games: setIndex === 2 ? p2Score : p2Games,
                set_winner_id
              })
            }
          })
        }

        return {
          id: record.id,
          player1_id,
          player2_id,
          player1_sets,
          player2_sets,
          player1_games: player1_total_games,
          player2_games: player2_total_games,
          sets_detail,
          winner_id,
          date: record.get('completedAt') as string || '',
          notes: record.get('notes') as string || '',
        }
      })
    } catch (error) {
      console.error('Error fetching matches:', error)
      throw error
    }
  }

  async createMatch(matchData: {
    player1: string
    player2: string
    player1_score: number
    player2_score: number
    winner: string
    division: string
    notes?: string
  }) {
    try {
      const record = await base('Matches').create({
        players: `${matchData.player1},${matchData.player2}`, // Comma-separated format
        winner: matchData.winner,
        completedAt: new Date().toISOString().split('T')[0],
        score: `${matchData.player1_score}-${matchData.player2_score}`, // Basic score format
        notes: matchData.notes || '',
      })

      return record
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
    }
  }

  async testConnection() {
    try {
      if (!AIRTABLE_PERSONAL_ACCESS_TOKEN && !process.env.NEXT_PUBLIC_AIRTABLE_API_KEY) {
        return {
          success: false,
          message: 'No Airtable credentials found. Please set either NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN or NEXT_PUBLIC_AIRTABLE_API_KEY'
        }
      }

      if (!AIRTABLE_BASE_ID) {
        return {
          success: false,
          message: 'Base ID is missing. Please check your NEXT_PUBLIC_AIRTABLE_BASE_ID environment variable.'
        }
      }

      // Test Players table access
      console.log('Testing Players table access...')
      const players = await this.getPlayers()
      console.log(`Found ${players.length} players`)

      // Test Matches table access
      console.log('Testing Matches table access...')
      const matches = await this.getMatches()
      console.log(`Found ${matches.length} matches`)

      return {
        success: true,
        message: `Connection successful! Found ${players.length} players and ${matches.length} matches in your Airtable base.`
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
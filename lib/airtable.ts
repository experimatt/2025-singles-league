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
        const player1Id = playersArray[0] || ''
        const player2Id = playersArray[1] || ''

        // Handle winner field (it's an array of record IDs)
        const winnerIds = record.get('winner') as string[] || []
        const winnerId = winnerIds[0] || ''

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
    set1Player1Score: number | null
    set1Player2Score: number | null
    set2Player1Score: number | null
    set2Player2Score: number | null
    set3Player1Score: number | null
    set3Player2Score: number | null
    winner: string
    sets_score: string
    score_summary: string
    division: string
    completedAt: string
    notes?: string
  }) {
    try {
      // First, get all players to find record IDs
      const players = await this.getPlayers()

      // Find record IDs for the two players
      const player1Record = players.find(p => p.name === matchData.player1)
      const player2Record = players.find(p => p.name === matchData.player2)
      const winnerRecord = players.find(p => p.name === matchData.winner)

      if (!player1Record || !player2Record || !winnerRecord) {
        throw new Error(`Could not find record IDs for players: ${matchData.player1}, ${matchData.player2}`)
      }

      const record = await base('Matches').create({
        players: [player1Record.id, player2Record.id], // Array of record IDs
        winner: [winnerRecord.id], // Array with winner's record ID
        completedAt: matchData.completedAt, // Use the date from the form
        score: matchData.score_summary, // Set scores from winner's perspective
        notes: matchData.notes || '',
        source: 'API'
      })

      return record
    } catch (error) {
      console.error('Error creating match:', error)
      throw error
    }
  }

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
export interface Player {
  id: string
  name: string
  division: string
  email?: string
}

export interface Match {
  id: string
  player1Id: string
  player2Id: string
  player1Sets: number
  player2Sets: number
  player1Games: number
  player2Games: number
  setsDetail: Array<{
    player1Games: number
    player2Games: number
    setWinnerId: string
  }>
  winnerId: string
  date: string
  score?: string  // Original score format like "6-2, 3-6, 10-9"
  notes?: string
}

export interface PlayerStats {
  id: string
  name: string
  division: string
  matchWins: number
  matchLosses: number
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
  gamesDifferential: number
  totalMatches: number
  matchWinPercentage: number
  setWinPercentage: number
  gameWinPercentage: number
}
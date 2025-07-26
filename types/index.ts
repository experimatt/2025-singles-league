export interface Player {
  id: string
  name: string
  division: string
  email?: string
}

export interface Match {
  id: string
  player1_id: string
  player2_id: string
  player1_sets: number
  player2_sets: number
  player1_games: number
  player2_games: number
  sets_detail: Array<{
    player1_games: number
    player2_games: number
    set_winner_id: string
  }>
  winner_id: string
  date: string
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
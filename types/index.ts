export interface League {
  id: string
  name: string
  slug: string
  divisions: string[]
  isActive: boolean
  startDate?: string
  endDate?: string
  standingsMode?: 'divisions' | 'ratings' // 'divisions' groups by division, 'ratings' shows flat list with ratings
}

export interface PlayerInfo {
  id: string
  name: string
  username?: string
  email?: string
  phone?: string
  location?: string
  createdAt?: string
}

export interface LeaguePlayer {
  id: string
  playerId: string
  leagueId: string
  playerName: string
  division: string
  rating?: string
  username?: string
}

// Alias for backward compatibility during migration
export type Player = LeaguePlayer

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
  score?: string
  notes?: string
  leagueId?: string
}

export interface PlayerStats {
  id: string
  name: string
  division: string
  rating?: string
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

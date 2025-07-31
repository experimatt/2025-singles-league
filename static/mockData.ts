import type { Player, Match } from "@/types"

export const mockPlayers: Player[] = [
  { id: "1", name: "John Smith", division: "Leonardo", email: "john@example.com" },
  { id: "2", name: "Sarah Johnson", division: "Leonardo", email: "sarah@example.com" },
  { id: "3", name: "Mike Davis", division: "Donatello", email: "mike@example.com" },
  { id: "4", name: "Emily Wilson", division: "Donatello", email: "emily@example.com" },
  { id: "5", name: "Chris Brown", division: "Michelangelo", email: "chris@example.com" },
  { id: "6", name: "Lisa Garcia", division: "Michelangelo", email: "lisa@example.com" },
  { id: "7", name: "David Miller", division: "Raphael", email: "david@example.com" },
  { id: "8", name: "Anna Taylor", division: "Raphael", email: "anna@example.com" },
]

export const mockMatches: Match[] = [
  {
    id: "1",
    player1_id: "1",
    player2_id: "2",
    player1_sets: 2,
    player2_sets: 1,
    player1_games: 13, // 6+3+1 (tiebreak counts as 1 game)
    player2_games: 7,  // 4+6+0 (lost tiebreak)
    sets_detail: [
      { player1_games: 6, player2_games: 4, set_winner_id: "1" },
      { player1_games: 3, player2_games: 6, set_winner_id: "2" },
      { player1_games: 10, player2_games: 8, set_winner_id: "1" }, // Tiebreak score shown
    ],
    winner_id: "1",
    date: "2024-01-15",
    score: "6-4, 3-6, 10-8", // Original scores as reported
  },
  {
    id: "2",
    player1_id: "3",
    player2_id: "4",
    player1_sets: 1,
    player2_sets: 2,
    player1_games: 10, // 3+6+1 (tiebreak)
    player2_games: 12, // 6+2+0 (lost tiebreak)
    sets_detail: [
      { player1_games: 3, player2_games: 6, set_winner_id: "4" },
      { player1_games: 6, player2_games: 2, set_winner_id: "3" },
      { player1_games: 8, player2_games: 10, set_winner_id: "4" }, // Tiebreak
    ],
    winner_id: "4",
    date: "2024-01-16",
    score: "6-3, 2-6, 10-8", // From winner's (player4's) perspective
  },
  {
    id: "3",
    player1_id: "5",
    player2_id: "6",
    player1_sets: 2,
    player2_sets: 0,
    player1_games: 12, // 6+6 (straight sets)
    player2_games: 4,  // 2+2
    sets_detail: [
      { player1_games: 6, player2_games: 2, set_winner_id: "5" },
      { player1_games: 6, player2_games: 2, set_winner_id: "5" },
    ],
    winner_id: "5",
    date: "2024-01-17",
  },
  {
    id: "4",
    player1_id: "7",
    player2_id: "8",
    player1_sets: 1,
    player2_sets: 2,
    player1_games: 11, // 4+6+1 (tiebreak)
    player2_games: 12, // 6+4+0 (lost tiebreak)
    sets_detail: [
      { player1_games: 4, player2_games: 6, set_winner_id: "8" },
      { player1_games: 6, player2_games: 4, set_winner_id: "7" },
      { player1_games: 10, player2_games: 12, set_winner_id: "8" }, // Close tiebreak
    ],
    winner_id: "8",
    date: "2024-01-18",
  },
  {
    id: "5",
    player1_id: "1",
    player2_id: "3",
    player1_sets: 2,
    player2_sets: 0,
    player1_games: 12, // 6+6 (straight sets)
    player2_games: 6,  // 3+3
    sets_detail: [
      { player1_games: 6, player2_games: 3, set_winner_id: "1" },
      { player1_games: 6, player2_games: 3, set_winner_id: "1" },
    ],
    winner_id: "1",
    date: "2024-01-19",
  },
]
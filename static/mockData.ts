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
    player1Id: "1",
    player2Id: "2",
    player1Sets: 2,
    player2Sets: 1,
    player1Games: 13, // 6+3+1 (tiebreak counts as 1 game)
    player2Games: 7,  // 4+6+0 (lost tiebreak)
    setsDetail: [
      { player1Games: 6, player2Games: 4, setWinnerId: "1" },
      { player1Games: 3, player2Games: 6, setWinnerId: "2" },
      { player1Games: 10, player2Games: 8, setWinnerId: "1" }, // Tiebreak score shown
    ],
    winnerId: "1",
    date: "2024-01-15",
    score: "6-4, 3-6, 10-8", // Original scores as reported
  },
  {
    id: "2",
    player1Id: "3",
    player2Id: "4",
    player1Sets: 1,
    player2Sets: 2,
    player1Games: 10, // 3+6+1 (tiebreak)
    player2Games: 12, // 6+2+0 (lost tiebreak)
    setsDetail: [
      { player1Games: 3, player2Games: 6, setWinnerId: "4" },
      { player1Games: 6, player2Games: 2, setWinnerId: "3" },
      { player1Games: 8, player2Games: 10, setWinnerId: "4" }, // Tiebreak
    ],
    winnerId: "4",
    date: "2024-01-16",
    score: "6-3, 2-6, 10-8", // From winner's (player4's) perspective
  },
  {
    id: "3",
    player1Id: "5",
    player2Id: "6",
    player1Sets: 2,
    player2Sets: 0,
    player1Games: 12, // 6+6 (straight sets)
    player2Games: 4,  // 2+2
    setsDetail: [
      { player1Games: 6, player2Games: 2, setWinnerId: "5" },
      { player1Games: 6, player2Games: 2, setWinnerId: "5" },
    ],
    winnerId: "5",
    date: "2024-01-17",
  },
  {
    id: "4",
    player1Id: "7",
    player2Id: "8",
    player1Sets: 1,
    player2Sets: 2,
    player1Games: 11, // 4+6+1 (tiebreak)
    player2Games: 12, // 6+4+0 (lost tiebreak)
    setsDetail: [
      { player1Games: 4, player2Games: 6, setWinnerId: "8" },
      { player1Games: 6, player2Games: 4, setWinnerId: "7" },
      { player1Games: 10, player2Games: 12, setWinnerId: "8" }, // Close tiebreak
    ],
    winnerId: "8",
    date: "2024-01-18",
  },
  {
    id: "5",
    player1Id: "1",
    player2Id: "3",
    player1Sets: 2,
    player2Sets: 0,
    player1Games: 12, // 6+6 (straight sets)
    player2Games: 6,  // 3+3
    setsDetail: [
      { player1Games: 6, player2Games: 3, setWinnerId: "1" },
      { player1Games: 6, player2Games: 3, setWinnerId: "1" },
    ],
    winnerId: "1",
    date: "2024-01-19",
  },
]
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Match } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDivisionColors(division: string) {
  switch (division) {
    case "Leonardo":
      return "border-blue-300 text-blue-500 bg-blue-50"
    case "Donatello":
      return "border-purple-300 text-purple-500 bg-purple-50"
    case "Michelangelo":
      return "border-orange-300 text-orange-500 bg-orange-50"
    case "Raphael":
      return "border-red-300 text-red-500 bg-red-50"
    default:
      return "border-gray-300 text-gray-500 bg-gray-50"
  }
}

export function getDifferentialColor(differential: number) {
  if (differential > 0) return "text-green-600";
  if (differential < 0) return "text-red-600";
  return "text-gray-600";
};

// Format name to show only last initial for privacy
export function formatNameForPrivacy(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length < 2) return fullName // Return as-is if no last name

  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1][0] // Get first letter of last name

  return `${firstName} ${lastInitial}`
}

// Format date string to display in local (US) timezone
export function formatDate(dateString: string): string {
  // Parse the date string and treat it as local time, not UTC
  // Split the date string to avoid timezone conversion issues
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed in Date constructor

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format match score consistently across the application
export function formatMatchScore(match: Match, fromPlayerId?: string): string {
  // If we have the original score string, use it (but adjust perspective if needed)
  if (match.score) {
    // If we're viewing from a specific player's perspective and need to flip the score
    if (fromPlayerId) {
      const matchWonByPlayer1 = match.winnerId === match.player1Id
      const isViewingFromPlayer1 = fromPlayerId === match.player1Id

      // If score is from winner's perspective and we need to flip it
      if (matchWonByPlayer1 !== isViewingFromPlayer1) {
        // Flip the scores to show from current player's perspective
        return match.score.split(', ').map(set => {
          const [score1, score2] = set.split('-')
          return `${score2}-${score1}`
        }).join(', ')
      }
    }

    return match.score
  }

  // Fallback: reconstruct from setsDetail
  if (fromPlayerId) {
    const isPlayer1 = fromPlayerId === match.player1Id
    return match.setsDetail.map(set => {
      return isPlayer1
        ? `${set.player1Games}-${set.player2Games}`
        : `${set.player2Games}-${set.player1Games}`
    }).join(', ')
  }

  // Default: show from player1's perspective
  return match.setsDetail.map(set => {
    return `${set.player1Games}-${set.player2Games}`
  }).join(', ')
}

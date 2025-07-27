import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

// Format name to show only last initial for privacy
export function formatNameForPrivacy(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length < 2) return fullName // Return as-is if no last name

  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1][0] // Get first letter of last name

  return `${firstName} ${lastInitial}`
}

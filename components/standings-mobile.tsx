"use client"

import React, { useState } from "react"
import { Trophy, Medal, Award, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PlayerStats, LeaguePlayer, Match, League } from "@/types"
import { getDivisionColors, getDifferentialColor, formatNameForPrivacy } from "@/lib/utils"
import PlayerMatches from "./player-matches"

interface StandingsMobileProps {
  filteredStats: PlayerStats[]
  selectedDivision: string
  players: LeaguePlayer[]
  matches: Match[]
  league: League
}

export default function StandingsMobile({
  filteredStats,
  selectedDivision,
  players,
  matches,
  league
}: StandingsMobileProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const divisions = league.divisions
  const hasDivisions = divisions.length > 0

  const toggleCard = (playerId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(playerId)) {
      newExpanded.delete(playerId)
    } else {
      newExpanded.add(playerId)
    }
    setExpandedCards(newExpanded)
  }

  const getRankIcon = (index: number, divisionIndex?: number) => {
    // For "All Divisions" view, calculate rank within division
    if (selectedDivision === "All Divisions" && divisionIndex !== undefined) {
      switch (divisionIndex) {
        case 0:
          return <Trophy className="w-4 h-4 text-yellow-500" />
        case 1:
          return <Medal className="w-4 h-4 text-gray-400" />
        case 2:
          return <Award className="w-4 h-4 text-amber-600" />
        default:
          return (
            <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold text-gray-600">
              {divisionIndex + 1}
            </span>
          )
      }
    }

    // For single division view, use regular index
    switch (index) {
      case 0:
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 1:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 2:
        return <Award className="w-4 h-4 text-amber-600" />
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold text-gray-600">
            {index + 1}
          </span>
        )
    }
  }

  const getDivisionBackgroundColor = (division: string) => {
    const index = divisions.indexOf(division)
    const backgrounds = [
      "bg-blue-50",
      "bg-purple-50",
      "bg-orange-50",
      "bg-red-50",
      "bg-green-50",
      "bg-yellow-50",
      "bg-pink-50",
      "bg-cyan-50",
    ]
    return index !== -1 ? backgrounds[index % backgrounds.length] : "bg-gray-50"
  }

  const getDivisionTextColor = (division: string) => {
    const index = divisions.indexOf(division)
    const textColors = [
      "text-blue-500",
      "text-purple-500",
      "text-orange-500",
      "text-red-500",
      "text-green-500",
      "text-yellow-500",
      "text-pink-500",
      "text-cyan-500",
    ]
    return index !== -1 ? textColors[index % textColors.length] : "text-gray-500"
  }

  if (filteredStats.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No players found{hasDivisions ? ' for the selected division' : ''}
      </div>
    )
  }

  // No divisions - render flat list
  if (!hasDivisions) {
    return (
      <>
        <div className="space-y-2">
          {filteredStats.map((stat, index) => {
            const isExpanded = expandedCards.has(stat.id)

            return (
              <div
                key={stat.id}
                className="border rounded-lg bg-white transition-all duration-200"
              >
                {/* Main Card - Always Visible */}
                <div
                  onClick={() => toggleCard(stat.id)}
                  className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {getRankIcon(index)}
                      </div>

                      {/* Name */}
                      <div className="font-medium text-gray-900 flex-1">
                        {formatNameForPrivacy(stat.name)}
                      </div>

                      {/* W-L Record */}
                      <div className="font-semibold text-gray-700">
                        {stat.matchWins}-{stat.matchLosses}
                      </div>
                    </div>

                    {/* Expand/Collapse Icon */}
                    <div className="ml-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200/50">
                    <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                      {/* Matches */}
                      <div>
                        <div className="font-semibold text-gray-800 mb-1">Matches</div>
                        <div className="text-gray-700">
                          {stat.matchWins}-{stat.matchLosses} ({stat.matchWinPercentage.toFixed(0)}%)
                        </div>
                      </div>

                      {/* Sets */}
                      <div>
                        <div className="font-semibold text-gray-800 mb-1">Sets</div>
                        <div className="text-gray-700">
                          {stat.setsWon}-{stat.setsLost}
                        </div>
                      </div>

                      {/* Games */}
                      <div className="col-span-2">
                        <div className="font-semibold text-gray-800 mb-1">Games</div>
                        <div className="text-gray-700">
                          {stat.gamesWon}-{stat.gamesLost} (<span className={getDifferentialColor(stat.gamesDifferential)}>
                            {stat.gamesDifferential > 0 ? "+" : ""}{stat.gamesDifferential}
                          </span>)
                        </div>
                      </div>
                    </div>

                    {/* View Matches Button */}
                    <div className="pt-3 border-t border-gray-200/50 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPlayerId(stat.id)
                        }}
                        className="w-full flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Matches
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <PlayerMatches
          playerId={selectedPlayerId}
          isOpen={selectedPlayerId !== null}
          onClose={() => setSelectedPlayerId(null)}
          players={players}
          matches={matches}
          league={league}
        />
      </>
    )
  }

  // Handle "All Divisions" view with division grouping
  if (selectedDivision === "All Divisions") {
    const unassignedPlayers = filteredStats.filter(stat => !stat.division || !divisions.includes(stat.division))

    return (
      <>
        <div className="space-y-4">
          {divisions.map((division) => {
          const divisionPlayers = filteredStats.filter(stat => stat.division === division)
          if (divisionPlayers.length === 0) return null

          return (
            <div key={division} className="space-y-2">
              {/* Division Header */}
              <div className={`px-4 py-3 rounded-lg border font-bold ${getDivisionTextColor(division)} ${getDivisionBackgroundColor(division)}`}>
                {division}
              </div>

              {/* Division Players */}
              {divisionPlayers.map((stat, divisionIndex) => {
                const isExpanded = expandedCards.has(stat.id)

                return (
                  <div
                    key={stat.id}
                    className={`border rounded-lg ${getDivisionBackgroundColor(stat.division)} transition-all duration-200`}
                  >
                    {/* Main Card - Always Visible */}
                    <div
                      onClick={() => toggleCard(stat.id)}
                      className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Rank */}
                          <div className="flex-shrink-0">
                            {getRankIcon(divisionIndex, divisionIndex)}
                          </div>

                          {/* Name */}
                          <div className="font-medium text-gray-900 flex-1">
                            {formatNameForPrivacy(stat.name)}
                          </div>

                          {/* W-L Record */}
                          <div className="font-semibold text-gray-700">
                            {stat.matchWins}-{stat.matchLosses}
                          </div>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <div className="ml-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200/50">
                        <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                          {/* Matches */}
                          <div>
                            <div className="font-semibold text-gray-800 mb-1">Matches</div>
                            <div className="text-gray-700">
                              {stat.matchWins}-{stat.matchLosses} ({stat.matchWinPercentage.toFixed(0)}%)
                            </div>
                          </div>

                          {/* Sets */}
                          <div>
                            <div className="font-semibold text-gray-800 mb-1">Sets</div>
                            <div className="text-gray-700">
                              {stat.setsWon}-{stat.setsLost}
                            </div>
                          </div>

                          {/* Games */}
                          <div className="col-span-2">
                            <div className="font-semibold text-gray-800 mb-1">Games</div>
                            <div className="text-gray-700">
                              {stat.gamesWon}-{stat.gamesLost} (<span className={getDifferentialColor(stat.gamesDifferential)}>
                                {stat.gamesDifferential > 0 ? "+" : ""}{stat.gamesDifferential}
                              </span>)
                            </div>
                          </div>
                        </div>

                        {/* View Matches Button */}
                        <div className="pt-3 border-t border-gray-200/50 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPlayerId(stat.id)
                            }}
                            className="w-full flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Matches
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Unassigned Players */}
        {unassignedPlayers.length > 0 && (
          <div className="space-y-2">
            {/* Unassigned Header */}
            <div className="px-4 py-3 rounded-lg border font-bold text-gray-500 bg-gray-50">
              Unassigned
            </div>

            {/* Unassigned Players */}
            {unassignedPlayers.map((stat, index) => {
              const isExpanded = expandedCards.has(stat.id)

              return (
                <div
                  key={stat.id}
                  className="border rounded-lg bg-gray-50 transition-all duration-200"
                >
                  {/* Main Card - Always Visible */}
                  <div
                    onClick={() => toggleCard(stat.id)}
                    className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          {getRankIcon(index, index)}
                        </div>

                        {/* Name */}
                        <div className="font-medium text-gray-900 flex-1">
                          {formatNameForPrivacy(stat.name)}
                        </div>

                        {/* W-L Record */}
                        <div className="font-semibold text-gray-700">
                          {stat.matchWins}-{stat.matchLosses}
                        </div>
                      </div>

                      {/* Expand/Collapse Icon */}
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200/50">
                      <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                        {/* Matches */}
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Matches</div>
                          <div className="text-gray-700">
                            {stat.matchWins}-{stat.matchLosses} ({stat.matchWinPercentage.toFixed(0)}%)
                          </div>
                        </div>

                        {/* Sets */}
                        <div>
                          <div className="font-semibold text-gray-800 mb-1">Sets</div>
                          <div className="text-gray-700">
                            {stat.setsWon}-{stat.setsLost}
                          </div>
                        </div>

                        {/* Games */}
                        <div className="col-span-2">
                          <div className="font-semibold text-gray-800 mb-1">Games</div>
                          <div className="text-gray-700">
                            {stat.gamesWon}-{stat.gamesLost} (<span className={getDifferentialColor(stat.gamesDifferential)}>
                              {stat.gamesDifferential > 0 ? "+" : ""}{stat.gamesDifferential}
                            </span>)
                          </div>
                        </div>
                      </div>

                      {/* View Matches Button */}
                      <div className="pt-3 border-t border-gray-200/50 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPlayerId(stat.id)
                          }}
                          className="w-full flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Matches
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <PlayerMatches
        playerId={selectedPlayerId}
        isOpen={selectedPlayerId !== null}
        onClose={() => setSelectedPlayerId(null)}
        players={players}
        matches={matches}
        league={league}
      />
      </>
    )
  }

  // Single division view
  return (
    <>
      <div className="space-y-2">
        {filteredStats.map((stat, index) => {
          const isExpanded = expandedCards.has(stat.id)

          return (
            <div
              key={stat.id}
              className={`border rounded-lg ${getDivisionBackgroundColor(stat.division)} transition-all duration-200`}
            >
              {/* Main Card - Always Visible */}
              <div
                onClick={() => toggleCard(stat.id)}
                className="p-4 cursor-pointer hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(index)}
                    </div>

                    {/* Name */}
                    <div className="font-medium text-gray-900 flex-1">
                      {formatNameForPrivacy(stat.name)}
                    </div>

                    {/* W-L Record */}
                    <div className="font-semibold text-gray-700">
                      {stat.matchWins}-{stat.matchLosses}
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200/50">
                  <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
                    {/* Matches */}
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">Matches</div>
                      <div className="text-gray-700">
                        {stat.matchWins}-{stat.matchLosses} ({stat.matchWinPercentage.toFixed(0)}%)
                      </div>
                    </div>

                    {/* Sets */}
                    <div>
                      <div className="font-semibold text-gray-800 mb-1">Sets</div>
                      <div className="text-gray-700">
                        {stat.setsWon}-{stat.setsLost}
                      </div>
                    </div>

                    {/* Games */}
                    <div className="col-span-2">
                      <div className="font-semibold text-gray-800 mb-1">Games</div>
                      <div className="text-gray-700">
                        {stat.gamesWon}-{stat.gamesLost} (<span className={getDifferentialColor(stat.gamesDifferential)}>
                          {stat.gamesDifferential > 0 ? "+" : ""}{stat.gamesDifferential}
                        </span>)
                      </div>
                    </div>
                  </div>

                  {/* View Matches Button */}
                  <div className="pt-3 border-t border-gray-200/50 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPlayerId(stat.id)
                      }}
                      className="w-full flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Matches
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <PlayerMatches
        playerId={selectedPlayerId}
        isOpen={selectedPlayerId !== null}
        onClose={() => setSelectedPlayerId(null)}
        players={players}
        matches={matches}
        league={league}
      />
    </>
  )
}

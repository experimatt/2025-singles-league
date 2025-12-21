"use client"

import { useState } from "react"
import { Trophy, Medal, Award } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { PlayerStats, LeaguePlayer, Match, League } from "@/types"
import { getDivisionColors, getDifferentialColor, formatNameForPrivacy } from "@/lib/utils"
import PlayerMatches from "./player-matches"

interface StandingsDesktopProps {
  filteredStats: PlayerStats[]
  selectedDivision: string
  players: LeaguePlayer[]
  matches: Match[]
  league: League
}

export default function StandingsDesktop({
  filteredStats,
  selectedDivision,
  players,
  matches,
  league
}: StandingsDesktopProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const divisions = league.divisions
  const hasDivisions = divisions.length > 0

  const getRankIcon = (index: number, divisionIndex?: number) => {
    // For "All Divisions" view, calculate rank within division
    if (selectedDivision === "All Divisions" && divisionIndex !== undefined) {
      switch (divisionIndex) {
        case 0:
          return <Trophy className="w-5 h-5 text-yellow-500" />
        case 1:
          return <Medal className="w-5 h-5 text-gray-400" />
        case 2:
          return <Award className="w-5 h-5 text-amber-600" />
        default:
          return (
            <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-600">
              {divisionIndex + 1}
            </span>
          )
      }
    }

    // For single division view, use regular index
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-600">
            {index + 1}
          </span>
        )
    }
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {/* Grouped Header Row */}
            <TableRow className="border-b-2">
              <TableHead
                colSpan={hasDivisions ? 3 : 2}
                className="text-center font-bold bg-gray-100 text-gray-900 border-r"
              >
                Player Info
              </TableHead>
              <TableHead
                colSpan={3}
                className="text-center font-bold bg-blue-100 text-gray-900 border-r"
              >
                Matches
              </TableHead>
              <TableHead
                colSpan={2}
                className="text-center font-bold bg-green-100 text-gray-900 border-r"
              >
                Sets
              </TableHead>
              <TableHead
                colSpan={3}
                className="text-center font-bold bg-orange-100 text-gray-900"
              >
                Games
              </TableHead>
            </TableRow>
            {/* Detail Header Row */}
            <TableRow>
              <TableHead className="w-16 text-gray-900">Rank</TableHead>
              <TableHead className={`text-gray-900 ${!hasDivisions ? 'border-r' : ''}`}>Player</TableHead>
              {hasDivisions && (
                <TableHead className="text-gray-900 border-r">&nbsp;&nbsp;Division</TableHead>
              )}
              {/* Matches Group */}
              <TableHead className="text-center bg-blue-50 text-gray-900">
                Won
              </TableHead>
              <TableHead className="text-center bg-blue-50 text-gray-900">
                Lost
              </TableHead>
              <TableHead className="text-center bg-blue-50 text-gray-900 border-r">
                %
              </TableHead>
              {/* Sets Group */}
              <TableHead className="text-center bg-green-50 text-gray-900">
                Won
              </TableHead>
              <TableHead className="text-center bg-green-50 text-gray-900 border-r">
                Lost
              </TableHead>
              {/* Games Group */}
              <TableHead className="text-center bg-orange-50 text-gray-900">
                Won
              </TableHead>
              <TableHead className="text-center bg-orange-50 text-gray-900">
                Lost
              </TableHead>
              <TableHead className="text-center bg-orange-50 text-gray-900">
                Diff
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStats.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasDivisions ? 11 : 10}
                  className="text-center py-8 text-gray-500"
                >
                  No players found{hasDivisions ? ' for the selected division' : ''}
                </TableCell>
              </TableRow>
            ) : !hasDivisions ? (
              // No divisions - render flat list
              filteredStats.map((stat, index) => (
                <TableRow
                  key={stat.id}
                  className={index < 3 ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    {getRankIcon(index)}
                  </TableCell>
                  <TableCell
                    className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors border-r"
                    onClick={() => setSelectedPlayerId(stat.id)}
                  >
                    {formatNameForPrivacy(stat.name)}
                  </TableCell>
                  {/* Matches */}
                  <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                    {stat.matchWins}
                  </TableCell>
                  <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                    {stat.matchLosses}
                  </TableCell>
                  <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600 border-r">
                    {stat.matchWinPercentage.toFixed(0)}%
                  </TableCell>
                  {/* Sets */}
                  <TableCell className="text-center bg-green-50/30 font-normal text-gray-600">
                    {stat.setsWon}
                  </TableCell>
                  <TableCell className="text-center bg-green-50/30 font-normal text-gray-600 border-r">
                    {stat.setsLost}
                  </TableCell>
                  {/* Games */}
                  <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                    {stat.gamesWon}
                  </TableCell>
                  <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                    {stat.gamesLost}
                  </TableCell>
                  <TableCell
                    className={`text-center bg-orange-50/30 font-normal ${getDifferentialColor(
                      stat.gamesDifferential
                    )}`}
                  >
                    {stat.gamesDifferential > 0 ? "+" : ""}
                    {stat.gamesDifferential}
                  </TableCell>
                </TableRow>
              ))
            ) : selectedDivision === "All Divisions" ? (
              // Group by divisions for "All Divisions" view
              (() => {
                const rows: React.ReactNode[] = []

                divisions.forEach((division, divisionIdx) => {
                  const divisionPlayers = filteredStats.filter(stat => stat.division === division)
                  const isAlternateDivision = divisionIdx % 2 === 1 // Shade odd-indexed divisions

                  divisionPlayers.forEach((stat, divisionIndex) => {
                    rows.push(
                      <TableRow
                        key={stat.id}
                        className={isAlternateDivision ? "bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium">
                          {getRankIcon(divisionIndex, divisionIndex)}
                        </TableCell>
                        <TableCell
                          className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                          onClick={() => setSelectedPlayerId(stat.id)}
                        >
                          {formatNameForPrivacy(stat.name)}
                        </TableCell>
                        <TableCell className="border-r">
                          <Badge variant="outline" className={`text-xs ${getDivisionColors(stat.division, divisions)}`}>
                            {stat.division}
                          </Badge>
                        </TableCell>
                        {/* Matches */}
                        <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                          {stat.matchWins}
                        </TableCell>
                        <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                          {stat.matchLosses}
                        </TableCell>
                        <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600 border-r">
                          {stat.matchWinPercentage.toFixed(0)}%
                        </TableCell>
                        {/* Sets */}
                        <TableCell className="text-center bg-green-50/30 font-normal text-gray-600">
                          {stat.setsWon}
                        </TableCell>
                        <TableCell className="text-center bg-green-50/30 font-normal text-gray-600 border-r">
                          {stat.setsLost}
                        </TableCell>
                        {/* Games */}
                        <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                          {stat.gamesWon}
                        </TableCell>
                        <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                          {stat.gamesLost}
                        </TableCell>
                        <TableCell
                          className={`text-center bg-orange-50/30 font-normal ${getDifferentialColor(
                            stat.gamesDifferential
                          )}`}
                        >
                          {stat.gamesDifferential > 0 ? "+" : ""}
                          {stat.gamesDifferential}
                        </TableCell>
                      </TableRow>
                    )
                  })
                })

                // Add unassigned players at the end
                const unassignedPlayers = filteredStats.filter(stat => !stat.division || !divisions.includes(stat.division))
                unassignedPlayers.forEach((stat, index) => {
                  rows.push(
                    <TableRow
                      key={stat.id}
                      className="bg-gray-50/50"
                    >
                      <TableCell className="font-medium">
                        {getRankIcon(index, index)}
                      </TableCell>
                      <TableCell
                        className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                        onClick={() => setSelectedPlayerId(stat.id)}
                      >
                        {formatNameForPrivacy(stat.name)}
                      </TableCell>
                      <TableCell className="border-r">
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-500 bg-gray-50">
                          Unassigned
                        </Badge>
                      </TableCell>
                      {/* Matches */}
                      <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                        {stat.matchWins}
                      </TableCell>
                      <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                        {stat.matchLosses}
                      </TableCell>
                      <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600 border-r">
                        {stat.matchWinPercentage.toFixed(0)}%
                      </TableCell>
                      {/* Sets */}
                      <TableCell className="text-center bg-green-50/30 font-normal text-gray-600">
                        {stat.setsWon}
                      </TableCell>
                      <TableCell className="text-center bg-green-50/30 font-normal text-gray-600 border-r">
                        {stat.setsLost}
                      </TableCell>
                      {/* Games */}
                      <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                        {stat.gamesWon}
                      </TableCell>
                      <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                        {stat.gamesLost}
                      </TableCell>
                      <TableCell
                        className={`text-center bg-orange-50/30 font-normal ${getDifferentialColor(
                          stat.gamesDifferential
                        )}`}
                      >
                        {stat.gamesDifferential > 0 ? "+" : ""}
                        {stat.gamesDifferential}
                      </TableCell>
                    </TableRow>
                  )
                })

                return rows
              })()
            ) : (
              // Single division view
              filteredStats.map((stat, index) => (
                <TableRow
                  key={stat.id}
                  className={index < 3 ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    {getRankIcon(index)}
                  </TableCell>
                  <TableCell
                    className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                    onClick={() => setSelectedPlayerId(stat.id)}
                  >
                    {formatNameForPrivacy(stat.name)}
                  </TableCell>
                  <TableCell className="border-r">
                    <Badge variant="outline" className={`text-xs ${getDivisionColors(stat.division, divisions)}`}>
                      {stat.division}
                    </Badge>
                  </TableCell>
                  {/* Matches */}
                  <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                    {stat.matchWins}
                  </TableCell>
                  <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600">
                    {stat.matchLosses}
                  </TableCell>
                  <TableCell className="text-center bg-blue-50/30 font-normal text-gray-600 border-r">
                    {stat.matchWinPercentage.toFixed(0)}%
                  </TableCell>
                  {/* Sets */}
                  <TableCell className="text-center bg-green-50/30 font-normal text-gray-600">
                    {stat.setsWon}
                  </TableCell>
                  <TableCell className="text-center bg-green-50/30 font-normal text-gray-600 border-r">
                    {stat.setsLost}
                  </TableCell>
                  {/* Games */}
                  <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                    {stat.gamesWon}
                  </TableCell>
                  <TableCell className="text-center bg-orange-50/30 font-normal text-gray-600">
                    {stat.gamesLost}
                  </TableCell>
                  <TableCell
                    className={`text-center bg-orange-50/30 font-normal ${getDifferentialColor(
                      stat.gamesDifferential
                    )}`}
                  >
                    {stat.gamesDifferential > 0 ? "+" : ""}
                    {stat.gamesDifferential}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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

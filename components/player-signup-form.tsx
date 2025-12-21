"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { UserPlus, Mail, Phone, MapPin, Star, Search, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { airtable } from "@/lib/airtable"
import type { League, PlayerInfo } from "@/types"
import { cn, formatNameForPrivacy } from "@/lib/utils"

interface PlayerSignupFormProps {
  league: League
  onSuccess?: () => void
}

const RATING_OPTIONS = [
  { value: "Below 3.0", label: "Below 3.0", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { value: "3.0", label: "3.0", color: "bg-sky-100 text-sky-700 border-sky-300" },
  { value: "3.25", label: "3.25", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "3.5", label: "3.5", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "3.75", label: "3.75", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "4.0", label: "4.0", color: "bg-pink-100 text-pink-700 border-pink-300" },
  { value: "Above 4.0", label: "Above 4.0", color: "bg-violet-100 text-violet-700 border-violet-300" },
]

const LOCATION_OPTIONS = [
  { value: "Minneapolis", label: "Minneapolis", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
  { value: "St Paul", label: "St Paul", color: "bg-sky-100 text-sky-700 border-sky-300" },
  { value: "Northern Suburbs", label: "Northern Suburbs", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "Eastern Suburbs", label: "Eastern Suburbs", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { value: "Southern Suburbs", label: "Southern Suburbs", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { value: "Western Suburbs", label: "Western Suburbs", color: "bg-pink-100 text-pink-700 border-pink-300" },
  { value: "Somewhere else", label: "Somewhere else", color: "bg-gray-100 text-gray-700 border-gray-300" },
]

export default function PlayerSignupForm({ league, onSuccess }: PlayerSignupFormProps) {
  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [existingPlayers, setExistingPlayers] = useState<PlayerInfo[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("")
  const [playerSearchOpen, setPlayerSearchOpen] = useState(false)
  const [playerSearchQuery, setPlayerSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    rating: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Load existing players on mount
  useEffect(() => {
    const loadExistingPlayers = async () => {
      try {
        const players = await airtable.getPlayerInfo()
        // Sort alphabetically by name
        const sortedPlayers = players.sort((a, b) =>
          a.name.localeCompare(b.name)
        )
        setExistingPlayers(sortedPlayers)
      } catch (err) {
        console.error("Error loading existing players:", err)
      } finally {
        setLoadingPlayers(false)
      }
    }
    loadExistingPlayers()
  }, [])

  const selectedPlayer = existingPlayers.find(p => p.id === selectedPlayerId)

  const isExistingFormValid = () => {
    return selectedPlayerId !== "" && formData.rating !== ""
  }

  const isNewFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.rating !== ""
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (mode === "existing") {
        // Validate existing player selection
        if (!selectedPlayerId) {
          setError("Please select yourself from the list")
          setIsSubmitting(false)
          return
        }

        if (!formData.rating) {
          setError("Please select your self-reported rating")
          setIsSubmitting(false)
          return
        }

        // Create LeaguePlayer record for existing PlayerInfo
        await airtable.createLeaguePlayer({
          playerId: selectedPlayerId,
          leagueId: league.id,
          division: "", // Division will be assigned by organizer
          rating: formData.rating,
        })
      } else {
        // New player - validate all fields
        if (!formData.name.trim()) {
          setError("Please enter your name")
          setIsSubmitting(false)
          return
        }

        if (!formData.email.trim()) {
          setError("Please enter your email")
          setIsSubmitting(false)
          return
        }

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          setError("Please enter a valid email address")
          setIsSubmitting(false)
          return
        }

        if (!formData.rating) {
          setError("Please select your rating")
          setIsSubmitting(false)
          return
        }

        // Create PlayerInfo and LeaguePlayer
        await airtable.registerForLeague({
          name: formData.name.trim(),
          username: formData.username.trim() || undefined,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          location: formData.location || undefined,
          leagueId: league.id,
          division: "", // Division will be assigned by organizer
          rating: formData.rating,
        })
      }

      // Show success toast
      toast.success("You've been registered for the league!")

      // Reset form
      setSelectedPlayerId("")
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        location: "",
        rating: "",
      })

      // Call onSuccess callback
      onSuccess?.()
    } catch (err) {
      console.error("Registration error:", err)
      setError("Failed to register. Please try again or contact the league organizer.")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 pb-2">
          <UserPlus className="w-5 h-5 text-green-600" />
          Sign up for {league.name}
        </CardTitle>
        <CardDescription>
          Register to join the league. Select whether you&apos;ve played in a
          previous league or are a new player.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-300 bg-red-50">
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "existing" | "new")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="existing" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Returning Player
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              New Player
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="existing" className="mt-0 space-y-6">
              {/* Player Search/Select */}
              <div className="space-y-2">
                <Label>Find Yourself *</Label>
                <Popover
                  open={playerSearchOpen}
                  onOpenChange={(open) => {
                    setPlayerSearchOpen(open);
                    if (!open) setPlayerSearchQuery(""); // Reset search when closing
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={playerSearchOpen}
                      className={cn(
                        "w-full justify-between",
                        !selectedPlayerId && "text-muted-foreground"
                      )}
                      disabled={loadingPlayers}
                    >
                      {selectedPlayer ? (
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {formatNameForPrivacy(selectedPlayer.name)}
                          {selectedPlayer.username && (
                            <span className="text-gray-400">
                              @{selectedPlayer.username}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Search by name...
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Type your name to search..."
                        value={playerSearchQuery}
                        onValueChange={setPlayerSearchQuery}
                      />
                      <CommandList>
                        {playerSearchQuery.length < 2 ? (
                          <div className="py-6 text-center text-sm text-gray-500">
                            Start typing to search...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>
                              No player found. Try the &quot;New Player&quot;
                              tab.
                            </CommandEmpty>
                            <CommandGroup>
                              {existingPlayers
                                .filter((player) =>
                                  player.name
                                    .toLowerCase()
                                    .includes(playerSearchQuery.toLowerCase())
                                )
                                .map((player) => (
                                  <CommandItem
                                    key={player.id}
                                    value={player.name}
                                    onSelect={() => {
                                      setSelectedPlayerId(player.id);
                                      setPlayerSearchOpen(false);
                                      setPlayerSearchQuery("");
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {formatNameForPrivacy(player.name)}
                                      </span>
                                      {player.username && (
                                        <span className="text-sm text-gray-500">
                                          @{player.username}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500">
                  Search for your name from previous leagues
                </p>
              </div>

              {selectedPlayer && (
                <Alert className="border-green-300 bg-green-50">
                  <AlertDescription className="text-green-800">
                    <strong>
                      Welcome back, {selectedPlayer.name.split(" ")[0]}!
                    </strong>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="new" className="mt-0 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">What is your name? *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Stephanie F"
                  required
                />
                <p className="text-xs text-gray-500">
                  Full name or include your last initial
                </p>
              </div>

              {/* Discord Username */}
              <div className="space-y-2">
                <Label htmlFor="username">What is your Discord username?</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="e.g. briguy, kupschake"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  What is your email? *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="your.email@example.com"
                  required
                />
                <p className="text-xs text-gray-500">
                  This won&apos;t be shared with anyone outside the discord
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  What is your phone number?
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(555) 123-4567"
                />
                <p className="text-xs text-gray-500">
                  Optional - won&apos;t be shared with anyone outside the discord
                </p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Where are you located?
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, location: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location">
                      {formData.location && (
                        <Badge
                          className={`text-xs border ${
                            LOCATION_OPTIONS.find(
                              (o) => o.value === formData.location
                            )?.color
                          }`}
                        >
                          {formData.location}
                        </Badge>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <Badge className={`text-xs border ${option.color}`}>
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Rating Selection - shown for both modes */}
            <div className="space-y-2">
              <Label htmlFor="rating" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Best guess for your current USTA/NTRP rating? *
              </Label>
              <Select
                value={formData.rating}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, rating: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your rating">
                    {formData.rating && (
                      <Badge
                        className={`text-xs border ${
                          RATING_OPTIONS.find(
                            (o) => o.value === formData.rating
                          )?.color
                        }`}
                      >
                        {formData.rating}
                      </Badge>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={`text-xs border ${option.color}`}>
                        {option.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Purely vibes-based, doesn&apos;t have to be official
              </p>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={
                isSubmitting ||
                (mode === "existing"
                  ? !isExistingFormValid()
                  : !isNewFormValid())
              }
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign up for {league.name}
                </>
              )}
            </Button>
          </form>
        </Tabs>
      </CardContent>
    </div>
  );
}

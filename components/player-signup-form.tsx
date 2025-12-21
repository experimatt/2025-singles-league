"use client"

import type React from "react"
import { useState } from "react"
import { UserPlus, Mail, Phone, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { airtable } from "@/lib/airtable"
import type { League } from "@/types"

interface PlayerSignupFormProps {
  league: League
  onSuccess?: () => void
}

const RATING_OPTIONS = [
  { value: "2.5", label: "2.5 - Beginner" },
  { value: "3.0", label: "3.0 - Intermediate" },
  { value: "3.5", label: "3.5 - Intermediate+" },
  { value: "4.0", label: "4.0 - Advanced" },
  { value: "4.5", label: "4.5 - Advanced+" },
  { value: "5.0", label: "5.0 - Expert" },
]

export default function PlayerSignupForm({ league, onSuccess }: PlayerSignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    division: "",
    rating: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.division !== "" &&
      formData.rating !== ""
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Basic validation
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

    if (!formData.division) {
      setError("Please select a division")
      setIsSubmitting(false)
      return
    }

    if (!formData.rating) {
      setError("Please select your self-reported rating")
      setIsSubmitting(false)
      return
    }

    try {
      await airtable.registerForLeague({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        location: formData.location.trim() || undefined,
        leagueId: league.id,
        division: formData.division,
        rating: formData.rating,
      })

      // Show success toast
      toast.success("You've been registered for the league!")

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        division: "",
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
          Register to join the league. Fill out the form below and you&apos;ll be added to the roster.
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address *
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
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number (optional)
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
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location (optional)
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="City, State or neighborhood"
            />
            <p className="text-xs text-gray-500">
              Helps with scheduling matches with nearby players
            </p>
          </div>

          {/* Division Selection */}
          <div className="space-y-2">
            <Label htmlFor="division">Division *</Label>
            <Select
              value={formData.division}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, division: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {league.divisions.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              You&apos;ll be placed in this division for league play
            </p>
          </div>

          {/* Rating Selection */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Self-Reported Rating *
            </Label>
            <Select
              value={formData.rating}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, rating: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your skill level" />
              </SelectTrigger>
              <SelectContent>
                {RATING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              NTRP rating or equivalent. Be honest - it helps with fair matchups!
            </p>
          </div>

          <Button
            type="submit"
            variant="default"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || !isFormValid()}
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
      </CardContent>
    </div>
  )
}

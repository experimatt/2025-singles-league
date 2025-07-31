"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxGroup {
  label: string
  options: ComboboxOption[]
}

interface ComboboxProps {
  options?: ComboboxOption[]
  groups?: ComboboxGroup[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  groups,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No option found.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // Get all options (flat or from groups) for finding the selected label
  const allOptions = React.useMemo(() => {
    if (groups) {
      return groups.flatMap(group => group.options)
    }
    return options || []
  }, [options, groups])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-sm font-light [&>span]:flex [&>span]:items-center", className)}
          disabled={disabled}
        >
          {value
            ? allOptions.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups ? (
              // Render grouped options
              groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onValueChange?.(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                      className=""
                    >
                      <span className={cn(
                        "font-light pl-3",
                        value === option.value && "font-semibold"
                      )}>
                        {option.label}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))
            ) : (
              // Render flat options (backward compatibility)
              <CommandGroup>
                {(options || []).map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onValueChange?.(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                  >
                                          <span className={cn(
                        "font-normal pl-2",
                        value === option.value && "font-semibold"
                      )}>
                        {option.label}
                      </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 
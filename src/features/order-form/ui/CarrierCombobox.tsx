import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { useCarriers } from '@/entities/carrier'

interface CarrierComboboxProps {
  value: string
  onChange: (value: string) => void
}

export function CarrierCombobox({ value, onChange }: CarrierComboboxProps) {
  const [open, setOpen] = useState(false)
  const { data: carriers = [], isLoading } = useCarriers()

  const selected = carriers.find((c) => c.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading carriers...
            </span>
          ) : selected ? (
            <span>
              {selected.name}
              <span className="ml-2 text-muted-foreground text-xs">{selected.mcNumber}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Search carrier...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or MC#..." />
          <CommandList>
            <CommandEmpty>No carrier found.</CommandEmpty>
            <CommandGroup>
              {carriers.map((carrier) => (
                <CommandItem
                  key={carrier.id}
                  value={`${carrier.name} ${carrier.mcNumber}`}
                  onSelect={() => {
                    onChange(carrier.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === carrier.id ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="flex-1">{carrier.name}</span>
                  <span className="text-xs text-muted-foreground">{carrier.mcNumber}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

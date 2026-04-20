import { useState } from 'react'
import { X, Search, ChevronDown, Check } from 'lucide-react'
import type { OrderStatus } from '@/entities/order'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/features/change-order-status'
import { useUIStore } from '@/features/manage-drafts'

const ALL_STATUSES: OrderStatus[] = ['pending', 'in_transit', 'delivered', 'cancelled']

export function OrdersFilters() {
  const { filters, setFilters, clearFilters } = useUIStore()
  const [statusOpen, setStatusOpen] = useState(false)
  const hasFilters = filters.status.length > 0 || filters.search.length > 0

  const toggleStatus = (status: OrderStatus) => {
    const current = filters.status
    const next = current.includes(status)
      ? current.filter((item) => item !== status)
      : [...current, status]
    setFilters({ status: next })
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => setFilters({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            Status
            {filters.status.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 min-w-5 text-center">
                {filters.status.length}
              </span>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-2">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={cn(
                'flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors',
                filters.status.includes(status) && 'bg-accent',
              )}
              onClick={() => toggleStatus(status)}
            >
              <Check
                className={cn(
                  'h-4 w-4 shrink-0',
                  filters.status.includes(status) ? 'opacity-100' : 'opacity-0',
                )}
              />
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                  STATUS_COLORS[status],
                )}
              >
                {STATUS_LABELS[status]}
              </span>
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {filters.status.map((status) => (
        <Badge
          key={status}
          variant="secondary"
          className="gap-1 pl-2 pr-1 cursor-pointer"
          onClick={() => toggleStatus(status)}
        >
          {STATUS_LABELS[status]}
          <X className="h-3 w-3" />
        </Badge>
      ))}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}

import { cn } from '@/shared/lib/utils'
import type { StatusChange } from '@/entities/order'
import { formatDate } from '@/shared/lib/formatters'
import { STATUS_LABELS, STATUS_COLORS } from '@/features/change-order-status'

interface StatusTimelineProps {
  history: StatusChange[]
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
  )

  return (
    <div className="space-y-0">
      {sorted.map((change, idx) => {
        const isLatest = idx === sorted.length - 1

        return (
          <div key={idx} className="flex gap-4">
            {/* Dot + connector */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1',
                  isLatest ? 'border-primary bg-primary' : 'border-muted-foreground bg-background',
                )}
              />
              {idx < sorted.length - 1 && (
                <div className="w-0.5 bg-border flex-1 my-1 min-h-[20px]" />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4', idx === sorted.length - 1 && 'pb-0')}>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                    STATUS_COLORS[change.to],
                    isLatest && 'ring-1 ring-primary/30',
                  )}
                >
                  {STATUS_LABELS[change.to]}
                </span>
                {isLatest && (
                  <span className="text-xs text-primary font-medium">Current</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(change.changedAt)}</p>
              {change.note && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">"{change.note}"</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

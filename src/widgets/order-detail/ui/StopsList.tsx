import { MapPin } from 'lucide-react'
import type { Stop } from '@/entities/order'
import { formatDate } from '@/shared/lib/formatters'
import { APPOINTMENT_TYPE_LABELS } from '@/features/change-order-status'
import { cn } from '@/shared/lib/utils'

const STOP_TYPE_LABELS: Record<string, string> = {
  pick_up: 'Pick Up',
  drop_off: 'Drop Off',
  stop: 'Stop',
}

const STOP_TYPE_COLORS: Record<string, string> = {
  pick_up: 'bg-green-100 text-green-800 border-green-200',
  drop_off: 'bg-red-100 text-red-800 border-red-200',
  stop: 'bg-blue-100 text-blue-800 border-blue-200',
}

const CONNECTOR_COLORS: Record<string, string> = {
  pick_up: 'bg-green-400',
  drop_off: 'bg-red-400',
  stop: 'bg-blue-400',
}

interface StopsListProps {
  stops: Stop[]
}

export function StopsList({ stops }: StopsListProps) {
  const sorted = [...stops].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-0">
      {sorted.map((stop, idx) => (
        <div key={stop.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0',
                STOP_TYPE_COLORS[stop.type],
              )}
            >
              {idx + 1}
            </div>
            {idx < sorted.length - 1 && (
              <div className={cn('w-0.5 flex-1 my-1 min-h-[24px]', CONNECTOR_COLORS[stop.type])} />
            )}
          </div>

          <div className={cn('pb-5', idx === sorted.length - 1 && 'pb-0')}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold',
                  STOP_TYPE_COLORS[stop.type],
                )}
              >
                {STOP_TYPE_LABELS[stop.type]}
              </span>
              {stop.refNumber && (
                <span className="text-xs text-muted-foreground">Ref: {stop.refNumber}</span>
              )}
            </div>

            {stop.locationName && <p className="text-sm font-medium">{stop.locationName}</p>}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {stop.address.city}, {stop.address.state} {stop.address.zip}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="text-muted-foreground">{formatDate(stop.appointmentDate)}</span>
              <span className="text-xs bg-muted rounded px-1.5 py-0.5">
                {APPOINTMENT_TYPE_LABELS[stop.appointmentType]}
              </span>
            </div>

            {stop.notes && <p className="text-xs text-muted-foreground mt-1 italic">{stop.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

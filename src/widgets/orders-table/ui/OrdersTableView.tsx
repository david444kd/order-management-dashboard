import { PackageX, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import type { Order } from '@/entities/order'
import { TableHead, TableRow, TableCell } from './TableComponents'
import { OrdersTableSkeleton } from './OrdersTableSkeleton'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  in_transit: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
}

function formatRoute(stops: Order['stops']) {
  const pickup = stops.find((s) => s.type === 'pick_up')
  const dropoff = stops.find((s) => s.type === 'drop_off')
  if (!pickup || !dropoff) return '—'
  return `${pickup.address.city}, ${pickup.address.state} → ${dropoff.address.city}, ${dropoff.address.state}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface OrdersTableViewProps {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  skeletonRows: number
  onRetry: () => void
}

export function OrdersTableView({
  orders,
  isLoading,
  isError,
  skeletonRows,
  onRetry,
}: OrdersTableViewProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/30">
            <tr>
              <TableHead>Ref #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Stops</TableHead>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <OrdersTableSkeleton rows={skeletonRows} />
            ) : isError ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 opacity-50" />
                    <p className="font-medium">Failed to load orders</p>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <PackageX className="h-8 w-8 opacity-50" />
                    <p className="font-medium">No orders found</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const pickupStop = order.stops.find((s) => s.type === 'pick_up')
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {order.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="truncate block text-sm">{formatRoute(order.stops)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.carrier.name}</div>
                      <div className="text-xs text-muted-foreground">{order.carrier.mcNumber}</div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {order.equipmentType.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {pickupStop?.appointmentDate ? formatDate(pickupStop.appointmentDate) : '—'}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {formatCurrency(order.rate)}
                    </TableCell>
                    <TableCell className="text-center">{order.stops.length}</TableCell>
                  </TableRow>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

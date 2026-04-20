import { PackageX, RefreshCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { Order } from '@/entities/order'
import { StatusBadge } from '@/features/change-order-status'
import { formatCurrency, formatDateShort, formatRoute } from '@/shared/lib/formatters'
import { TableHead, TableRow, TableCell } from './TableComponents'
import { OrdersTableSkeleton } from './OrdersTableSkeleton'

interface OrdersTableViewProps {
  orders: Order[]
  isLoading: boolean
  isError: boolean
  skeletonRows: number
  onRetry: () => void
  onRowClick?: (orderId: string) => void
}

export function OrdersTableView({
  orders,
  isLoading,
  isError,
  skeletonRows,
  onRetry,
  onRowClick,
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
                const { primary: route } = formatRoute(order.stops)
                return (
                  <TableRow key={order.id} onClick={onRowClick ? () => onRowClick(order.id) : undefined}>
                    <TableCell className="font-mono text-xs font-medium">
                      {order.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge orderId={order.id} status={order.status} />
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <span className="truncate block text-sm">{route}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.carrier.name}</div>
                      <div className="text-xs text-muted-foreground">{order.carrier.mcNumber}</div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {order.equipmentType.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {pickupStop?.appointmentDate ? formatDateShort(pickupStop.appointmentDate) : '—'}
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

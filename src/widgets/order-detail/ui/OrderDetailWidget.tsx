import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { useOrder } from '@/entities/order'
import { StatusBadge } from '@/features/change-order-status'
import { EQUIPMENT_LABELS, LOAD_TYPE_LABELS } from '@/features/change-order-status'
import { DeleteOrderDialog } from '@/features/delete-order'
import { formatCurrency, formatWeight, formatRoute } from '@/shared/lib/formatters'
import { StopsList } from './StopsList'
import { StatusTimeline } from './StatusTimeline'

interface OrderDetailWidgetProps {
  orderId: string
}

export function OrderDetailWidget({ orderId }: OrderDetailWidgetProps) {
  const navigate = useNavigate()
  const { data: order, isLoading, isError, refetch } = useOrder(orderId)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Failed to load order</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const { primary: route } = formatRoute(order.stops)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/orders')} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {order.referenceNumber}
            </h1>
            <StatusBadge orderId={order.id} status={order.status} interactive />
          </div>
          <p className="text-muted-foreground">{route}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate(`/orders/${order.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          )}
          {order.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive border-destructive/30"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="rounded-lg border bg-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Client</p>
            <p className="text-sm font-medium">{order.clientName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Carrier</p>
            <p className="text-sm font-medium">{order.carrier.name}</p>
            <p className="text-xs text-muted-foreground">{order.carrier.mcNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Equipment</p>
            <p className="text-sm font-medium">{EQUIPMENT_LABELS[order.equipmentType]}</p>
            <p className="text-xs text-muted-foreground">{LOAD_TYPE_LABELS[order.loadType]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Rate</p>
            <p className="text-sm font-medium">{formatCurrency(order.rate)}</p>
            <p className="text-xs text-muted-foreground">{formatWeight(order.weight)}</p>
          </div>
        </div>
        {order.notes && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Stops */}
        <div className="lg:col-span-3 rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Stops ({order.stops.length})
          </h2>
          <StopsList stops={order.stops} />
        </div>

        {/* Status history */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Status History
          </h2>
          <StatusTimeline history={order.statusHistory} />
        </div>
      </div>

      {/* Delete dialog */}
      <DeleteOrderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        orderId={order.id}
        referenceNumber={order.referenceNumber}
        onDeleted={() => navigate('/orders')}
      />
    </div>
  )
}

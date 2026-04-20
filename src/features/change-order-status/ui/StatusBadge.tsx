import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useUpdateOrderStatus } from '@/entities/order'
import type { OrderStatus } from '@/entities/order'
import { getValidTransitions } from '../model/transitions'
import { CancelConfirmDialog } from './CancelConfirmDialog'
import { STATUS_LABELS, STATUS_VARIANTS } from './statusConfig'

interface StatusBadgeProps {
  orderId: string
  status: OrderStatus
  interactive?: boolean
}

export function StatusBadge({ orderId, status, interactive = false }: StatusBadgeProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const validTransitions = getValidTransitions(status)

  const handleTransition = (to: OrderStatus) => {
    if (to === 'cancelled') {
      setCancelDialogOpen(true)
      return
    }
    updateStatus(
      { id: orderId, status: to },
      {
        onSuccess: () => toast.success(`Status updated to ${STATUS_LABELS[to]}`),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  const badge = (
    <Badge variant={STATUS_VARIANTS[status]} className="cursor-pointer select-none">
      {isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
      {STATUS_LABELS[status]}
    </Badge>
  )

  if (!interactive || validTransitions.length === 0) {
    return badge
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{badge}</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {validTransitions.map((to) => (
            <DropdownMenuItem key={to} onClick={() => handleTransition(to)}>
              → {STATUS_LABELS[to]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <CancelConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderId={orderId}
      />
    </>
  )
}

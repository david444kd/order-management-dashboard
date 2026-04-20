import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  RefreshCw,
  PackageX,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { useOrders } from '@/entities/order'
import { useUIStore, useDraftsStore } from '@/features/manage-drafts'
import { StatusBadge } from '@/features/change-order-status'
import { EQUIPMENT_LABELS, LOAD_TYPE_LABELS } from '@/features/change-order-status'
import { DeleteOrderDialog } from '@/features/delete-order'
import { formatCurrency, formatDateShort, formatRoute, formatPaginationInfo } from '@/shared/lib/formatters'
import { generateId } from '@/shared/lib/generateId'
import { MAX_DRAFTS, PAGE_SIZES } from '@/shared/config/constants'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { TableHead, TableRow, TableCell } from './TableComponents'
import { OrdersTableSkeleton } from './OrdersTableSkeleton'
import type { Order } from '@/entities/order'

type SortableColumn = 'pickupDate' | 'rate' | 'status' | 'referenceNumber'

function SortIcon({
  column,
  currentSort,
}: {
  column: SortableColumn
  currentSort: { column: SortableColumn; direction: 'asc' | 'desc' } | null
}) {
  if (currentSort?.column !== column)
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50 inline" />
  return currentSort.direction === 'asc' ? (
    <ArrowUp className="ml-1 h-3 w-3 inline" />
  ) : (
    <ArrowDown className="ml-1 h-3 w-3 inline" />
  )
}

export function OrdersTable() {
  const navigate = useNavigate()
  const { filters, sort, page, pageSize, setSort, setPage, setPageSize } = useUIStore()
  const { createDraft, drafts } = useDraftsStore()

  const debouncedSearch = useDebounce(filters.search, 300)

  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    pageSize,
    sortBy: sort?.column,
    sortOrder: sort?.direction,
    status: filters.status.length > 0 ? filters.status : undefined,
    search: debouncedSearch || undefined,
  })

  const handleDuplicateAsDraft = (order: Order) => {
    if (drafts.length >= MAX_DRAFTS) {
      toast.error(`Maximum ${MAX_DRAFTS} drafts allowed. Close a draft first.`)
      return
    }
    const id = createDraft()
    const store = useDraftsStore.getState()
    store.updateDraft(id, {
      clientName: order.clientName,
      referenceNumber: order.referenceNumber + '-COPY',
      carrierId: order.carrier.id,
      equipmentType: order.equipmentType,
      loadType: order.loadType,
      rate: order.rate,
      weight: order.weight,
      notes: order.notes,
      stops: order.stops.map((s) => ({
        ...s,
        id: generateId('stop'),
        appointmentDate: s.appointmentDate ?? '',
      })),
    })
    navigate('/orders/new')
    toast.success('Order duplicated as draft')
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/30">
              <tr>
                <TableHead
                  sortable
                  onClick={() => setSort('referenceNumber')}
                >
                  Ref # <SortIcon column="referenceNumber" currentSort={sort} />
                </TableHead>
                <TableHead
                  sortable
                  onClick={() => setSort('status')}
                >
                  Status <SortIcon column="status" currentSort={sort} />
                </TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead
                  sortable
                  onClick={() => setSort('pickupDate')}
                >
                  Pickup <SortIcon column="pickupDate" currentSort={sort} />
                </TableHead>
                <TableHead
                  sortable
                  onClick={() => setSort('rate')}
                >
                  Rate <SortIcon column="rate" currentSort={sort} />
                </TableHead>
                <TableHead>Stops</TableHead>
                <TableHead className="w-12">&nbsp;</TableHead>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <OrdersTableSkeleton rows={pageSize} />
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <RefreshCw className="h-8 w-8 opacity-50" />
                      <p className="font-medium">Failed to load orders</p>
                      <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : !data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <PackageX className="h-8 w-8 opacity-50" />
                      <p className="font-medium">No orders found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.data.map((order) => {
                  const { primary: route, extra } = formatRoute(order.stops)
                  const pickupStop = order.stops.find((s) => s.type === 'pick_up')

                  return (
                    <TableRow
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      <TableCell className="font-mono text-xs font-medium">
                        {order.referenceNumber}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <StatusBadge
                          orderId={order.id}
                          status={order.status}
                          interactive
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-sm">{route}</div>
                        {extra > 0 && (
                          <span className="text-xs text-muted-foreground">+{extra} stop{extra > 1 ? 's' : ''}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{order.carrier.name}</div>
                        <div className="text-xs text-muted-foreground">{order.carrier.mcNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{EQUIPMENT_LABELS[order.equipmentType]}</div>
                        <div className="text-xs text-muted-foreground">{LOAD_TYPE_LABELS[order.loadType]}</div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {pickupStop?.appointmentDate
                          ? formatDateShort(pickupStop.appointmentDate)
                          : '—'}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatCurrency(order.rate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {order.stops.length}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            {order.status === 'pending' && (
                              <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}/edit`)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicateAsDraft(order)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate as Draft
                            </DropdownMenuItem>
                            {order.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(order)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            {formatPaginationInfo(page, pageSize, data.total)}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v) as typeof pageSize)}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                ‹
              </Button>
              <span className="text-sm px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteOrderDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          orderId={deleteTarget.id}
          referenceNumber={deleteTarget.referenceNumber}
        />
      )}
    </div>
  )
}

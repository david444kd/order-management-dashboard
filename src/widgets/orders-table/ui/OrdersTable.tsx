import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pagination } from '@/shared/ui/pagination'
import { useOrders } from '@/entities/order'
import type { Order } from '@/entities/order'
import { PAGE_SIZES } from '@/shared/config/constants'
import type { PageSize } from '@/shared/config/constants'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useUIStore } from '@/features/manage-drafts'
import { DeleteOrderDialog } from '@/features/delete-order'
import { OrdersTableView } from './OrdersTableView'

export function OrdersTable() {
  const navigate = useNavigate()
  const { filters, sort, page, pageSize, setPage, setPageSize } = useUIStore()
  const debouncedSearch = useDebounce(filters.search, 300)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } = useOrders({
    page,
    pageSize,
    sortBy: sort?.column,
    sortOrder: sort?.direction,
    status: filters.status.length > 0 ? filters.status : undefined,
    search: debouncedSearch || undefined,
  })

  const showSkeleton = isLoading || (isFetching && isPlaceholderData)

  return (
    <div className="space-y-4">
      <OrdersTableView
        orders={data?.data ?? []}
        isLoading={showSkeleton}
        isError={isError}
        skeletonRows={pageSize}
        onRetry={refetch}
        onRowClick={(id) => navigate(`/orders/${id}`)}
        onView={(id) => navigate(`/orders/${id}`)}
        onDelete={(order) => setDeleteTarget(order)}
      />

      {data && data.total > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          pageSizes={PAGE_SIZES}
          onPageChange={setPage}
          onPageSizeChange={(v) => {
            setPageSize(v as PageSize)
          }}
        />
      )}

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

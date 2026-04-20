import { useState } from 'react'
import { Pagination } from '@/shared/ui/pagination'
import { useOrders } from '@/entities/order'
import { PAGE_SIZES } from '@/shared/config/constants'
import type { PageSize } from '@/shared/config/constants'
import { OrdersTableView } from './OrdersTableView'

export function OrdersTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } = useOrders({
    page,
    pageSize,
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
            setPage(1)
          }}
        />
      )}
    </div>
  )
}

import { OrdersFilters } from '@/features/filter-orders'
import { NewOrderButton } from '@/features/start-order-draft'
import { OrdersTable } from '@/widgets/orders-table'
import { DraftsList } from '@/widgets/drafts-list'

export function OrdersListPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and track all shipment orders</p>
          </div>
          <NewOrderButton />
        </div>

        {/* Local drafts section (hidden when empty) */}
        <DraftsList />

        {/* Filters */}
        <OrdersFilters />

        {/* Orders table */}
        <OrdersTable />
      </div>
    </div>
  )
}

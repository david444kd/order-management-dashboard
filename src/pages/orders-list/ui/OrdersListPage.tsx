import { OrdersTable } from '@/widgets/orders-table'

export function OrdersListPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track all shipment orders</p>
        </div>
        <OrdersTable />
      </div>
    </div>
  )
}

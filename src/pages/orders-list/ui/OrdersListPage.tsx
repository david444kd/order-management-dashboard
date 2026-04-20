import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { OrdersFilters } from '@/features/filter-orders'
import { useDraftsStore } from '@/features/manage-drafts'
import { MAX_DRAFTS } from '@/shared/config/constants'
import { OrdersTable } from '@/widgets/orders-table'
import { DraftsList } from '@/widgets/drafts-list'

export function OrdersListPage() {
  const navigate = useNavigate()
  const { drafts, createDraft, loadFromStorage, setActiveDraft } = useDraftsStore()

  const handleNewOrder = () => {
    loadFromStorage()
    if (drafts.length >= MAX_DRAFTS) {
      toast.error(`Maximum ${MAX_DRAFTS} drafts allowed. Close a draft first.`)
      return
    }
    const draftId = createDraft()
    setActiveDraft(draftId)
    navigate('/orders/new')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage and track all shipment orders</p>
          </div>
          <Button onClick={handleNewOrder} className="gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
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

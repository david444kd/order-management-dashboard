import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { useDraftsStore } from '@/features/manage-drafts'
import { MAX_DRAFTS } from '@/shared/config/constants'

export function NewOrderButton() {
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
    <Button onClick={handleNewOrder} className="gap-2">
      <Plus className="h-4 w-4" />
      New Order
    </Button>
  )
}

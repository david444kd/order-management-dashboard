import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Check, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/shared/lib/utils'
import { MAX_DRAFTS } from '@/shared/config/constants'
import { useDraftsStore } from '@/features/manage-drafts'
import { useCreateOrder } from '@/entities/order'
import { DraftTabForm } from './DraftTabForm'

export function DraftWorkspace() {
  const navigate = useNavigate()
  const {
    drafts,
    activeDraftId,
    createDraft,
    loadFromStorage,
    ensureInitialDraft,
    deleteDraft,
    setActiveDraft,
    clearAllDrafts,
    loaded,
  } = useDraftsStore()

  const { mutate: createOrder, isPending: isSubmitting } = useCreateOrder()

  // Restore drafts from localStorage on first open.
  useEffect(() => {
    loadFromStorage()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Create initial draft only after storage restore completes.
  useEffect(() => {
    if (!loaded) return
    ensureInitialDraft()
  }, [loaded, ensureInitialDraft])

  const handleNewTab = useCallback(() => {
    if (drafts.length >= MAX_DRAFTS) {
      toast.error(`Maximum ${MAX_DRAFTS} drafts allowed`)
      return
    }
    createDraft()
  }, [drafts.length, createDraft])

  const handleClose = () => {
    navigate('/orders')
  }

  const activeDraft = drafts.find((d) => d.id === activeDraftId)

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        {/* Tab bar */}
        <div className="flex items-center overflow-x-auto scrollbar-hide border-b">
          <div className="flex items-center min-w-0 flex-1">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => setActiveDraft(draft.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap border-r transition-colors group shrink-0 max-w-[180px]',
                  activeDraftId === draft.id
                    ? 'bg-background text-foreground font-medium border-b-2 border-b-primary -mb-px'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span className="truncate">{draft.title}</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteDraft(draft.id)
                  }}
                  className="ml-1 h-4 w-4 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-destructive/20 flex items-center justify-center shrink-0 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            ))}
            {drafts.length < MAX_DRAFTS && (
              <button
                onClick={handleNewTab}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 px-3 shrink-0 border-l ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5 text-xs"
              onClick={() => {
                clearAllDrafts()
                navigate('/orders')
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose} className="gap-1.5 text-xs">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-2 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold">
              {activeDraft?.title ?? 'Draft Workspace'}
            </h2>
            {activeDraft && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3.5 w-3.5" />
                Draft saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive border-destructive/30"
              disabled={!activeDraft}
              onClick={() => activeDraft && deleteDraft(activeDraft.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Draft
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={isSubmitting || !activeDraft}
              data-submit-draft
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Submit Draft
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Form area */}
      <ScrollArea className="flex-1 h-0">
        {activeDraft ? (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <DraftTabForm
              key={activeDraft.id}
              draftId={activeDraft.id}
              defaultValues={activeDraft.formData}
              onSubmit={(data) => {
                createOrder(data, {
                  onSuccess: (order) => {
                    toast.success(`Order ${order.referenceNumber} created!`)
                    deleteDraft(activeDraft.id)
                    if (drafts.length <= 1) {
                      navigate('/orders')
                    }
                  },
                  onError: (err) => {
                    toast.error(err.message)
                  },
                })
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <AlertTriangle className="h-8 w-8 opacity-50" />
            <p>No drafts open. Click + to create one.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

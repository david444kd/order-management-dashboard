import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Trash2, ExternalLink, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/shared/ui/button'
import { useDraftsStore } from '@/features/manage-drafts'

export function DraftsList() {
  const { drafts, deleteDraft, setActiveDraft, loadFromStorage } = useDraftsStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  if (drafts.length === 0) return null

  const handleResume = (id: string) => {
    setActiveDraft(id)
    navigate('/orders/new')
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Local Drafts</h3>
          <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
            {drafts.length}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Unsaved orders — continue where you left off</span>
      </div>
      <div className="divide-y">
        {drafts.map((draft) => (
          <div key={draft.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{draft.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(parseISO(draft.savedAt), 'MMM d, h:mm a')}
                  </span>
                  {draft.formData.clientName && (
                    <>
                      <span>·</span>
                      <span>{draft.formData.clientName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handleResume(draft.id)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Resume
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5"
                onClick={() => deleteDraft(draft.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Discard
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

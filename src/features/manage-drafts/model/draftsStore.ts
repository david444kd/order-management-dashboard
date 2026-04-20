import { create } from 'zustand'
import { generateOrderRef } from '@/shared/lib/generateOrderRef'
import { generateId } from '@/shared/lib/generateId'
import { MAX_DRAFTS } from '@/shared/config/constants'
import {
  saveDraft,
  removeDraft,
  saveDraftIndex,
  loadAllDrafts,
  removeAllDrafts,
} from '@/entities/draft'
import type { LocalDraft } from '@/entities/draft'
import type { CreateOrderInput } from '@/shared/zod/orderSchemas'

interface DraftsState {
  drafts: LocalDraft[]
  activeDraftId: string | null
  loaded: boolean

  loadFromStorage: () => void
  ensureInitialDraft: () => void
  createDraft: () => string
  updateDraft: (id: string, data: Partial<CreateOrderInput>) => void
  updateDraftTitle: (id: string, title: string) => void
  deleteDraft: (id: string) => void
  setActiveDraft: (id: string | null) => void
  clearAllDrafts: () => void
}

function persistDrafts(drafts: LocalDraft[]): void {
  drafts.forEach((d) => saveDraft(d))
  saveDraftIndex(drafts.map((d) => d.id))
}

export const useDraftsStore = create<DraftsState>((set, get) => ({
  drafts: [],
  activeDraftId: null,
  loaded: false,

  loadFromStorage: () => {
    if (get().loaded) return
    const loaded = loadAllDrafts()
    const activeDraftId = loaded.length > 0 ? loaded[0].id : null
    set({ drafts: loaded, activeDraftId, loaded: true })
  },

  ensureInitialDraft: () => {
    const { drafts, createDraft } = get()
    if (drafts.length === 0) createDraft()
  },

  createDraft: () => {
    const { drafts } = get()
    if (drafts.length >= MAX_DRAFTS) return drafts[drafts.length - 1].id

    const id = generateId('draft')
    const newDraft: LocalDraft = {
      id,
      title: 'New Draft',
      formData: {
        referenceNumber: generateOrderRef(),
        stops: [
          {
            id: generateId('stop'),
            type: 'pick_up',
            order: 0,
            address: { city: '', state: '', zip: '' },
            appointmentType: 'fixed',
            appointmentDate: '',
          },
          {
            id: generateId('stop'),
            type: 'drop_off',
            order: 1,
            address: { city: '', state: '', zip: '' },
            appointmentType: 'fixed',
            appointmentDate: '',
          },
        ],
      },
      savedAt: new Date().toISOString(),
    }

    const updated = [...drafts, newDraft]
    persistDrafts(updated)
    set({ drafts: updated, activeDraftId: id })
    return id
  },

  updateDraft: (id, data) => {
    const { drafts } = get()
    const updated = drafts.map((d) => {
      if (d.id !== id) return d
      const mergedFormData: Partial<CreateOrderInput> = {
        ...d.formData,
        ...data,
      }
      const next: LocalDraft = {
        ...d,
        formData: mergedFormData,
        savedAt: new Date().toISOString(),
        title:
          (mergedFormData.referenceNumber && mergedFormData.referenceNumber !== 'ORD-YYYY-NNNN'
            ? mergedFormData.referenceNumber
            : null) ?? d.title,
      }
      saveDraft(next)
      return next
    })
    set({ drafts: updated })
  },

  updateDraftTitle: (id, title) => {
    const { drafts } = get()
    const updated = drafts.map((d) => {
      if (d.id !== id) return d
      const next = { ...d, title }
      saveDraft(next)
      return next
    })
    set({ drafts: updated })
  },

  deleteDraft: (id) => {
    const { drafts, activeDraftId } = get()
    removeDraft(id)
    const updated = drafts.filter((d) => d.id !== id)
    saveDraftIndex(updated.map((d) => d.id))
    const newActive =
      activeDraftId === id ? (updated.length > 0 ? updated[0].id : null) : activeDraftId
    set({ drafts: updated, activeDraftId: newActive })
  },

  setActiveDraft: (id) => {
    set({ activeDraftId: id })
  },

  clearAllDrafts: () => {
    removeAllDrafts()
    set({ drafts: [], activeDraftId: null })
  },
}))

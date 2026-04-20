import { beforeEach, describe, expect, it } from 'vitest'
import { useDraftsStore } from './draftsStore'
import { loadDraftIndex, loadDraft } from '@/entities/draft'
import { MAX_DRAFTS } from '@/shared/config/constants'

beforeEach(() => {
  localStorage.clear()
  useDraftsStore.setState({ drafts: [], activeDraftId: null, loaded: false })
})

describe('createDraft', () => {
  it('создаёт черновик с правильной структурой', () => {
    const id = useDraftsStore.getState().createDraft()
    const { drafts, activeDraftId } = useDraftsStore.getState()

    expect(drafts).toHaveLength(1)
    expect(activeDraftId).toBe(id)
    expect(id.startsWith('draft_')).toBe(true)
  })

  it('инициализирует два стопа: pick_up и drop_off', () => {
    useDraftsStore.getState().createDraft()
    const stops = useDraftsStore.getState().drafts[0].formData.stops!

    expect(stops).toHaveLength(2)
    expect(stops[0].type).toBe('pick_up')
    expect(stops[1].type).toBe('drop_off')
    expect(stops[0].id).not.toBe(stops[1].id)
  })

  it('сохраняет черновик в localStorage', () => {
    const id = useDraftsStore.getState().createDraft()

    expect(loadDraftIndex()).toContain(id)
    expect(loadDraft(id)).not.toBeNull()
  })

  it(`не создаёт более ${MAX_DRAFTS} черновиков`, () => {
    for (let i = 0; i < MAX_DRAFTS + 2; i++) {
      useDraftsStore.getState().createDraft()
    }
    expect(useDraftsStore.getState().drafts).toHaveLength(MAX_DRAFTS)
  })

  it('возвращает id последнего черновика при попытке превысить лимит', () => {
    for (let i = 0; i < MAX_DRAFTS; i++) {
      useDraftsStore.getState().createDraft()
    }
    const lastId = useDraftsStore.getState().drafts[MAX_DRAFTS - 1].id
    const returnedId = useDraftsStore.getState().createDraft()

    expect(returnedId).toBe(lastId)
  })
})

describe('updateDraft', () => {
  it('мержит частичные данные, не затирая остальные поля', () => {
    const id = useDraftsStore.getState().createDraft()
    const originalRef = useDraftsStore.getState().drafts[0].formData.referenceNumber

    useDraftsStore.getState().updateDraft(id, { clientName: 'ACME Corp' })
    const formData = useDraftsStore.getState().drafts[0].formData

    expect(formData.clientName).toBe('ACME Corp')
    expect(formData.referenceNumber).toBe(originalRef)
  })

  it('обновляет title если передан referenceNumber', () => {
    const id = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().updateDraft(id, { referenceNumber: 'ORD-2026-0042' })

    expect(useDraftsStore.getState().drafts[0].title).toBe('ORD-2026-0042')
  })

  it('сохраняет изменения в localStorage', () => {
    const id = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().updateDraft(id, { clientName: 'Saved Corp' })

    const persisted = loadDraft(id)
    expect(persisted?.formData.clientName).toBe('Saved Corp')
  })

  it('не трогает другие черновики', () => {
    const first = useDraftsStore.getState().createDraft()
    const second = useDraftsStore.getState().createDraft()

    useDraftsStore.getState().updateDraft(first, { clientName: 'First Corp' })

    const secondDraft = useDraftsStore.getState().drafts.find((d) => d.id === second)
    expect(secondDraft?.formData.clientName).toBeUndefined()
  })
})

describe('deleteDraft', () => {
  it('удаляет черновик из стора и localStorage', () => {
    const id = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().deleteDraft(id)

    expect(useDraftsStore.getState().drafts).toHaveLength(0)
    expect(loadDraft(id)).toBeNull()
    expect(loadDraftIndex()).not.toContain(id)
  })

  it('при удалении активного переключается на первый оставшийся', () => {
    const first = useDraftsStore.getState().createDraft()
    const second = useDraftsStore.getState().createDraft()

    useDraftsStore.getState().deleteDraft(second)

    expect(useDraftsStore.getState().activeDraftId).toBe(first)
  })

  it('при удалении неактивного активный не меняется', () => {
    const first = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().createDraft()
    useDraftsStore.getState().setActiveDraft(first)

    const third = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().deleteDraft(third)

    expect(useDraftsStore.getState().activeDraftId).toBe(first)
  })

  it('activeDraftId становится null когда все черновики удалены', () => {
    const id = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().deleteDraft(id)

    expect(useDraftsStore.getState().activeDraftId).toBeNull()
  })
})

describe('loadFromStorage', () => {
  it('восстанавливает черновики из localStorage', () => {
    const id = useDraftsStore.getState().createDraft()
    useDraftsStore.getState().updateDraft(id, { clientName: 'Persisted' })

    useDraftsStore.setState({ drafts: [], activeDraftId: null, loaded: false })
    useDraftsStore.getState().loadFromStorage()

    const { drafts } = useDraftsStore.getState()
    expect(drafts).toHaveLength(1)
    expect(drafts[0].formData.clientName).toBe('Persisted')
  })

  it('не загружает повторно если уже loaded', () => {
    useDraftsStore.getState().createDraft()

    useDraftsStore.setState({ loaded: true })
    useDraftsStore.getState().loadFromStorage()

    expect(useDraftsStore.getState().drafts).toHaveLength(1)
  })

  it('устанавливает activeDraftId на первый черновик', () => {
    const id = useDraftsStore.getState().createDraft()

    useDraftsStore.setState({ drafts: [], activeDraftId: null, loaded: false })
    useDraftsStore.getState().loadFromStorage()

    expect(useDraftsStore.getState().activeDraftId).toBe(id)
  })
})

describe('clearAllDrafts', () => {
  it('очищает стор и localStorage полностью', () => {
    useDraftsStore.getState().createDraft()
    useDraftsStore.getState().createDraft()
    useDraftsStore.getState().clearAllDrafts()

    const { drafts, activeDraftId } = useDraftsStore.getState()
    expect(drafts).toHaveLength(0)
    expect(activeDraftId).toBeNull()
    expect(loadDraftIndex()).toHaveLength(0)
  })
})

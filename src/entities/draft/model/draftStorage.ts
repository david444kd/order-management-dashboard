import { DRAFT_INDEX_KEY, DRAFT_KEY_PREFIX } from '@/shared/config/constants'
import type { LocalDraft } from './types'

export function saveDraft(draft: LocalDraft): void {
  localStorage.setItem(`${DRAFT_KEY_PREFIX}${draft.id}`, JSON.stringify(draft))
}

export function loadDraft(id: string): LocalDraft | null {
  const raw = localStorage.getItem(`${DRAFT_KEY_PREFIX}${id}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LocalDraft
  } catch {
    return null
  }
}

export function removeDraft(id: string): void {
  localStorage.removeItem(`${DRAFT_KEY_PREFIX}${id}`)
}

export function saveDraftIndex(ids: string[]): void {
  localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(ids))
}

export function loadDraftIndex(): string[] {
  const raw = localStorage.getItem(DRAFT_INDEX_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

export function loadAllDrafts(): LocalDraft[] {
  const ids = loadDraftIndex()
  return ids
    .map((id) => loadDraft(id))
    .filter((d): d is LocalDraft => d !== null)
}

export function removeAllDrafts(): void {
  const ids = loadDraftIndex()
  ids.forEach((id) => removeDraft(id))
  localStorage.removeItem(DRAFT_INDEX_KEY)
}

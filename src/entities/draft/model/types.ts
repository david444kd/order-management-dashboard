import type { CreateOrderInput } from '@/shared/zod/orderSchemas'

export interface LocalDraft {
  id: string
  title: string
  formData: Partial<CreateOrderInput>
  savedAt: string
}

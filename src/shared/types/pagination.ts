import type { PageSize } from '@/shared/config/constants'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: PageSize
}

export type SortDirection = 'asc' | 'desc'

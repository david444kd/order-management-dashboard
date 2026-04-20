import { create } from 'zustand'
import type { OrderStatus } from '@/entities/order'
import type { PageSize } from '@/shared/config/constants'

type SortableColumn = 'pickupDate' | 'rate' | 'status' | 'referenceNumber'
type SortDirection = 'asc' | 'desc'

interface TableFilters {
  status: OrderStatus[]
  search: string
}

interface UIState {
  filters: TableFilters
  sort: { column: SortableColumn; direction: SortDirection } | null
  page: number
  pageSize: PageSize

  setFilters: (filters: Partial<TableFilters>) => void
  setSort: (column: SortableColumn) => void
  setPage: (page: number) => void
  setPageSize: (size: PageSize) => void
  clearFilters: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  filters: { status: [], search: '' },
  sort: null,
  page: 1,
  pageSize: 10,

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    }))
  },

  setSort: (column) => {
    const { sort } = get()
    if (sort?.column === column) {
      set({ sort: { column, direction: sort.direction === 'asc' ? 'desc' : 'asc' } })
    } else {
      set({ sort: { column, direction: 'asc' } })
    }
    set({ page: 1 })
  },

  setPage: (page) => set({ page }),

  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  clearFilters: () => set({ filters: { status: [], search: '' }, page: 1 }),
}))

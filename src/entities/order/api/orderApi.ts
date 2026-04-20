import { delay, maybeError } from '@/shared/api/mockClient'
import { MOCK_DB_ORDERS_KEY, MOCK_DB_CARRIERS_KEY } from '@/shared/config/constants'
import type { PageSize } from '@/shared/config/constants'
import type { PaginatedResponse, SortDirection } from '@/shared/types/pagination'
import { SEED_ORDERS, SEED_CARRIERS } from '../model/seeds'
import type { Order, OrderStatus, Carrier } from '../model/types'

function getOrdersDB(): Order[] {
  const raw = localStorage.getItem(MOCK_DB_ORDERS_KEY)
  if (!raw) {
    localStorage.setItem(MOCK_DB_ORDERS_KEY, JSON.stringify(SEED_ORDERS))
    return SEED_ORDERS
  }
  try {
    return JSON.parse(raw) as Order[]
  } catch {
    return SEED_ORDERS
  }
}

function getCarriersDB(): Carrier[] {
  const raw = localStorage.getItem(MOCK_DB_CARRIERS_KEY)
  if (!raw) {
    localStorage.setItem(MOCK_DB_CARRIERS_KEY, JSON.stringify(SEED_CARRIERS))
    return SEED_CARRIERS
  }
  try {
    return JSON.parse(raw) as Carrier[]
  } catch {
    return SEED_CARRIERS
  }
}

export const orderKeys = {
  all: () => ['orders'] as const,
  list: (params: GetOrdersParams) => ['orders', 'list', params] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  carriers: (search?: string) => ['carriers', search ?? ''] as const,
}

export interface GetOrdersParams {
  page: number
  pageSize: PageSize
  sortBy?: 'pickupDate' | 'rate' | 'status' | 'referenceNumber'
  sortOrder?: SortDirection
  status?: OrderStatus[]
  search?: string
}

export const orderApi = {
  async getOrders(params: GetOrdersParams): Promise<PaginatedResponse<Order>> {
    await delay()
    maybeError()

    let orders = getOrdersDB()

    if (params.status && params.status.length > 0) {
      orders = orders.filter((o) => params.status!.includes(o.status))
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase()
      orders = orders.filter(
        (o) =>
          o.referenceNumber.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.carrier.name.toLowerCase().includes(q) ||
          o.stops.some(
            (s) =>
              s.address.city.toLowerCase().includes(q) ||
              s.address.state.toLowerCase().includes(q),
          ),
      )
    }

    if (params.sortBy) {
      const dir = params.sortOrder === 'desc' ? -1 : 1
      orders = [...orders].sort((a, b) => {
        switch (params.sortBy) {
          case 'rate':
            return (a.rate - b.rate) * dir
          case 'status':
            return a.status.localeCompare(b.status) * dir
          case 'referenceNumber':
            return a.referenceNumber.localeCompare(b.referenceNumber) * dir
          case 'pickupDate': {
            const aPickup = a.stops.find((s) => s.type === 'pick_up')?.appointmentDate ?? ''
            const bPickup = b.stops.find((s) => s.type === 'pick_up')?.appointmentDate ?? ''
            return aPickup.localeCompare(bPickup) * dir
          }
          default:
            return 0
        }
      })
    }

    const total = orders.length
    const start = (params.page - 1) * params.pageSize
    const data = orders.slice(start, start + params.pageSize)

    return { data, total, page: params.page, pageSize: params.pageSize }
  },

  async getOrder(id: string): Promise<Order> {
    await delay()
    maybeError()

    const orders = getOrdersDB()
    const order = orders.find((o) => o.id === id)
    if (!order) throw new Error(`Order ${id} not found`)
    return order
  },

  async getCarriers(params?: { search?: string }): Promise<Carrier[]> {
    await delay(100, 300)

    const carriers = getCarriersDB()
    if (!params?.search) return carriers

    const q = params.search.toLowerCase()
    return carriers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mcNumber.toLowerCase().includes(q),
    )
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    await delay()
    maybeError()

    const orders = getOrdersDB()
    const idx = orders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error(`Order ${id} not found`)

    const order = orders[idx]
    const updated: Order = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...order.statusHistory,
        { from: order.status, to: status, changedAt: new Date().toISOString(), note },
      ],
    }
    orders[idx] = updated
    localStorage.setItem(MOCK_DB_ORDERS_KEY, JSON.stringify(orders))
    return updated
  },

  async deleteOrder(id: string): Promise<void> {
    await delay()
    maybeError()

    const orders = getOrdersDB()
    const order = orders.find((o) => o.id === id)
    if (!order) throw new Error(`Order ${id} not found`)
    if (order.status !== 'pending') throw new Error('Only pending orders can be deleted')

    const updated = orders.filter((o) => o.id !== id)
    localStorage.setItem(MOCK_DB_ORDERS_KEY, JSON.stringify(updated))
  },
}

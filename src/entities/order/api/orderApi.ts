import { delay, maybeError } from '@/shared/api/mockClient'
import { generateId } from '@/shared/lib/generateId'
import { MOCK_DB_ORDERS_KEY, MOCK_DB_CARRIERS_KEY } from '@/shared/config/constants'
import type { PageSize } from '@/shared/config/constants'
import type { PaginatedResponse, SortDirection } from '@/shared/types/pagination'
import { SEED_ORDERS, SEED_CARRIERS } from '../model/seeds'
import type { Order, OrderStatus, Carrier } from '../model/types'
import type { CreateOrderInput } from '@/shared/zod/orderSchemas'

// --- DB helpers ---

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

function setOrdersDB(orders: Order[]): void {
  localStorage.setItem(MOCK_DB_ORDERS_KEY, JSON.stringify(orders))
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

// --- Query key factory ---

export const orderKeys = {
  all: () => ['orders'] as const,
  list: (params: GetOrdersParams) => ['orders', 'list', params] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
  carriers: (search?: string) => ['carriers', search ?? ''] as const,
}

// --- Types ---

export interface GetOrdersParams {
  page: number
  pageSize: PageSize
  sortBy?: 'pickupDate' | 'rate' | 'status' | 'referenceNumber'
  sortOrder?: SortDirection
  status?: OrderStatus[]
  search?: string
}

// --- API ---

export const orderApi = {
  async getOrders(params: GetOrdersParams): Promise<PaginatedResponse<Order>> {
    await delay()
    maybeError()

    let orders = getOrdersDB()

    // Filter by status
    if (params.status && params.status.length > 0) {
      orders = orders.filter((o) => params.status!.includes(o.status))
    }

    // Filter by search
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

    // Sort
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

  async createOrder(input: CreateOrderInput): Promise<Order> {
    await delay()
    maybeError()

    const carriers = getCarriersDB()
    const carrier = carriers.find((c) => c.id === input.carrierId)
    if (!carrier) throw new Error('Carrier not found')

    const orders = getOrdersDB()
    const now = new Date().toISOString()

    const newOrder: Order = {
      id: generateId('order'),
      referenceNumber: input.referenceNumber,
      status: 'pending',
      clientName: input.clientName,
      carrier,
      equipmentType: input.equipmentType,
      loadType: input.loadType,
      stops: input.stops.map((stop, idx) => ({
        id: stop.id ?? generateId('stop'),
        type: stop.type,
        order: idx,
        address: stop.address,
        locationName: stop.locationName ?? undefined,
        refNumber: stop.refNumber ?? undefined,
        appointmentType: stop.appointmentType,
        appointmentDate: stop.appointmentDate,
        notes: stop.notes ?? undefined,
      })),
      weight: input.weight,
      rate: input.rate,
      notes: input.notes ?? '',
      statusHistory: [{ from: null, to: 'pending', changedAt: now, note: 'Order created' }],
      createdAt: now,
      updatedAt: now,
    }

    setOrdersDB([...orders, newOrder])
    return newOrder
  },

  async updateOrder(id: string, input: Partial<CreateOrderInput>): Promise<Order> {
    await delay()
    maybeError()

    const orders = getOrdersDB()
    const idx = orders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error(`Order ${id} not found`)

    const existing = orders[idx]
    if (existing.status !== 'pending') throw new Error('Only pending orders can be edited')

    let carrier = existing.carrier
    if (input.carrierId && input.carrierId !== existing.carrier.id) {
      const carriers = getCarriersDB()
      const found = carriers.find((c) => c.id === input.carrierId)
      if (!found) throw new Error('Carrier not found')
      carrier = found
    }

    const updated: Order = {
      ...existing,
      ...(input.clientName !== undefined && { clientName: input.clientName }),
      ...(input.referenceNumber !== undefined && { referenceNumber: input.referenceNumber }),
      carrier,
      ...(input.equipmentType !== undefined && { equipmentType: input.equipmentType }),
      ...(input.loadType !== undefined && { loadType: input.loadType }),
      ...(input.weight !== undefined && { weight: input.weight }),
      ...(input.rate !== undefined && { rate: input.rate }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.stops !== undefined && {
        stops: input.stops.map((stop, i) => ({
          id: stop.id ?? generateId('stop'),
          type: stop.type,
          order: i,
          address: stop.address,
          locationName: stop.locationName ?? undefined,
          refNumber: stop.refNumber ?? undefined,
          appointmentType: stop.appointmentType,
          appointmentDate: stop.appointmentDate,
          notes: stop.notes ?? undefined,
        })),
      }),
      updatedAt: new Date().toISOString(),
    }

    const updatedOrders = [...orders]
    updatedOrders[idx] = updated
    setOrdersDB(updatedOrders)
    return updated
  },

  async deleteOrder(id: string): Promise<void> {
    await delay()
    maybeError()

    const orders = getOrdersDB()
    const order = orders.find((o) => o.id === id)
    if (!order) throw new Error(`Order ${id} not found`)
    if (order.status !== 'pending') throw new Error('Only pending orders can be deleted')

    setOrdersDB(orders.filter((o) => o.id !== id))
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    await delay()
    maybeError()

    const orders = getOrdersDB()
    const idx = orders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error(`Order ${id} not found`)

    const existing = orders[idx]
    const now = new Date().toISOString()

    const updated: Order = {
      ...existing,
      status,
      statusHistory: [
        ...existing.statusHistory,
        { from: existing.status, to: status, changedAt: now, ...(note ? { note } : {}) },
      ],
      updatedAt: now,
    }

    const updatedOrders = [...orders]
    updatedOrders[idx] = updated
    setOrdersDB(updatedOrders)
    return updated
  },

  async getCarriers(params?: { search?: string }): Promise<Carrier[]> {
    await delay(100, 300)
    // carriers don't throw random errors

    const carriers = getCarriersDB()
    if (!params?.search) return carriers

    const q = params.search.toLowerCase()
    return carriers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mcNumber.toLowerCase().includes(q),
    )
  },
}

import type { OrderStatus } from '@/entities/order'

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export function getValidTransitions(status: OrderStatus): OrderStatus[] {
  return TRANSITIONS[status]
}

export function isFinalStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0
}

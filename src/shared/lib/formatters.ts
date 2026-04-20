import { format, parseISO } from 'date-fns'
import type { Stop } from '@/entities/order/model/types'

export function formatDate(isoString: string | null): string {
  if (!isoString) return '—'
  try {
    return format(parseISO(isoString), 'MMM d, h:mm a')
  } catch {
    return '—'
  }
}

export function formatDateShort(isoString: string | null): string {
  if (!isoString) return '—'
  try {
    return format(parseISO(isoString), 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatWeight(lbs: number): string {
  return `${new Intl.NumberFormat('en-US').format(lbs)} lbs`
}

export function formatRoute(stops: Stop[]): { primary: string; extra: number } {
  const pickup = stops.find((s) => s.type === 'pick_up')
  const dropoff = stops.find((s) => s.type === 'drop_off')
  const extraStops = stops.filter((s) => s.type === 'stop').length

  const pickupCity = pickup ? `${pickup.address.city}, ${pickup.address.state}` : '?'
  const dropoffCity = dropoff ? `${dropoff.address.city}, ${dropoff.address.state}` : '?'

  return { primary: `${pickupCity} → ${dropoffCity}`, extra: extraStops }
}

export function formatPaginationInfo(
  page: number,
  pageSize: number,
  total: number,
): string {
  if (total === 0) return 'No results'
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return `Showing ${from}–${to} of ${total}`
}

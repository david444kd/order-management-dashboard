import { MOCK_DB_ORDERS_KEY } from '@/shared/config/constants'

type OrderRefRecord = {
  referenceNumber: string
}

export function generateOrderRef(): string {
  const year = new Date().getFullYear()
  let maxNum = 0

  try {
    const raw = localStorage.getItem(MOCK_DB_ORDERS_KEY)
    if (raw) {
      const orders = JSON.parse(raw) as OrderRefRecord[]
      for (const order of orders) {
        const match = order.referenceNumber.match(/ORD-\d{4}-(\d{4})/)
        if (match) {
          const num = parseInt(match[1], 10)
          if (num > maxNum) maxNum = num
        }
      }
    }
  } catch {
    // ignore parse errors
  }

  const next = String(maxNum + 1).padStart(4, '0')
  return `ORD-${year}-${next}`
}

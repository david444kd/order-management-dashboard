import { describe, expect, it } from 'vitest'
import { getValidTransitions, isFinalStatus } from './transitions'
import type { OrderStatus } from '@/entities/order'

describe('getValidTransitions', () => {
  it('pending → in_transit, cancelled', () => {
    expect(getValidTransitions('pending')).toEqual(['in_transit', 'cancelled'])
  })

  it('in_transit → delivered, cancelled', () => {
    expect(getValidTransitions('in_transit')).toEqual(['delivered', 'cancelled'])
  })

  it('delivered has no transitions', () => {
    expect(getValidTransitions('delivered')).toEqual([])
  })

  it('cancelled has no transitions', () => {
    expect(getValidTransitions('cancelled')).toEqual([])
  })

  it('pending cannot skip directly to delivered', () => {
    expect(getValidTransitions('pending')).not.toContain('delivered')
  })

  it('in_transit cannot go back to pending', () => {
    expect(getValidTransitions('in_transit')).not.toContain('pending')
  })
})

describe('isFinalStatus', () => {
  const finalStatuses: OrderStatus[] = ['delivered', 'cancelled']
  const nonFinalStatuses: OrderStatus[] = ['pending', 'in_transit']

  it.each(finalStatuses)('%s is final', (status) => {
    expect(isFinalStatus(status)).toBe(true)
  })

  it.each(nonFinalStatuses)('%s is not final', (status) => {
    expect(isFinalStatus(status)).toBe(false)
  })
})

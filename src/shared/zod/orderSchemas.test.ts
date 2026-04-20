import { describe, expect, it } from 'vitest'
import { createOrderSchema, cancelOrderSchema, addressSchema, stopSchema, stopsSectionSchema } from './orderSchemas'

function validStop(overrides = {}) {
  return {
    type: 'pick_up' as const,
    order: 0,
    address: { city: 'Chicago', state: 'IL', zip: '60601' },
    appointmentType: 'fixed' as const,
    appointmentDate: new Date().toISOString(),
    ...overrides,
  }
}

function validPayload() {
  return {
    clientName: 'Acme Corp',
    referenceNumber: 'ORD-2026-0001',
    carrierId: 'c1',
    equipmentType: 'dry_van' as const,
    loadType: 'ftl' as const,
    rate: 1500,
    weight: 12000,
    notes: '',
    stops: [
      validStop({ type: 'pick_up', order: 0 }),
      validStop({ type: 'drop_off', order: 1, address: { city: 'Dallas', state: 'TX', zip: '75201' } }),
    ],
  }
}

describe('createOrderSchema', () => {
  it('принимает валидный payload', () => {
    expect(createOrderSchema.safeParse(validPayload()).success).toBe(true)
  })

  it('отклоняет пустой clientName', () => {
    const result = createOrderSchema.safeParse({ ...validPayload(), clientName: '' })
    expect(result.success).toBe(false)
  })

  it('отклоняет неверный формат referenceNumber', () => {
    const cases = ['ORD-26-001', 'ord-2026-0001', 'ORD2026-0001', '']
    cases.forEach((ref) => {
      const result = createOrderSchema.safeParse({ ...validPayload(), referenceNumber: ref })
      expect(result.success, `должен отклонить: ${ref}`).toBe(false)
    })
  })

  it('принимает корректный формат ORD-YYYY-NNNN', () => {
    const result = createOrderSchema.safeParse({ ...validPayload(), referenceNumber: 'ORD-2024-9999' })
    expect(result.success).toBe(true)
  })

  it('отклоняет отрицательный rate', () => {
    expect(createOrderSchema.safeParse({ ...validPayload(), rate: -100 }).success).toBe(false)
  })

  it('отклоняет weight > 80000', () => {
    expect(createOrderSchema.safeParse({ ...validPayload(), weight: 80001 }).success).toBe(false)
  })

  it('отклоняет стопы без drop_off', () => {
    const result = createOrderSchema.safeParse({
      ...validPayload(),
      stops: [validStop({ type: 'pick_up', order: 0 }), validStop({ type: 'pick_up', order: 1 })],
    })
    expect(result.success).toBe(false)
  })

  it('отклоняет стопы без pick_up', () => {
    const result = createOrderSchema.safeParse({
      ...validPayload(),
      stops: [validStop({ type: 'drop_off', order: 0 }), validStop({ type: 'drop_off', order: 1 })],
    })
    expect(result.success).toBe(false)
  })

  it('отклоняет менее 2 стопов', () => {
    const result = createOrderSchema.safeParse({
      ...validPayload(),
      stops: [validStop({ type: 'pick_up' })],
    })
    expect(result.success).toBe(false)
  })

  it('принимает промежуточный стоп типа stop между pick_up и drop_off', () => {
    const result = createOrderSchema.safeParse({
      ...validPayload(),
      stops: [
        validStop({ type: 'pick_up', order: 0 }),
        validStop({ type: 'stop', order: 1 }),
        validStop({ type: 'drop_off', order: 2 }),
      ],
    })
    expect(result.success).toBe(true)
  })

  it('отклоняет более 5 стопов', () => {
    const stops = [
      validStop({ type: 'pick_up', order: 0 }),
      validStop({ type: 'stop', order: 1 }),
      validStop({ type: 'stop', order: 2 }),
      validStop({ type: 'stop', order: 3 }),
      validStop({ type: 'stop', order: 4 }),
      validStop({ type: 'drop_off', order: 5 }),
    ]
    expect(createOrderSchema.safeParse({ ...validPayload(), stops }).success).toBe(false)
  })
})

describe('addressSchema', () => {
  it('принимает стандартный 5-значный ZIP', () => {
    expect(addressSchema.safeParse({ city: 'Chicago', state: 'IL', zip: '60601' }).success).toBe(true)
  })

  it('принимает расширенный ZIP+4', () => {
    expect(addressSchema.safeParse({ city: 'Chicago', state: 'IL', zip: '60601-1234' }).success).toBe(true)
  })

  it('отклоняет некорректный ZIP', () => {
    const bad = ['6060', '606011', 'ABCDE', '60601-12']
    bad.forEach((zip) => {
      expect(addressSchema.safeParse({ city: 'X', state: 'IL', zip }).success, `zip: ${zip}`).toBe(false)
    })
  })

  it('приводит state к верхнему регистру', () => {
    const result = addressSchema.safeParse({ city: 'Chicago', state: 'il', zip: '60601' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.state).toBe('IL')
  })

  it('отклоняет state длиннее 2 символов', () => {
    expect(addressSchema.safeParse({ city: 'X', state: 'ILL', zip: '60601' }).success).toBe(false)
  })
})

describe('stopSchema', () => {
  it('отклоняет стоп без appointmentDate', () => {
    const result = stopSchema.safeParse({ ...validStop(), appointmentDate: '' })
    expect(result.success).toBe(false)
  })

  it('отклоняет невалидную дату', () => {
    const result = stopSchema.safeParse({ ...validStop(), appointmentDate: 'not-a-date' })
    expect(result.success).toBe(false)
  })
})

describe('cancelOrderSchema', () => {
  it('отклоняет отмену без причины', () => {
    expect(cancelOrderSchema.safeParse({ to: 'cancelled', note: '' }).success).toBe(false)
  })

  it('отклоняет отмену с пробельной строкой', () => {
    expect(cancelOrderSchema.safeParse({ to: 'cancelled', note: '   ' }).success).toBe(false)
  })

  it('принимает отмену с причиной', () => {
    expect(cancelOrderSchema.safeParse({ to: 'cancelled', note: 'Customer request' }).success).toBe(true)
  })

  it('не принимает другие статусы', () => {
    expect(cancelOrderSchema.safeParse({ to: 'pending', note: 'reason' }).success).toBe(false)
  })
})

describe('stopsSectionSchema', () => {
  it('отклоняет дублирующийся pick_up без drop_off', () => {
    const result = stopsSectionSchema.safeParse({
      stops: [validStop({ type: 'pick_up' }), validStop({ type: 'pick_up' })],
    })
    expect(result.success).toBe(false)
  })
})

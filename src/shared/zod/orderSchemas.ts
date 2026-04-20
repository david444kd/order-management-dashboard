import { z } from 'zod'

// --- Enums ---
export const orderStatusSchema = z.enum(['pending', 'in_transit', 'delivered', 'cancelled'])
export const equipmentTypeSchema = z.enum(['dry_van', 'reefer', 'flatbed', 'step_deck'])
export const loadTypeSchema = z.enum(['ftl', 'ltl'])
export const stopTypeSchema = z.enum(['pick_up', 'drop_off', 'stop'])
export const appointmentTypeSchema = z.enum(['fixed', 'window', 'fcfs'])

// --- Address ---
export const addressSchema = z.object({
  city: z.string().min(1, 'City is required').max(100),
  state: z
    .string()
    .length(2, 'Use 2-letter state code')
    .transform((s) => s.toUpperCase()),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP (e.g. 60601)'),
})

// --- Stop ---
export const stopSchema = z.object({
  id: z.string().optional(),
  type: stopTypeSchema,
  order: z.number().int().min(0),
  address: addressSchema,
  locationName: z.string().max(200).optional().or(z.literal('')),
  refNumber: z.string().max(50).optional().or(z.literal('')),
  appointmentType: appointmentTypeSchema,
  appointmentDate: z
    .string()
    .min(1, 'Appointment date is required')
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date' }),
  notes: z.string().max(500).optional().or(z.literal('')),
})

// --- Section 1: Client ---
export const clientSectionSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(200).trim(),
})

// --- Section 2: Order ---
export const orderSectionSchema = z.object({
  referenceNumber: z
    .string()
    .regex(/^ORD-\d{4}-\d{4}$/, 'Format: ORD-YYYY-NNNN'),
  carrierId: z.string().min(1, 'Carrier is required'),
  equipmentType: equipmentTypeSchema,
  loadType: loadTypeSchema,
  rate: z.number().positive('Rate must be positive').max(999999.99, 'Rate too large'),
  weight: z.number().positive('Weight must be positive').max(80000, 'Max 80,000 lbs'),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

// --- Section 3: Stops ---
export const stopsSectionSchema = z
  .object({
    stops: z
      .array(stopSchema)
      .min(2, 'At least 2 stops required')
      .max(5, 'Maximum 5 stops'),
  })
  .refine(
    (data) => {
      const types = data.stops.map((s) => s.type)
      return types.includes('pick_up') && types.includes('drop_off')
    },
    { message: 'Must have at least one Pick Up and one Drop Off', path: ['stops'] },
  )

const createOrderBaseSchema = clientSectionSchema
  .merge(orderSectionSchema)
  .merge(
    z.object({
      stops: z
        .array(stopSchema)
        .min(2, 'At least 2 stops required')
        .max(5, 'Maximum 5 stops'),
    }),
  )

// --- Full create schema ---
export const createOrderSchema = createOrderBaseSchema
  .refine(
    (data) => {
      const types = data.stops.map((s) => s.type)
      return types.includes('pick_up') && types.includes('drop_off')
    },
    { message: 'Must have at least one Pick Up and one Drop Off', path: ['stops'] },
  )

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// --- Update schema ---
export const updateOrderSchema = createOrderBaseSchema.partial()
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>

// --- Status change schema ---
export const statusChangeSchema = z.object({
  to: orderStatusSchema,
  note: z.string().max(500).optional().or(z.literal('')),
})

// --- Cancel schema (note required) ---
export const cancelOrderSchema = z.object({
  to: z.literal('cancelled'),
  note: z.string().trim().min(1, 'Cancellation reason is required').max(500),
})
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

// --- Table filters schema ---
export const orderFiltersSchema = z.object({
  status: z.array(orderStatusSchema).optional(),
  search: z.string().max(200).optional(),
})
export type OrderFilters = z.infer<typeof orderFiltersSchema>

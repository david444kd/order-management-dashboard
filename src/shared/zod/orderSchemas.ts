import { z } from 'zod'

export const cancelOrderSchema = z.object({
  to: z.literal('cancelled'),
  note: z.string().min(1, 'Reason is required'),
})

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>

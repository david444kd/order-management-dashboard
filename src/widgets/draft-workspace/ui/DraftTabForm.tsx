import { useEffect, useRef, useCallback } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/shared/ui/form'
import { Button } from '@/shared/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { createOrderSchema, type CreateOrderInput } from '@/shared/zod/orderSchemas'
import { useDraftsStore } from '@/features/manage-drafts'
import { OrderFormFields } from '@/features/order-form'
import { AUTO_SAVE_INTERVAL } from '@/shared/config/constants'

interface DraftTabFormProps {
  draftId: string
  defaultValues: Partial<CreateOrderInput>
  onSubmit: (data: CreateOrderInput) => void
}

export function DraftTabForm({ draftId, defaultValues, onSubmit }: DraftTabFormProps) {
  const { updateDraft } = useDraftsStore()
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      clientName: defaultValues.clientName ?? '',
      referenceNumber: defaultValues.referenceNumber ?? '',
      carrierId: defaultValues.carrierId ?? '',
      equipmentType: defaultValues.equipmentType ?? 'dry_van',
      loadType: defaultValues.loadType ?? 'ftl',
      rate: defaultValues.rate ?? undefined,
      weight: defaultValues.weight ?? undefined,
      notes: defaultValues.notes ?? '',
      stops: defaultValues.stops ?? [
        {
          id: `s_${Date.now()}_0`,
          type: 'pick_up',
          order: 0,
          address: { city: '', state: '', zip: '' },
          locationName: '',
          refNumber: '',
          appointmentType: 'fixed',
          appointmentDate: '',
          notes: '',
        },
        {
          id: `s_${Date.now()}_1`,
          type: 'drop_off',
          order: 1,
          address: { city: '', state: '', zip: '' },
          locationName: '',
          refNumber: '',
          appointmentType: 'fixed',
          appointmentDate: '',
          notes: '',
        },
      ],
    },
  })

  const saveCurrentValues = useCallback(() => {
    const values = form.getValues()
    updateDraft(draftId, values)
  }, [draftId, form, updateDraft])

  // Auto-save every 5s + debounced save on change
  useEffect(() => {
    const interval = setInterval(saveCurrentValues, AUTO_SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [saveCurrentValues])

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>
    const subscription = form.watch(() => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(saveCurrentValues, 500)
    })
    return () => {
      subscription.unsubscribe()
      clearTimeout(debounceTimer)
    }
  }, [form, saveCurrentValues])

  // Wire the external "Submit Draft" button in the workspace header
  useEffect(() => {
    const btn = document.querySelector<HTMLButtonElement>('[data-submit-draft]')
    if (!btn) return

    const handler = () => {
      form.handleSubmit(onSubmit as SubmitHandler<CreateOrderInput>)()
    }

    btn.addEventListener('click', handler)
    return () => btn.removeEventListener('click', handler)
  }, [form, onSubmit])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<CreateOrderInput>)} className="space-y-6">
        <OrderFormFields />

        {/* Inline submit at bottom */}
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" className="gap-2" ref={submitBtnRef}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating order...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Submit Draft
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

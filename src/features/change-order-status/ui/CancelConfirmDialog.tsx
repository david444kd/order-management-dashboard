import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'
import { useUpdateOrderStatus } from '@/entities/order'
import { cancelOrderSchema, type CancelOrderInput } from '@/shared/zod/orderSchemas'

interface CancelConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
}

export function CancelConfirmDialog({ open, onOpenChange, orderId }: CancelConfirmDialogProps) {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  const form = useForm<CancelOrderInput>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: { to: 'cancelled', note: '' },
  })

  const onSubmit = (data: CancelOrderInput) => {
    updateStatus(
      { id: orderId, status: 'cancelled', note: data.note },
      {
        onSuccess: () => {
          toast.success('Order cancelled')
          onOpenChange(false)
          form.reset()
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for cancellation..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Keep Order
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

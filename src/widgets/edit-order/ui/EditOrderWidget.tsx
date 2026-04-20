import { useNavigate } from 'react-router-dom'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Form } from '@/shared/ui/form'
import { useOrder, useUpdateOrder } from '@/entities/order'
import { OrderFormFields } from '@/features/order-form'
import { createOrderSchema, type CreateOrderInput } from '@/shared/zod/orderSchemas'
import { ScrollArea } from '@/shared/ui/scroll-area'

interface EditOrderWidgetProps {
  orderId: string
}

export function EditOrderWidget({ orderId }: EditOrderWidgetProps) {
  const navigate = useNavigate()
  const { data: order, isLoading, isError, refetch } = useOrder(orderId)
  const { mutate: updateOrder, isPending } = useUpdateOrder(orderId)

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    values: order
      ? {
          clientName: order.clientName,
          referenceNumber: order.referenceNumber,
          carrierId: order.carrier.id,
          equipmentType: order.equipmentType,
          loadType: order.loadType,
          rate: order.rate,
          weight: order.weight,
          notes: order.notes,
          stops: order.stops.map((s) => ({
            id: s.id,
            type: s.type,
            order: s.order,
            address: s.address,
            locationName: s.locationName ?? '',
            refNumber: s.refNumber ?? '',
            appointmentType: s.appointmentType,
            appointmentDate: s.appointmentDate ?? '',
            notes: s.notes ?? '',
          })),
        }
      : undefined,
  })

  const onSubmit = (data: CreateOrderInput) => {
    updateOrder(data, {
      onSuccess: (updated) => {
        toast.success(`Order ${updated.referenceNumber} saved`)
        navigate(`/orders/${orderId}`)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Failed to load order</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  if (order.status !== 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Only pending orders can be edited.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(`/orders/${orderId}`)}>
          View Order
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${orderId}`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-base font-semibold font-mono">Edit {order.referenceNumber}</h1>
        </div>
        <Button
          size="sm"
          onClick={form.handleSubmit(onSubmit as SubmitHandler<CreateOrderInput>)}
          disabled={isPending}
          className="gap-2"
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
          ) : (
            <><Save className="h-4 w-4" />Save</>
          )}
        </Button>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<CreateOrderInput>)}>
              <OrderFormFields />
            </form>
          </Form>
        </div>
      </ScrollArea>
    </div>
  )
}

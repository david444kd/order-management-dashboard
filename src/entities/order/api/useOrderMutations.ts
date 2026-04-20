import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi, orderKeys } from './orderApi'
import type { OrderStatus } from '../model/types'
import type { CreateOrderInput } from '@/shared/zod/orderSchemas'

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => orderApi.createOrder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all() })
    },
  })
}

export function useUpdateOrder(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreateOrderInput>) => orderApi.updateOrder(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderKeys.detail(id), updated)
      void queryClient.invalidateQueries({ queryKey: orderKeys.all() })
    },
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderApi.deleteOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all() })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      orderApi.updateOrderStatus(id, status, note),
    onSuccess: (updated) => {
      queryClient.setQueryData(orderKeys.detail(updated.id), updated)
      void queryClient.invalidateQueries({ queryKey: orderKeys.all() })
    },
  })
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi, orderKeys, type GetOrdersParams } from './orderApi'
import type { OrderStatus } from '../model/types'

export function useOrders(params: GetOrdersParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getOrders(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    retry: 1,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrder(id),
    staleTime: 60_000,
    retry: 1,
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      orderApi.updateOrderStatus(id, status, note),
    onSuccess: (updated) => {
      qc.setQueryData(orderKeys.detail(updated.id), updated)
      qc.invalidateQueries({ queryKey: orderKeys.all() })
    },
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderApi.deleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.all() })
    },
  })
}

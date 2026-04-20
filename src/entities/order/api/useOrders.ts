import { useQuery } from '@tanstack/react-query'
import { orderApi, orderKeys, type GetOrdersParams } from './orderApi'

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

import { useQuery } from '@tanstack/react-query'
import { orderApi, orderKeys } from '@/entities/order/api/orderApi'

export function useCarriers(search?: string) {
  return useQuery({
    queryKey: orderKeys.carriers(search),
    queryFn: () => orderApi.getCarriers({ search }),
    staleTime: 10 * 60_000,
    retry: 1,
  })
}

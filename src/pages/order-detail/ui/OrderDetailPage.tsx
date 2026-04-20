import { Navigate, useParams } from 'react-router-dom'
import { OrderDetailWidget } from '@/widgets/order-detail'

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <Navigate to="/orders" replace />
  }

  return <OrderDetailWidget orderId={id} />
}

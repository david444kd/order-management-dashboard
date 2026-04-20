import { useParams, Navigate } from 'react-router-dom'
import { EditOrderWidget } from '@/widgets/edit-order'

export function OrderEditPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return <Navigate to="/orders" replace />

  return <EditOrderWidget orderId={id} />
}

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { OrdersListPage } from '@/pages/orders-list'
import { OrderDetailPage } from '@/pages/order-detail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/orders" replace />,
  },
  {
    path: '/orders',
    element: <OrdersListPage />,
  },
  {
    path: '/orders/:id',
    element: <OrderDetailPage />,
  },
])

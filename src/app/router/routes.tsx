import { createBrowserRouter, Navigate } from 'react-router-dom'
import { OrdersListPage } from '@/pages/orders-list'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/orders" replace />,
  },
  {
    path: '/orders',
    element: <OrdersListPage />,
  },
])

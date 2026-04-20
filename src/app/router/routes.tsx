import { createBrowserRouter, Navigate } from 'react-router-dom'
import { OrdersListPage } from '@/pages/orders-list'
import { OrderDetailPage } from '@/pages/order-detail'
import { OrderNewPage } from '@/pages/order-new'
import { OrderEditPage } from '@/pages/order-edit'

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
    path: '/orders/new',
    element: <OrderNewPage />,
  },
  {
    path: '/orders/:id',
    element: <OrderDetailPage />,
  },
  {
    path: '/orders/:id/edit',
    element: <OrderEditPage />,
  },
])

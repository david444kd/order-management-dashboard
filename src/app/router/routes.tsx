import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

const OrdersListPage = lazy(() =>
  import('@/pages/orders-list').then((module) => ({ default: module.OrdersListPage })),
)
const OrderDetailPage = lazy(() =>
  import('@/pages/order-detail').then((module) => ({ default: module.OrderDetailPage })),
)
const OrderNewPage = lazy(() =>
  import('@/pages/order-new').then((module) => ({ default: module.OrderNewPage })),
)
const OrderEditPage = lazy(() =>
  import('@/pages/order-edit').then((module) => ({ default: module.OrderEditPage })),
)

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      Loading page...
    </div>
  )
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/orders" replace />,
  },
  {
    path: '/orders',
    element: withSuspense(<OrdersListPage />),
  },
  {
    path: '/orders/new',
    element: withSuspense(<OrderNewPage />),
  },
  {
    path: '/orders/:id',
    element: withSuspense(<OrderDetailPage />),
  },
  {
    path: '/orders/:id/edit',
    element: withSuspense(<OrderEditPage />),
  },
])

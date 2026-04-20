export const PAGE_SIZES = [10, 25, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export const MOCK_DB_ORDERS_KEY = 'mock_db_orders'
export const MOCK_DB_CARRIERS_KEY = 'mock_db_carriers'

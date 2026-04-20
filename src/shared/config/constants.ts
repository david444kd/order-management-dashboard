export const PAGE_SIZES = [10, 25, 50] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export const MAX_DRAFTS = 5
export const MIN_STOPS = 2
export const MAX_STOPS = 5
export const AUTO_SAVE_INTERVAL = 5000

export const MOCK_DB_ORDERS_KEY = 'mock_db_orders'
export const MOCK_DB_CARRIERS_KEY = 'mock_db_carriers'

export const DRAFT_INDEX_KEY = 'draft:index'
export const DRAFT_KEY_PREFIX = 'draft:'

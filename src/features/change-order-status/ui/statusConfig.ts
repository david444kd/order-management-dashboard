import type { OrderStatus, EquipmentType, LoadType, AppointmentType } from '@/entities/order'

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_VARIANTS: Record<
  OrderStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'secondary',
  in_transit: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
}

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  dry_van: 'Dry Van',
  reefer: 'Reefer',
  flatbed: 'Flatbed',
  step_deck: 'Step Deck',
}

export const LOAD_TYPE_LABELS: Record<LoadType, string> = {
  ftl: 'FTL',
  ltl: 'LTL',
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  fixed: 'Fixed',
  window: 'Window',
  fcfs: 'FCFS',
}

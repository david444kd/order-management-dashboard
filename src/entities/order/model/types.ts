export type OrderStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled'
export type EquipmentType = 'dry_van' | 'reefer' | 'flatbed' | 'step_deck'
export type LoadType = 'ftl' | 'ltl'
export type StopType = 'pick_up' | 'drop_off' | 'stop'
export type AppointmentType = 'fixed' | 'window' | 'fcfs'

export interface Address {
  city: string
  state: string
  zip: string
}

export interface Carrier {
  id: string
  name: string
  mcNumber: string
  phone: string
  rating: number // 1–5
}

export interface StatusChange {
  from: OrderStatus | null
  to: OrderStatus
  changedAt: string
  note?: string
}

export interface Stop {
  id: string
  type: StopType
  order: number
  address: Address
  locationName?: string
  refNumber?: string
  appointmentType: AppointmentType
  appointmentDate: string | null
  notes?: string
}

export interface Order {
  id: string
  referenceNumber: string
  status: OrderStatus
  clientName: string
  carrier: Carrier
  equipmentType: EquipmentType
  loadType: LoadType
  stops: Stop[]
  weight: number
  rate: number
  notes: string
  statusHistory: StatusChange[]
  createdAt: string
  updatedAt: string
}

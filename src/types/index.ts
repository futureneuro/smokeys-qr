export enum RequestStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Snoozed = 'SNOOZED',
  Completed = 'COMPLETED',
  AutoCompleted = 'AUTO_COMPLETED',
}

export enum StaffRole {
  Admin = 'ADMIN',
  Manager = 'MANAGER',
  Staff = 'STAFF',
}

export enum UrgencyLevel {
  Normal = 'normal',
  Warning = 'warning',
  Urgent = 'urgent',
}

export interface ServiceRequestWithTable {
  id: string
  tableId: string
  table: {
    id: string
    tableNumber: number
    restaurantId: string
  }
  type: string
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  notes?: string | null
}

export interface TableWithRequests {
  id: string
  tableNumber: number
  restaurantId: string
  requests: ServiceRequestWithTable[]
}

export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  inProgressRequests: number
  completedRequests: number
  averageResolutionTime: number
  requestsByType: Record<string, number>
  urgentRequests: number
}

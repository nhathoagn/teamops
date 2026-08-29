export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff'
  organizationId: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  customerId: string
  serviceId: string
  assignedTo?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  scheduledAt: string
  completedAt?: string
  notes?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
  bookingId?: string
  organizationId: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  reportedBy: string
  assignedTo?: string
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  organizationName?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

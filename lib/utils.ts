import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'active':
    case 'accepted':
      return 'bg-success-100 text-success-800'
    case 'pending':
      return 'bg-warning-100 text-warning-800'
    case 'rejected':
    case 'cancelled':
      return 'bg-danger-100 text-danger-800'
    case 'paused':
    case 'withdrawn':
      return 'bg-gray-100 text-gray-800'
    case 'completed':
      return 'bg-primary-100 text-primary-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'active':
    case 'accepted':
      return 'badge-success'
    case 'pending':
      return 'badge-warning'
    case 'rejected':
    case 'cancelled':
      return 'badge-danger'
    case 'paused':
    case 'withdrawn':
      return 'badge-primary'
    case 'completed':
      return 'badge-primary'
    default:
      return 'badge-primary'
  }
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string) {
  return password.length >= 6
}

export function validateGPA(gpa: number) {
  return gpa >= 0 && gpa <= 4.0
}

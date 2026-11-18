export function formatPrice(amount) {
  if (amount === null || amount === undefined) return ''
  return 'KES ' + Number(amount).toLocaleString('en-KE')
}

export function formatDate(text) {
  if (!text) return ''
  return new Date(text).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function homeFor(role) {
  if (role === 'admin') return '/admin'
  if (role === 'dealer') return '/dealer'
  if (role === 'seller') return '/seller/listings'
  return '/browse'
}

export const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
export const TRANSMISSIONS = ['Automatic', 'Manual']
export const BODY_TYPES = ['SUV', 'Sedan', 'Hatchback', 'Pickup', 'Van', 'Wagon', 'Coupe']
export const LOCATIONS = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri']

export const CAR_COLORS = [
  '#7C3AED', '#2563EB', '#16A34A', '#EF4444', '#F59E0B',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#8B5CF6',
]

export function statusClass(status) {
  switch (status) {
    case 'approved':
    case 'accepted':
    case 'open':
      return 'green'
    case 'pending':
      return 'yellow'
    case 'rejected':
      return 'red'
    case 'sold':
    case 'closed':
      return 'blue'
    default:
      return 'violet'
  }
}

export const STATUS_TEXT = {
  approved: 'Approved',
  pending: 'Waiting for approval',
  rejected: 'Rejected',
  sold: 'Sold',
  open: 'Open',
  closed: 'Closed',
  accepted: 'Accepted',
}

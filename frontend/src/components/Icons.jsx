export function LogoMark({ size = 38 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#logoGradient)" />
      <path
        d="M9 29v-4c0-1.5 1-2.6 2.4-2.9l3-.7 3.2-5c.5-.8 1.300-1.200 2.200-1.200h9.200c.9 0 1.700.4 2.200 1.100l3.600 5.200 2 .5c1.300.3 2.200 1.400 2.200 2.800V29c0 .6-.4 1-1 1h-2.100a4 4 0 0 0-7.800 0H20a4 4 0 0 0-7.800 0H10c-.6 0-1-.4-1-1Z"
        fill="#fff"
      />
      <circle cx="16" cy="31" r="3" fill="#FACC15" />
      <circle cx="33" cy="31" r="3" fill="#FACC15" />
    </svg>
  )
}

export function HeartIcon({ filled }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7.500-4.600-9.500-9.300C1.200 8.500 3 5 6.500 5c2 0 3.700 1.100 5.500 3.200C13.800 6.100 15.500 5 17.500 5 21 5 22.800 8.500 21.500 11.700 19.500 16.400 12 21 12 21Z" />
    </svg>
  )
}

export function StarIcon({ filled, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
      fill={filled ? '#FACC15' : 'none'} stroke={filled ? '#EAB308' : '#B9B0D6'}
      strokeWidth="1.800" strokeLinejoin="round">
      <path d="m12 3 2.700 5.600 6.100.8-4.500 4.300 1.100 6.100L12 17l-5.400 2.800 1.100-6.100L3.200 9.400l6.100-.8L12 3Z" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2.200" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.500-3.500" />
    </svg>
  )
}

export function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6.100 7-11.500A7 7 0 0 0 5 9.500C5 14.900 12 21 12 21Z" />
      <circle cx="12" cy="9.500" r="2.500" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12.500 4.500 4.500L19 7.500" />
    </svg>
  )
}

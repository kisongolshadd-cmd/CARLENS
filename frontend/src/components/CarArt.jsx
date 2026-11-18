function shade(hex, amount) {
  const number = parseInt(hex.slice(1), 16)
  const mix = (value) => Math.max(0, Math.min(255, Math.round(value + amount * 255)))
  const r = mix(number >> 16)
  const g = mix((number >> 8) & 255)
  const b = mix(number & 255)
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
}

const SHAPES = {
  Sedan: {
    body: 'M24 94 V82 Q24 76 32 74 L66 68 L88 50 Q93 46 101 46 H146 Q154 46 160 51 L180 68 L212 74 Q220 76 220 84 V94 Q220 100 214 100 H30 Q24 100 24 94 Z',
    glass: 'M94 53 H144 Q149 53 153 57 L168 69 H76 Z',
    pillar: 120, wheels: [70, 174],
  },
  SUV: {
    body: 'M22 96 V76 Q22 68 30 66 L56 62 L72 42 Q76 38 84 38 H170 Q178 38 182 44 L196 62 L216 68 Q222 70 222 78 V96 Q222 102 216 102 H28 Q22 102 22 96 Z',
    glass: 'M80 45 H168 Q172 45 175 49 L187 63 H66 Z',
    pillar: 124, wheels: [68, 176],
  },
  Hatchback: {
    body: 'M30 94 V80 Q30 74 38 72 L64 68 L84 46 Q88 42 96 42 H150 Q158 42 164 48 L178 66 L210 72 Q216 74 216 82 V94 Q216 100 210 100 H36 Q30 100 30 94 Z',
    glass: 'M90 49 H148 Q153 49 156 53 L168 67 H76 Z',
    pillar: 118, wheels: [72, 172],
  },
  Pickup: {
    body: 'M18 96 V74 H92 V60 L108 42 Q112 38 120 38 H150 Q158 38 162 44 L176 62 L212 68 Q220 70 220 78 V96 Q220 102 214 102 H24 Q18 102 18 96 Z',
    glass: 'M114 45 H148 Q152 45 155 49 L166 63 H104 Z',
    pillar: 134, wheels: [60, 178],
  },
}

export default function CarArt({ color = '#7C3AED', type = 'Sedan' }) {
  const paint = /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#7C3AED'
  const shape = SHAPES[type] || (type === 'Wagon' || type === 'Van' ? SHAPES.SUV : type === 'Coupe' ? SHAPES.Sedan : SHAPES.Sedan)
  const id = 'c' + paint.slice(1) + (SHAPES[type] ? type : 'Sedan')

  return (
    <div className="car-art" style={{ background: `radial-gradient(circle at 50% 30%, #ffffff 0%, ${shade(paint, 0.35)} 45%, ${shade(paint, -0.15)} 100%)` }}>
      <svg viewBox="0 0 240 140" role="img" aria-label={`${type} car`} preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade(paint, 0.22)} />
            <stop offset="0.5" stopColor={paint} />
            <stop offset="1" stopColor={shade(paint, -0.22)} />
          </linearGradient>
          <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dbeafe" />
            <stop offset="0.55" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1f1535" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <circle cx="30" cy="22" r="44" fill="#fff" opacity="0.18" />
        <circle cx="214" cy="18" r="34" fill="#facc15" opacity="0.28" />
        <rect y="104" width="240" height="36" fill={`url(#${id}-floor)`} />
        <rect y="104" width="240" height="2" fill="#fff" opacity="0.7" />

        <ellipse cx="120" cy="108" rx="104" ry="8" fill="#1f1535" opacity="0.4" />

        <path d={shape.body} fill={`url(#${id}-paint)`} />
        <path d={shape.body} fill="none" stroke={shade(paint, -0.3)} strokeWidth="1" />
        <path d="M44 82 H206" stroke="#fff" strokeWidth="1.6" opacity="0.45" />
        <path d={`M${shape.pillar} 68 V98`} stroke={shade(paint, -0.3)} strokeWidth="1.2" opacity="0.7" />
        <rect x={shape.pillar - 14} y="76" width="10" height="2.5" rx="1.2" fill={shade(paint, -0.35)} />
        <rect x={shape.pillar + 8} y="76" width="10" height="2.5" rx="1.2" fill={shade(paint, -0.35)} />

        <path d={shape.glass} fill={`url(#${id}-glass)`} />
        <path d={`M${shape.pillar} 48 V69`} stroke={paint} strokeWidth="3" />

        <path d="M206 78 q10 0 12 6 v4 q-8 0 -12 -3 z" fill="#fef9c3" />
        <rect x="213" y="90" width="8" height="5" rx="2" fill="#1f1535" opacity="0.7" />
        <path d="M24 78 q-4 2 -3 8 h6 v-8 z" fill="#ef4444" />
        <rect x="22" y="94" width="196" height="4" fill="#1f1535" opacity="0.25" />

        {shape.wheels.map((x) => (
          <g key={x}>
            <circle cx={x} cy="100" r="16" fill="#111827" />
            <circle cx={x} cy="100" r="10" fill="#d1d5db" />
            <circle cx={x} cy="100" r="9" fill="none" stroke="#6b7280" strokeWidth="1" />
            {[0, 72, 144, 216, 288].map((angle) => (
              <line key={angle} x1={x} y1="100" x2={x + 8 * Math.cos((angle * Math.PI) / 180)}
                y2={100 + 8 * Math.sin((angle * Math.PI) / 180)} stroke="#6b7280" strokeWidth="2" />
            ))}
            <circle cx={x} cy="100" r="2.6" fill="#111827" />
          </g>
        ))}
      </svg>
    </div>
  )
}

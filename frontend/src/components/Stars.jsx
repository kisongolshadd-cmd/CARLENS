import { StarIcon } from './Icons.jsx'

export default function Stars({ value = 0, onChange, size = 18 }) {
  const rounded = Math.round(value || 0)

  return (
    <span className="stars" aria-label={`${value || 0} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((number) =>
        onChange ? (
          <button
            key={number}
            type="button"
            className="star-button"
            onClick={() => onChange(number)}
            aria-label={`${number} star${number > 1 ? 's' : ''}`}
          >
            <StarIcon filled={number <= rounded} size={size + 8} />
          </button>
        ) : (
          <StarIcon key={number} filled={number <= rounded} size={size} />
        )
      )}
    </span>
  )
}

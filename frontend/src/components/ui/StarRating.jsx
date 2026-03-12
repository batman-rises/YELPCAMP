import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../../lib/utils'

export function StarDisplay({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors',
            i <= Math.round(rating) ? 'text-sand-500 fill-sand-500' : 'text-gray-200 fill-gray-200'
          )}
        />
      ))}
    </div>
  )
}

export function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={cn(
              'transition-all duration-150 cursor-pointer',
              i <= (hovered || value)
                ? 'text-sand-500 fill-sand-500 scale-110'
                : 'text-gray-300 fill-gray-200'
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-gray-500 font-medium">
          {['', 'Terrible', 'Not good', 'Average', 'Very good', 'Amazing'][value]}
        </span>
      )}
    </div>
  )
}

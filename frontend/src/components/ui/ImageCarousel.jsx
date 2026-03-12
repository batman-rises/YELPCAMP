import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 bg-forest-50 rounded-2xl flex items-center justify-center">
        <ImageOff size={40} className="text-forest-300" />
      </div>
    )
  }

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 group">
      {/* Images */}
      <div
        className="flex h-full carousel-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={`Campground photo ${i + 1}`}
            className="w-full h-full object-cover shrink-0"
          />
        ))}
      </div>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-forest-800 p-2 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-forest-800 p-2 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all duration-200',
                  i === current ? 'bg-white w-4' : 'bg-white/60'
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* Count badge */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

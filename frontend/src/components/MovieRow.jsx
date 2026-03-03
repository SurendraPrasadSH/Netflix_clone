import { useRef } from 'react'
import { getPoster, fallback } from '../pages/HomePage'

export default function MovieRow({ title, movies, onSelect }) {
  const rowRef = useRef(null)
  const scroll = (dir) => rowRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })

  return (
    <div className="mb-8 px-4 md:px-12">
      <h2 className="text-lg md:text-xl font-semibold mb-3">{title}</h2>
      <div className="relative group">
        <button onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-2xl">
          ‹
        </button>

        <div ref={rowRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {movies.map((movie) => (
            <div key={movie.id} onClick={() => onSelect(movie)}
              className="flex-shrink-0 w-36 md:w-44 cursor-pointer group/card">
              <div className="relative overflow-hidden rounded bg-zinc-900 hover:scale-105 transition-transform duration-200">
                <img src={getPoster(movie)} alt={movie.title || movie.name}
                  className="w-full object-cover aspect-[2/3]" loading="lazy"
                  onError={(e) => { e.target.src = fallback(movie) }} />
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition" />
                <div className="absolute bottom-0 inset-x-0 p-2 translate-y-full group-hover/card:translate-y-0 transition-transform bg-gradient-to-t from-black">
                  <p className="text-xs font-semibold truncate">{movie.title || movie.name}</p>
                  <p className="text-xs text-gray-300">
                    ⭐ {movie.rating ?? movie.vote_average ?? 'N/A'}
                    {(movie.year || movie.release_date?.slice(0, 4)) && ` · ${movie.year || movie.release_date?.slice(0, 4)}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-2xl">
          ›
        </button>
      </div>
    </div>
  )
}

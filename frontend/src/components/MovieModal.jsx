import { useEffect } from 'react'
import MovieRow from './MovieRow'

export default function MovieModal({ movie, recommendations, onClose, onSelect }) {
  const hero =
  movie.backdrop_url ||
  movie.poster_url ||
  movie.posterUrl ||
  (movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null) ||
  (movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : null) ||
  'https://placehold.co/780x440/1a1a1a/aaa?text=No+Image'

  const rating = movie.rating ?? movie.vote_average ?? 'N/A'
  const year   = movie.year || movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || 'N/A'
  const desc   = movie.description || movie.overview || 'No description available.'
  const genres = Array.isArray(movie.genres)
    ? movie.genres.map((g) => (typeof g === 'string' ? g : g.name)).join(', ')
    : (movie.genres || 'N/A')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-zinc-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img src={hero} alt={movie.title || movie.name} className="w-full object-cover max-h-72 rounded-t-lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent rounded-t-lg" />
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center transition">
            ✕
          </button>
          <h2 className="absolute bottom-4 left-6 text-2xl md:text-3xl font-bold drop-shadow">
            {movie.title || movie.name}
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-3">
            <span className="text-green-400 font-semibold">
              ⭐ {typeof rating === 'number' ? rating.toFixed(1) : rating}
            </span>
            <span>{year}</span>
            {movie.type && (
              <span className="border border-gray-500 px-2 py-0.5 rounded text-xs uppercase">{movie.type}</span>
            )}
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">{desc}</p>
          <p className="text-sm"><span className="text-gray-400">Genres: </span>{genres}</p>
        </div>

        <div className="mt-2 pb-4">
          {recommendations.length > 0
            ? <MovieRow title="More like this" movies={recommendations} onSelect={onSelect} />
            : <p className="px-6 pb-2 text-sm text-gray-500 italic">
                Recommendations will load here once the ML endpoint is connected.
              </p>
          }
        </div>
      </div>
    </div>
  )
}

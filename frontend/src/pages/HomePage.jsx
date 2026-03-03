import { useState, useEffect, useCallback, useRef } from 'react'
import { moviesApi, recommendationsApi } from '../api/apiClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import MovieRow from '../components/MovieRow'
import MovieModal from '../components/MovieModal'
import LoadingSkeleton from '../components/LoadingSkeleton'

function categorize(movies = []) {
  return {
    'Trending Now': movies.slice(0, 20),
    'Movies':       movies.filter((m) => m.type === 'movie'  || m.media_type === 'movie'),
    'Series':       movies.filter((m) => m.type === 'series' || m.media_type === 'tv'),
    'Top Rated':    [...movies].sort((a, b) => (b.rating ?? b.vote_average ?? 0) - (a.rating ?? a.vote_average ?? 0)).slice(0, 20),
  }
}

export default function HomePage() {
  const { user } = useAuth()
  const [movies, setMovies]               = useState([])
  const [categories, setCategories]       = useState({})
  const [loading, setLoading]             = useState(true)
  const [query, setQuery]                 = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    moviesApi.getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results ?? data?.movies ?? []
        setMovies(list)
        setCategories(categorize(list))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = useCallback((q) => {
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setSearchResults(null); return }
    debounceRef.current = setTimeout(async () => {
      const local = movies.filter((m) =>
        (m.title || m.name || '').toLowerCase().includes(q.toLowerCase())
      )
      setSearchResults(local)
      try {
        const remote = await moviesApi.search(q)
        const list = Array.isArray(remote) ? remote : remote?.results ?? []
        if (list.length) setSearchResults(list)
      } catch (_) {}
    }, 400)
  }, [movies])

  const handleSelectMovie = async (movie) => {
    setSelectedMovie(movie)
    setRecommendations([])
    try {
      const recs = await recommendationsApi.get(movie.id)  // ← remove user?.id
      const list = Array.isArray(recs) ? recs : recs?.results ?? recs?.recommendations ?? []
      setRecommendations(list)
    } catch (_) {}
  }
  

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar onSearch={handleSearch} searchQuery={query} />

      <main className="pt-20 pb-10">
        {loading ? (
          <LoadingSkeleton />
        ) : searchResults !== null ? (
          <div className="px-4 md:px-12">
            <h2 className="text-xl font-semibold mb-4">
              {searchResults.length ? `Results for "${query}"` : `No results for "${query}"`}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {searchResults.map((m) => <SearchCard key={m.id} movie={m} onClick={handleSelectMovie} />)}
            </div>
          </div>
        ) : (
          Object.entries(categories).map(([title, list]) =>
            list.length > 0
              ? <MovieRow key={title} title={title} movies={list} onSelect={handleSelectMovie} />
              : null
          )
        )}
      </main>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          recommendations={recommendations}
          onClose={() => setSelectedMovie(null)}
          onSelect={(m) => { setSelectedMovie(null); setTimeout(() => handleSelectMovie(m), 100) }}
        />
      )}
    </div>
  )
}

function SearchCard({ movie, onClick }) {
  return (
    <div onClick={() => onClick(movie)} className="cursor-pointer rounded overflow-hidden bg-zinc-900 hover:scale-105 transition-transform">
      <img src={getPoster(movie)} alt={movie.title || movie.name}
        className="w-full object-cover aspect-[2/3]" loading="lazy"
        onError={(e) => { e.target.src = fallback(movie) }} />
      <div className="p-2">
        <p className="text-sm font-medium truncate">{movie.title || movie.name}</p>
        <p className="text-xs text-gray-400">{movie.year || movie.release_date?.slice(0, 4) || ''}</p>
      </div>
    </div>
  )
}

export const getPoster = (m) =>
  m.poster_url ||
  m.posterUrl ||
  m.poster ||
  m.image_url ||
  m.imageUrl ||
  m.image ||
  m.thumbnail ||
  (m.poster_path ? `https://image.tmdb.org/t/p/w300${m.poster_path}` : null) ||
  fallback(m)
  

export const fallback = (m) =>
  `https://placehold.co/300x450/1a1a1a/aaa?text=${encodeURIComponent(m?.title || m?.name || 'Movie')}`

// seed_movies.js
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL         = 'https://mgavzjglcggzpjnmxbdb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYXZ6amdsY2dnenBqbm14YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQzNjMzNSwiZXhwIjoyMDg4MDEyMzM1fQ.GrtcXyAxXK-B8s-V7SZxLmwfdnDfJqkOne2OuHp9So8'
const TMDB_TOKEN           = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1YjQ0ZmM4OTZkMGY5ODliNGUzNTgxYjg4NGZiZmIxNCIsIm5iZiI6MTc3MjU1OTE1NC45ODU5OTk4LCJzdWIiOiI2OWE3MWIzMmFjNDBjOTZiNjE5NjQ3MWUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.CSaztzFKwUl7JHq7XPGghZ_ao88nkhAyw7Qa-bGDvoY'  // Bearer token

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const TMDB_BASE   = 'https://api.themoviedb.org/3'
const IMG_BASE    = 'https://image.tmdb.org/t/p/w500'
const BACK_BASE   = 'https://image.tmdb.org/t/p/w780'
const headers     = { Authorization: `Bearer ${TMDB_TOKEN}` }

// Fetch multiple pages from a TMDB endpoint
async function fetchPages(endpoint, pages = 5) {
  const results = []
  for (let page = 1; page <= pages; page++) {
    const res  = await fetch(`${TMDB_BASE}${endpoint}&page=${page}`, { headers })
    const data = await res.json()
    results.push(...(data.results || []))
    await new Promise((r) => setTimeout(r, 250)) // rate limit pause
  }
  return results
}

// Fetch genre list for movies and tv
async function fetchGenres() {
  const [movRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE}/genre/movie/list?language=en`, { headers }).then((r) => r.json()),
    fetch(`${TMDB_BASE}/genre/tv/list?language=en`,    { headers }).then((r) => r.json()),
  ])
  const map = {}
  ;[...(movRes.genres || []), ...(tvRes.genres || [])].forEach((g) => { map[g.id] = g.name })
  return map
}

function mapMovie(item, genreMap, type) {
  return {
    title:        item.title || item.name || 'Unknown',
    type,
    description:  item.overview || '',
    poster_url:   item.poster_path    ? `${IMG_BASE}${item.poster_path}`    : null,
    backdrop_url: item.backdrop_path  ? `${BACK_BASE}${item.backdrop_path}` : null,
    rating:       item.vote_average   ?? 0,
    year:         parseInt((item.release_date || item.first_air_date || '0').slice(0, 4)) || null,
    genres:       (item.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
  }
}

async function seed() {
  console.log('Fetching genres...')
  const genreMap = await fetchGenres()

  console.log('Fetching movies...')
  const [popular, topRated, nowPlaying] = await Promise.all([
    fetchPages('/movie/popular?language=en-US',    4),  // ~80 movies
    fetchPages('/movie/top_rated?language=en-US',  2),  // ~40 movies
    fetchPages('/movie/now_playing?language=en-US',1),  // ~20 movies
  ])

  console.log('Fetching series...')
  const [popularTV, topRatedTV] = await Promise.all([
    fetchPages('/tv/popular?language=en-US',   4),  // ~80 series
    fetchPages('/tv/top_rated?language=en-US', 2),  // ~40 series
  ])

  // Deduplicate by TMDB id
  const seen    = new Set()
  const movies  = []

  for (const item of [...popular, ...topRated, ...nowPlaying]) {
    if (!seen.has(item.id) && item.poster_path) {
      seen.add(item.id)
      movies.push(mapMovie(item, genreMap, 'movie'))
    }
  }

  for (const item of [...popularTV, ...topRatedTV]) {
    if (!seen.has(item.id) && item.poster_path) {
      seen.add(item.id)
      movies.push(mapMovie(item, genreMap, 'series'))
    }
  }

  console.log(`Total to insert: ${movies.length}`)

  // Insert in batches of 50
  const BATCH = 50
  for (let i = 0; i < movies.length; i += BATCH) {
    const batch = movies.slice(i, i + BATCH)
    const { error } = await supabase.from('movies').insert(batch)
    if (error) console.error(`Batch ${i / BATCH + 1} error:`, error.message)
    else console.log(`✅ Inserted batch ${i / BATCH + 1} (${batch.length} items)`)
  }

  console.log('🎬 Seeding complete!')
}

seed().catch(console.error)

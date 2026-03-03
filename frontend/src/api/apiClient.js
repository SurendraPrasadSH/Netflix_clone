const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (res.status === 401 && path === '/me') return null

  if (!res.ok) {
    let msg = `Error ${res.status}`
    try { const b = await res.json(); msg = b.message || b.error || msg } catch (_) {}
    throw new Error(msg)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const authApi = {
  signUp:  (email, password) => request('/signup',  { method: 'POST', body: JSON.stringify({ email, password }) }),
  login:   (email, password) => request('/login',   { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout:  ()                => request('/logout',  { method: 'POST' }),
  me:      ()                => request('/me'),
}

export const moviesApi = {
  getAll:  ()    => request('/movies'),
  getById: (id)  => request(`/movies/${id}`),
  search:  (q)   => request(`/search?q=${encodeURIComponent(q)}`),
}


export const recommendationsApi = {
  get: (movieId) => request(`/recommendations?movieId=${movieId}`),
}


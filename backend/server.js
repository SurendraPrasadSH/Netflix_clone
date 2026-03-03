const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const app = express()

// ── Middleware ─────────────────────────────────────────────
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173'],
  credentials: true,           // REQUIRED for cookies to work cross-origin
}))

// ── Supabase clients ───────────────────────────────────────
// Admin client — full access, only used server-side (NEVER expose to frontend)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Cookie config ──────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,       // JS in browser CANNOT read this
  secure: false,        // set true in production (HTTPS)
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days in ms
}

// ══════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════

// SIGN UP
app.post('/signup', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' })

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' })

  // Creates user in Supabase auth.users (password is bcrypt hashed by Supabase)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    //email_confirm: true      // skip email verification for now
  })

  if (error) return res.status(400).json({ error: error.message })

  // Auto-login after signup — get a real session token
  const { data: loginData, error: loginError } =
    await supabaseAdmin.auth.signInWithPassword({ email, password })

  if (loginError) return res.status(400).json({ error: loginError.message })

  // Store token in HTTP-only cookie — browser sends this on every request
  res.cookie('access_token', loginData.session.access_token, COOKIE_OPTIONS)
  res.cookie('refresh_token', loginData.session.refresh_token, COOKIE_OPTIONS)

  res.json({ user: loginData.user })
})

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' })

  // Supabase validates the password hash internally
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  })

  if (error) return res.status(401).json({ error: 'Invalid email or password' })

  // Set tokens as HTTP-only cookies
  res.cookie('access_token', data.session.access_token, COOKIE_OPTIONS)
  res.cookie('refresh_token', data.session.refresh_token, COOKIE_OPTIONS)

  res.json({ user: data.user })
})

// LOGOUT
app.post('/logout', async (req, res) => {
  // Clear both cookies
  res.clearCookie('access_token')
  res.clearCookie('refresh_token')
  res.json({ message: 'Logged out successfully' })
})

// GET CURRENT USER — called on every page reload to restore session
app.get('/me', async (req, res) => {
  const token = req.cookies?.access_token

  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  // Validate token with Supabase — verifies JWT signature + expiry
  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error) {
    res.clearCookie('access_token')
    return res.status(401).json({ error: 'Session expired' })
  }

  res.json(data.user)
})

// ══════════════════════════════════════════════════════════
// AUTH MIDDLEWARE — protect routes below this
// ══════════════════════════════════════════════════════════
async function requireAuth(req, res, next) {
  const token = req.cookies?.access_token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error) return res.status(401).json({ error: 'Session expired' })

  req.user = data.user   // attach user to request
  next()
}

// ══════════════════════════════════════════════════════════
// MOVIES ROUTES (protected)
// ══════════════════════════════════════════════════════════
app.get('/movies', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('movies')
    .select('*')
    .limit(100)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.get('/movies/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('movies')
    .select('*')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(404).json({ error: error.message })
  res.json(data)
})

app.get('/search', requireAuth, async (req, res) => {
  const { q } = req.query
  const { data, error } = await supabaseAdmin
    .from('movies')
    .select('*')
    .ilike('title', `%${q}%`)
    .limit(20)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Temp debug route — no auth required
app.get('/debug-movies', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('movies')
    .select('*')
    .limit(2)
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// ML service URL — resolves via Docker network
const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://ml-service:8000'

app.get('/recommendations', requireAuth, async (req, res) => {
  const { movieId } = req.query
  if (!movieId) return res.status(400).json({ error: 'movieId is required' })
  try {
    const mlRes  = await fetch(`http://ml-service:8000/recommend?movieId=${movieId}&top_n=10`)
    const mlData = await mlRes.json()
    if (!mlRes.ok || !mlData.recommendations?.length) throw new Error('ML failed')
    const { data, error } = await supabaseAdmin
      .from('movies').select('*').in('id', mlData.recommendations)
    if (error) return res.status(500).json({ error: error.message })
    const ordered = mlData.recommendations
      .map((id) => data.find((m) => m.id === id))
      .filter(Boolean)
    res.json(ordered)
  } catch (err) {
    console.error('ML error:', err.message)
    const { data } = await supabaseAdmin
      .from('movies').select('*').neq('id', movieId).limit(10)
    res.json(data || [])
  }
})

app.listen(3000, () => console.log('Backend running on port 3000'))

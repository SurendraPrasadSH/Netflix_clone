import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AuthPage() {
  const { login, signUp, user } = useAuth()
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  if (user) { navigate('/home', { replace: true }); return null }

  const validate = () => {
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.'
    if (password.length < 6)   return 'Password must be at least 6 characters.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      isSignUp ? await signUp(email, password) : await login(email, password)
      navigate('/home', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center relative flex flex-col"
      style={{ background: 'linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)), url(https://assets.nflxext.com/ffe/siteui/vlv3/f84a8a8b-56a5-4c69-8686-69d0d46fbb0e/web/IN-en-20240805-TRIFECTA-perspective_de4fdd8b-3ffc-4ead-8bde-e39b1dbb70e4_large.jpg) center/cover' }}>
      <header className="px-8 py-6">
        <span className="text-red-600 font-bold text-4xl tracking-tight select-none">NETFLIX</span>
      </header>

      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-black/80 rounded-lg p-10 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6">{isSignUp ? 'Sign Up' : 'Sign In'}</h1>

          {error && (
            <div className="bg-orange-600/90 text-white text-sm rounded px-4 py-3 mb-4 animate-pulse">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email"
              className="w-full bg-zinc-700 text-white rounded px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400" />
            <input type="password" placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="w-full bg-zinc-700 text-white rounded px-5 py-4 focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400" />
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded transition disabled:opacity-50">
              {loading ? 'Please wait…' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="text-gray-400 mt-6 text-sm">
            {isSignUp ? 'Already have an account? ' : 'New to Netflix? '}
            <button className="text-white hover:underline font-medium"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
              {isSignUp ? 'Sign in now.' : 'Sign up now.'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

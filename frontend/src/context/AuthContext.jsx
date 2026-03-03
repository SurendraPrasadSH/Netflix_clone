import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login  = async (email, password) => {
    const data = await authApi.login(email, password)
    const me = data?.user || data
    setUser(me)
    return me
  }

  const signUp = async (email, password) => {
    const data = await authApi.signUp(email, password)
    const me = data?.user || data
    setUser(me)
    return me
  }

  const logout = async () => {
    await authApi.logout().catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import {
  authLogin, authRegister, authLogout, authGetMe,
  getStoredToken,
} from '../lib/authClient.js'
import env from '../lib/env.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)
  const [authModal, setAuthModal] = useState(false)
  const [authTab,   setAuthTab]   = useState('login')

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const token = getStoredToken()
      if (!token) { setLoading(false); return }
      const { ok, user } = await authGetMe()
      if (ok) setUser(user)
      setLoading(false)
    }
    restore()
  }, [])

  const login = useCallback(async (credentials) => {
    setAuthError(null)
    const { ok, user, error } = await authLogin(credentials)
    if (ok) { setUser(user); setAuthModal(false) }
    else    setAuthError(error)
    return { ok, error }
  }, [])

  const register = useCallback(async (data) => {
    setAuthError(null)
    const { ok, user, error } = await authRegister(data)
    if (ok) { setUser(user); setAuthModal(false) }
    else    setAuthError(error)
    return { ok, error }
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    setUser(null)
  }, [])

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthTab(tab)
    setAuthModal(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModal(false)
    setAuthError(null)
  }, [])

  // Memoize derived values so they don't create new references on every render
  const isAuthenticated = !!user
  const isMockMode      = env.isMock

  // Memoize the full context value — prevents all consumers from re-rendering
  // on unrelated parent state changes (loading, authError, authModal)
  const value = useMemo(() => ({
    user,
    loading,
    authError,
    isAuthenticated,
    isMockMode,
    login,
    register,
    logout,
    authModal,
    authTab,
    openAuthModal,
    closeAuthModal,
    setAuthTab,
  }), [
    user, loading, authError,
    isAuthenticated, isMockMode,
    login, register, logout,
    authModal, authTab,
    openAuthModal, closeAuthModal,
    setAuthTab,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
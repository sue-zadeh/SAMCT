import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { API_BASE_URL, apiFetch, clearCsrfToken } from './api'

import { SAMCT_ADMIN_ROLES } from '../constants/samct-data'

export const adminRoles = SAMCT_ADMIN_ROLES
export type SessionUser = { id: number; userName: string; firstName: string; lastName: string; fullName: string; email: string; role: string; village: string; profileImageUrl: string; sessionExpiresAt: string }
const cacheKeys: Record<string, keyof SessionUser> = { username: 'userName', firstname: 'firstName', lastname: 'lastName', fullname: 'fullName', email: 'email', role: 'role', village: 'village', profileImageUrl: 'profileImageUrl' }
export function cacheUser(user: SessionUser | null) {
  // Display cache only; neither the route guard nor API trusts these values.
  for (const [key, field] of Object.entries(cacheKeys)) {
    if (user) localStorage.setItem(key, String(user[field] || ''))
    else localStorage.removeItem(key)
  }
}
export function homeForRole(role: string) { return adminRoles.includes(role) ? '/admin' : role === 'VillageManager' ? '/village-manager' : '/resident' }
const SessionContext = createContext<{ user: SessionUser | null; loading: boolean; refresh: () => Promise<void> }>({ user: null, loading: true, refresh: async () => {} })
const sessionEventKey = 'samct.session-event'
const idleMessage = 'You were logged out after 20 minutes of inactivity. Please sign in again.'
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const currentUser = useRef<SessionUser | null>(null)
  const deadline = useRef(0)
  const generation = useRef(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const navigate = useNavigate()

  const endSession = useCallback((reason = '', broadcast = true) => {
    const previous = currentUser.current
    generation.current++ // Ignore an in-flight refresh from an ended session.
    currentUser.current = null
    deadline.current = 0
    cacheUser(null)
    clearCsrfToken()
    setUser(null)
    setLoading(false)
    if (reason && (previous || reason === 'inactivity')) {
      setMessage(reason === 'inactivity' ? idleMessage : 'Your session has ended. Please sign in again.')
      navigate('/login', { replace: true })
    }
    if (broadcast && previous) localStorage.setItem(sessionEventKey, JSON.stringify({ type: 'logout', userId: previous.id, reason, at: Date.now() }))
  }, [navigate])

  const refresh = useCallback(async () => {
    const version = ++generation.current
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/session`)
      const value = response.ok ? await response.json() as SessionUser : null
      if (version !== generation.current) return
      if (value) {
        currentUser.current = value
        deadline.current = Date.parse(value.sessionExpiresAt)
        cacheUser(value)
        setUser(value)
        setMessage('')
      } else endSession(currentUser.current ? 'expired' : '')
    } catch { if (version === generation.current) endSession(currentUser.current ? 'expired' : '') }
    finally { setLoading(false) }
  }, [endSession])

  useEffect(() => {
    void refresh()
    const expire = (event: Event) => endSession((event as CustomEvent<string>).detail || 'expired')
    const loggedOut = () => endSession()
    window.addEventListener('samct-session-expired', expire)
    window.addEventListener('samct-session-logged-out', loggedOut)
    return () => {
      window.removeEventListener('samct-session-expired', expire)
      window.removeEventListener('samct-session-logged-out', loggedOut)
    }
  }, [refresh, endSession])

  useEffect(() => {
    if (!user) return
    let pendingActivity = false
    let sending = false
    let lastSent = 0
    const expireIfIdle = () => {
      if (!currentUser.current) return true
      if (!Number.isFinite(deadline.current) || Date.now() >= deadline.current) {
        endSession('inactivity')
        // Revoke immediately if reachable. The server also expires it independently.
        void apiFetch(`${API_BASE_URL}/api/logout`, { method: 'POST' }).catch(() => {})
        return true
      }
      return false
    }
    const sendActivity = async () => {
      if (!pendingActivity || sending || expireIfIdle() || Date.now() - lastSent < 30000) return
      pendingActivity = false
      sending = true
      lastSent = Date.now()
      const version = generation.current
      try {
        const response = await apiFetch(`${API_BASE_URL}/api/session/activity`, { method: 'POST' })
        if (response.ok && version === generation.current && currentUser.current?.id === user.id) {
          const value = await response.json() as { sessionExpiresAt: string }
          deadline.current = Date.parse(value.sessionExpiresAt)
          // Display coordination only; the API always checks the database deadline.
          localStorage.setItem(sessionEventKey, JSON.stringify({ type: 'activity', userId: user.id, expiresAt: deadline.current, at: Date.now() }))
        }
      } catch { /* A failed heartbeat cannot extend the server session. */ }
      finally { sending = false }
    }
    const activity = (event: Event) => {
      if (!event.isTrusted || document.visibilityState !== 'visible' || expireIfIdle()) return
      pendingActivity = true
      void sendActivity()
    }
    const visible = () => {
      if (document.visibilityState === 'visible' && !expireIfIdle()) void refresh()
    }
    const shared = (event: StorageEvent) => {
      if (event.key !== sessionEventKey || !event.newValue) return
      try {
        const value = JSON.parse(event.newValue)
        if (value.userId !== currentUser.current?.id) return
        if (value.type === 'logout') endSession(value.reason || 'expired', false)
        else if (value.type === 'activity' && Number.isFinite(value.expiresAt)) deadline.current = Math.max(deadline.current, value.expiresAt)
      } catch { /* Ignore malformed display metadata; never treat it as authorization. */ }
    }
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart']
    events.forEach(name => window.addEventListener(name, activity, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', visible)
    window.addEventListener('storage', shared)
    const timer = window.setInterval(() => { if (!expireIfIdle()) void sendActivity() }, 1000)
    return () => {
      window.clearInterval(timer)
      events.forEach(name => window.removeEventListener(name, activity, true))
      document.removeEventListener('visibilitychange', visible)
      window.removeEventListener('storage', shared)
    }
  }, [user?.id, endSession, refresh])

  useEffect(() => { if (message && !dialog.current?.open) dialog.current?.showModal() }, [message])
  return <SessionContext.Provider value={{ user, loading, refresh }}>
    {children}
    {message && <dialog ref={dialog} aria-labelledby="session-ended-title" onCancel={() => setMessage('')} className="border rounded-4 p-4 shadow" style={{ maxWidth: 'min(450px, 90vw)' }}>
      <h2 id="session-ended-title" className="h4">Please sign in again</h2>
      <p>{message}</p>
      <button autoFocus className="btn btn-primary" onClick={() => setMessage('')}>OK</button>
    </dialog>}
  </SessionContext.Provider>
}
export const useSession = () => useContext(SessionContext)
export function AccessGate({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()
  const { pathname } = useLocation()
  const area = pathname.split('/')[1]
  if (!['resident', 'admin', 'village-manager', 'account'].includes(area)) return <>{children}</>
  if (loading) return <main className="container py-5" role="status">Checking your session…</main>
  if (!user) return <Navigate to="/login" replace />
  if (area === 'account') return <>{children}</>
  const allowed = area === 'admin' ? adminRoles.includes(user.role) : area === 'resident' ? user.role === 'Resident' : user.role === 'VillageManager'
  return allowed ? <>{children}</> : <Navigate to={homeForRole(user.role)} replace />
}

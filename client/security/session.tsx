import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { API_BASE_URL, apiFetch } from './api'

export const adminRoles = ['Admin', 'CompanySecretary', 'FinancialAdvisor', 'Chairman']
export type SessionUser = { id: number; userName: string; firstName: string; lastName: string; fullName: string; email: string; role: string; village: string; profileImageUrl: string }
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
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/session`)
      const currentUser = response.ok ? await response.json() as SessionUser : null
      cacheUser(currentUser); setUser(currentUser)
    } catch { cacheUser(null); setUser(null) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    void refresh()
    const expire = () => { cacheUser(null); setUser(null) }
    const refreshWhenVisible = () => { if (document.visibilityState === 'visible') void refresh() }
    window.addEventListener('samct-session-expired', expire)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => { window.removeEventListener('samct-session-expired', expire); document.removeEventListener('visibilitychange', refreshWhenVisible) }
  }, [])
  return <SessionContext.Provider value={{ user, loading, refresh }}>{children}</SessionContext.Provider>
}
export const useSession = () => useContext(SessionContext)
export function AccessGate({ children }: { children: ReactNode }) {
  const { user, loading } = useSession()
  const { pathname } = useLocation()
  const area = pathname.split('/')[1]
  if (!['resident', 'admin', 'village-manager'].includes(area)) return <>{children}</>
  if (loading) return <main className="container py-5" role="status">Checking your session…</main>
  if (!user) return <Navigate to="/login" replace />
  const allowed = area === 'admin' ? adminRoles.includes(user.role) : area === 'resident' ? user.role === 'Resident' : user.role === 'VillageManager'
  return allowed ? <>{children}</> : <Navigate to={homeForRole(user.role)} replace />
}

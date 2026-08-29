export const ADMIN_ROLES = [
  'CompanySecretary',
  'FinancialAdvisor',
  'FinancialAdministrator',
  'Chairman',
  'Director',
] as const

export const MANAGER_ROLES = ['VillageManager'] as const
export const RESIDENT_ROLES = ['Resident'] as const

export type SessionUser = {
  userName: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: string
  village: string
  profileImageUrl: string
  accessToken: string
  expiresAtUtc: string
}

const SESSION_KEYS = [
  'username',
  'firstname',
  'lastname',
  'fullname',
  'email',
  'role',
  'village',
  'profileImageUrl',
  'accessToken',
  'expiresAtUtc',
] as const

export function saveSession(user: SessionUser) {
  sessionStorage.setItem('username', user.userName || '')
  sessionStorage.setItem('firstname', user.firstName || '')
  sessionStorage.setItem('lastname', user.lastName || '')
  sessionStorage.setItem('fullname', user.fullName || '')
  sessionStorage.setItem('email', user.email || '')
  sessionStorage.setItem('role', user.role || '')
  sessionStorage.setItem('village', user.village || '')
  sessionStorage.setItem('profileImageUrl', user.profileImageUrl || '')
  sessionStorage.setItem('accessToken', user.accessToken || '')
  sessionStorage.setItem('expiresAtUtc', user.expiresAtUtc || '')
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key))
}

export function getAccessToken() {
  const token = sessionStorage.getItem('accessToken')
  const expiresAt = Date.parse(sessionStorage.getItem('expiresAtUtc') || '')

  if (!token || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearSession()
    return null
  }

  return token
}

export function getSessionRole() {
  return getAccessToken() ? sessionStorage.getItem('role') || '' : ''
}

export function homeForRole(role: string) {
  if ((ADMIN_ROLES as readonly string[]).includes(role)) return '/admin'
  if (role === 'VillageManager') return '/village-manager'
  return '/resident'
}

import axios from 'axios'

// Use a same-origin /api and /uploads reverse proxy in production.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const apiOrigin = new URL(API_BASE_URL || window.location.origin).origin
let csrfToken: Promise<string> | undefined
export function clearCsrfToken() { csrfToken = undefined }

async function getCsrfToken(): Promise<string> {
  csrfToken ??= window.fetch(`${API_BASE_URL}/api/csrf`, { credentials: 'include', cache: 'no-store' })
    .then(async response => {
      if (!response.ok) throw new Error('Could not start a secure session. Please reload.')
      const data = await response.json()
      return data.token as string
    }).catch(error => { csrfToken = undefined; throw error })
  return csrfToken
}
function isApi(url: string) {
  const parsed = new URL(url, window.location.origin)
  return parsed.origin === apiOrigin && parsed.pathname.startsWith('/api/')
}
function needsCsrf(method: string) { return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase()) }
function afterResponse(url: string, status: number) {
  if (/\/api\/(login|logout|reset-password|users\/password)$/.test(url) && status >= 200 && status < 300) clearCsrfToken()
  if (status === 401 && !url.endsWith('/api/login') && !url.endsWith('/api/session')) {
    window.dispatchEvent(new Event('samct-session-expired'))
  }
}
export async function apiFetch(url: string, options: RequestInit = {}) {
  if (!isApi(url)) throw new Error('API requests must use the configured SAMCT API.')
  const headers = new Headers(options.headers)
  if (needsCsrf(options.method || 'GET')) headers.set('X-CSRF-TOKEN', await getCsrfToken())
  const response = await window.fetch(url, { ...options, headers, credentials: 'include', cache: 'no-store' })
  afterResponse(url, response.status)
  return response
}
const api = axios.create({ withCredentials: true })
api.interceptors.request.use(async configuration => {
  if (!isApi(configuration.url || '')) throw new Error('API requests must use the configured SAMCT API.')
  if (needsCsrf(configuration.method || 'GET')) configuration.headers.set('X-CSRF-TOKEN', await getCsrfToken())
  // Let the browser set the multipart boundary.
  if (configuration.data instanceof FormData) configuration.headers.delete('Content-Type')
  return configuration
})
api.interceptors.response.use(response => {
  afterResponse(response.config.url || '', response.status)
  return response
}, error => {
  if (error.response) afterResponse(error.config.url || '', error.response.status)
  return Promise.reject(error)
})
export default api

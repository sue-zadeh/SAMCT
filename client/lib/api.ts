import axios from 'axios'
import { clearSession, getAccessToken } from './auth'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5072'

let configured = false

export function configureApiClient() {
  if (configured) return
  configured = true

  axios.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && getAccessToken()) {
        clearSession()
        window.location.assign('/login?session=expired')
      }
      return Promise.reject(error)
    },
  )

  const nativeFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url
    const isSamctApi =
      requestUrl.startsWith(API_BASE_URL) || requestUrl.startsWith('/api/')
    const token = isSamctApi ? getAccessToken() : null
    const headers = new Headers(init.headers)
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await nativeFetch(input, { ...init, headers })
    if (response.status === 401 && token) {
      clearSession()
      window.location.assign('/login?session=expired')
    }

    return response
  }
}

const rawBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3004'

export const API_BASE_URL = rawBase.replace(/\/$/, '')

export function backendUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

const rawBase = import.meta.env.VITE_API_BASE_URL ?? ''

export const API_BASE_URL = rawBase.replace(/\/$/, '')

export function backendUrl(path: string) {
  if (!API_BASE_URL) return path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

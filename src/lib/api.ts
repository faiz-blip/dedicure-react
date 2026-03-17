import axios from 'axios'
import { backendUrl } from '@/lib/config'

const api = axios.create({
  baseURL: backendUrl('/api/od'),
  headers: { 'Content-Type': 'application/json' },
})

export default api

export const fetcher = (url: string) => api.get(url).then((res) => res.data)

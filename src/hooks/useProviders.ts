import useSWR from 'swr'
import api from '@/lib/api'

export interface Provider {
  ProvNum: number
  Abbr: string
  FName: string
  LName: string
  Suffix: string
  IsHygienist: boolean
  IsHidden: boolean
  ClinicNum: number
  Color: number
}

export function useProviders() {
  const { data, error, isLoading, mutate } = useSWR<Provider[]>(
    '/providers',
    (url: string) => api.get(url).then(res => res.data)
  )
  return { providers: data, isLoading, isError: error, mutate }
}

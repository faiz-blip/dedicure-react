import useSWR from 'swr'
import api from '@/lib/api'

export interface Operatory {
  OperatoryNum: number
  OpName: string
  Abbrev: string
  IsHidden: boolean
  IsHygiene: boolean
  ClinicNum: number
}

export function useOperatories() {
  const { data, error, isLoading } = useSWR<Operatory[]>(
    '/operatories',
    (url: string) => api.get(url).then(res => res.data)
  )
  return { operatories: data, isLoading, isError: error }
}

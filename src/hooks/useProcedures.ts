import useSWR from 'swr'
import api from '@/lib/api'

export interface Procedure {
  ProcNum: number
  PatNum: number
  AptNum: number
  CodeNum: number
  // OD returns camelCase for these fields in live responses; demo fallback uses PascalCase
  ProcCode?: string
  procCode?: string
  ProcFee: number
  ProcStatus: number | string // numeric or string ('TP','C','EO','EC','R','D')
  ToothNum: string
  Surf: string
  DateTP: string
  ProcDate: string
  ProvNum: number
  Descript?: string
  descript?: string
  provAbbr?: string
}

export function useProcedures(patNum?: number | null, dateStart?: string, dateEnd?: string) {
  let urlStr = `/procedurelogs`
  const params = new URLSearchParams()
  if (patNum) params.set('PatNum', patNum.toString()) // OD API uses PascalCase
  if (dateStart) params.set('dateStart', dateStart)
  if (dateEnd) params.set('dateEnd', dateEnd)
  
  const queryString = params.toString()
  if (queryString) urlStr += `?${queryString}`

  const url = patNum === null ? null : urlStr
  const { data, error, isLoading, mutate } = useSWR<Procedure[]>(
    url,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { procedures: data, isLoading, isError: error, mutate }
}

export function useTreatmentPlanned(patNum: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Procedure[]>(
    patNum ? `/procedures?patNum=${patNum}&procStatus=1` : null,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { procedures: data, isLoading, isError: error, mutate }
}

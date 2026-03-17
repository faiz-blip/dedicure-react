import useSWR from 'swr'
import api from '@/lib/api'

export interface PreAuth {
  PreAuthNum: number
  PatNum: number
  ClaimNum: number
  ProcNum: number
  ProcCode: string
  Descript: string
  InsPayAmt: number
  Remarks: string
  DateEntry: string
  DateAuthExpired: string
  PatientName?: string
  CarrierName?: string
  Status: string // 'Pending', 'Approved', 'Denied', 'Expired'
}

export function usePreAuths() {
  const { data, error, isLoading, mutate } = useSWR<PreAuth[]>(
    '/preauths',
    (url: string) => api.get(url).then(res => res.data)
  )
  return { preAuths: data, isLoading, isError: error, mutate }
}

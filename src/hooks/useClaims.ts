import useSWR from 'swr'
import api from '@/lib/api'

export interface Claim {
  ClaimNum: number
  PatNum: number
  DateService: string
  DateSent: string
  ClaimStatus: string // 'U' unsent, 'S' sent, 'R' received, 'D' denied, 'P' preauth
  InsPayAmt: number
  InsPayEst: number
  ClaimFee: number
  PlanNum: number
  ProvTreat: number
  PatientName?: string
  CarrierName?: string
}

export function useClaims(status?: string) {
  const key = status ? `/claims?claimStatus=${status}` : '/claims'
  const { data, error, isLoading, mutate } = useSWR<Claim[]>(
    key,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { claims: data, isLoading, isError: error, mutate }
}

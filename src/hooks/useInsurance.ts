import useSWR from 'swr'
import api from '@/lib/api'

export interface InsPlan {
  PlanNum: number
  CarrierNum: number
  GroupName: string
  GroupNum: string
  CarrierName?: string
  ElectID?: string
}

export interface PatPlan {
  PatPlanNum: number
  PatNum: number
  PlanNum: number
  Ordinal: number
  IsSelfSub: boolean
  SubscriberID: string
  InsPlan?: InsPlan
}

export interface Carrier {
  CarrierNum: number
  CarrierName: string
  Phone: string
  ElectID: string
  IsCDA: boolean
}

export function usePatPlans(patNum: number | null) {
  const { data, error, isLoading, mutate } = useSWR<PatPlan[]>(
    patNum ? `/patplans?patNum=${patNum}` : null,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { patPlans: data, isLoading, isError: error, mutate }
}

export function useEligibility(patNum: number | null) {
  const { data, error, isLoading, mutate } = useSWR<{ Status: string; DateChecked: string; Benefits: string }>(
    patNum ? `/insverifies?patNum=${patNum}` : null,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { eligibility: data, isLoading, isError: error, mutate }
}

'use client'

import useSWR from 'swr'
import api from '@/lib/api'

export interface Patient {
  PatNum: number
  LName: string
  FName: string
  Preferred: string
  Birthdate: string
  ClinicNum: number
  IsGuarantor: boolean
  ChartNumber: string
  HmPhone: string
  WkPhone: string
  WirelessPhone: string
  Address: string
  City: string
  State: string
  Zip: string
  Email: string
}

// Some screens pass a display limit even though the API currently returns the
// full patient list; accept it to keep those callers type-safe.
export function usePatients(_limit?: number) {
  const { data, error, isLoading, mutate } = useSWR<Patient[]>(
    `/patients`,
    (url: string) => api.get(url).then((res: { data: Patient[] }) => res.data)
  )

  return {
    patients: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch a single patient by ID
export function usePatient(patNum: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Patient>(
    patNum ? `/patients/${patNum}` : null,
    (url: string) => api.get(url).then((res: { data: Patient }) => res.data)
  )

  return {
    patient: data,
    isLoading,
    isError: error,
    mutate,
  }
}

import useSWR from 'swr'
import api from '@/lib/api'

export interface Appointment {
  AptNum: number
  PatNum: number
  AptStatus: string // 'Scheduled', 'Complete', 'UnschedList', 'ASAP', 'Broken'
  Pattern: string
  ClinicNum: number
  IsNewPatient: boolean
  AptDateTime: string
  ProvNum: number
  ProvHyg: number
  AptDateTimeArrived: string
  AptDateTimeSeated: string
  AptDateTimeDismissed: string
  Op: number
  Note: string
  // Enhanced fields commonly added from JOINs
  PatientName?: string
  ProviderAbbr?: string
  OperatoryName?: string
}

// Fetch appointments for a specific date range
export function useAppointments(dateStart: string, dateEnd: string) {
  const { data, error, isLoading, mutate } = useSWR<Appointment[]>(
    `/appointments?dateStart=${dateStart}&dateEnd=${dateEnd}`,
    (url: string) => api.get(url).then((res: { data: Appointment[] }) => res.data)
  )

  return {
    appointments: data,
    isLoading,
    isError: error,
    mutate,
  }
}

// Fetch a single appointment
export function useAppointment(aptNum: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Appointment>(
    aptNum ? `/appointments/${aptNum}` : null,
    (url: string) => api.get(url).then((res: { data: Appointment }) => res.data)
  )

  return {
    appointment: data,
    isLoading,
    isError: error,
    mutate,
  }
}


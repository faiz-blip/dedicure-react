import useSWR from 'swr'
import api from '@/lib/api'

export interface RecallPatient {
  RecallNum: number
  PatNum: number
  DateDue: string
  DatePrevious: string
  RecallInterval: number
  RecallStatus: number
  Note: string
  IsDisabled: boolean
  PatientName?: string
  HmPhone?: string
  WirelessPhone?: string
  Email?: string
}

export function useRecall(overdueDays = 0) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - overdueDays)
  const dateStr = cutoff.toISOString().split('T')[0]

  const { data, error, isLoading, mutate } = useSWR<RecallPatient[]>(
    `/recalls?dateDue=${dateStr}&status=0`,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { recalls: data, isLoading, isError: error, mutate }
}

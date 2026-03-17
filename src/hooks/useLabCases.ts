import useSWR from 'swr'
import api from '@/lib/api'

export interface LabCase {
  LabCaseNum: number
  PatNum: number
  LaboratoryNum: number
  AptNum: number
  DateSent: string
  DateDue: string
  DateRecd: string
  DateChecked: string
  ProvNum: number
  Instructions: string
  LabFee: number
  PatientName?: string
  LabName?: string
}

export function useLabCases(dateStart?: string, dateEnd?: string) {
  const params = dateStart ? `?dateStart=${dateStart}&dateEnd=${dateEnd}` : ''
  const { data, error, isLoading, mutate } = useSWR<LabCase[]>(
    `/labcases${params}`,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { labCases: data, isLoading, isError: error, mutate }
}

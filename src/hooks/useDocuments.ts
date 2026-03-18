import useSWR from 'swr'
import api from '@/lib/api'

export interface ImagingDocument {
  // Both come as strings from the OD list API (e.g. "1004", "0")
  DocNum?: string | number
  MountNum?: string | number
  PatNum?: string | number
  DateCreated?: string
  DateTStamp?: string
  Description?: string
  Note?: string
  filePath?: string
  docCategory?: string
  DocCategory?: string
  ToothNumbers?: string
  ProvNum?: string
  PrintHeading?: string
  serverDateTime?: string
}

export function useDocuments(patNum: number | null) {
  const url = patNum ? `/documents?PatNum=${patNum}` : null
  const { data, error, isLoading, mutate } = useSWR<ImagingDocument[]>(
    url,
    (requestUrl: string) => api.get(requestUrl).then((res) => res.data)
  )

  return {
    documents: data,
    isLoading,
    isError: error,
    mutate,
  }
}

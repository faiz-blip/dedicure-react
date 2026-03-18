import useSWR from 'swr'
import api from '@/lib/api'

export interface ImagingDocument {
  DocNum?: number
  MountNum?: number
  PatNum?: number
  DateCreated?: string
  DateTimeCreated?: string
  DateTStamp?: string
  Description?: string
  description?: string
  FileName?: string
  fileName?: string
  FilePath?: string
  filePath?: string
  ImgType?: string
  imgType?: string
  Category?: string
  category?: string
  ToothNums?: string
  toothNums?: string
  Degrees?: string
  degrees?: string
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

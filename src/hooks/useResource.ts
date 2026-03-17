import useSWR from 'swr'
import axios from 'axios'
import { backendUrl } from '@/lib/config'

const dbFetcher = (url: string) => axios.get(backendUrl(url)).then((r) => r.data)

export function useResource<T>(resource: string) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    `/api/db/${resource}`,
    dbFetcher,
    { revalidateOnFocus: false }
  )

  return { data, isLoading, error, isError: !!error, mutate }
}

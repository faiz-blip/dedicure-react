import useSWR from 'swr'
import api from '@/lib/api'

export interface SmsMessage {
  SmsMessageNum: number
  PatNum: number
  GuidMessageTo: string
  MobilePhoneNumber: string
  MessageText: string
  DateTimeSent: string
  DateTimeReceived: string
  SmsStatus: number // 0=pending, 1=sent, 2=received, 3=error
  MsgType: number // 0=outgoing, 1=incoming
  PatientName?: string
}

export function useMessages(patNum?: number) {
  const key = patNum ? `/smsmessages?patNum=${patNum}` : '/smsmessages'
  const { data, error, isLoading, mutate } = useSWR<SmsMessage[]>(
    key,
    (url: string) => api.get(url).then(res => res.data)
  )
  return { messages: data, isLoading, isError: error, mutate }
}

import type { Patient } from '@/hooks/usePatients'

type SearchablePerson = {
  fullName: string
  firstName?: string
  lastName?: string
  chartNumber?: string
  phone?: string
  email?: string
  birthdate?: string
}

function normalize(value?: string) {
  return (value ?? '').trim().toLowerCase()
}

function digitsOnly(value?: string) {
  return (value ?? '').replace(/\D/g, '')
}

function normalizeDate(value?: string) {
  if (!value || value.startsWith('0001')) return ''
  return new Date(value).toLocaleDateString().toLowerCase()
}

export function scorePatientSearch(query: string, person: SearchablePerson) {
  const q = normalize(query)
  if (!q) return 0

  const fullName = normalize(person.fullName)
  const firstName = normalize(person.firstName)
  const lastName = normalize(person.lastName)
  const chartNumber = normalize(person.chartNumber)
  const email = normalize(person.email)
  const birthdate = normalizeDate(person.birthdate)
  const phone = digitsOnly(person.phone)
  const qDigits = digitsOnly(query)

  if ([fullName, chartNumber, email, birthdate].includes(q)) return 6
  if ([firstName, lastName].includes(q)) return 5
  if ((chartNumber && chartNumber.startsWith(q)) || (fullName && fullName.startsWith(q)) || (email && email.startsWith(q))) return 4
  if ((firstName && firstName.startsWith(q)) || (lastName && lastName.startsWith(q))) return 3
  if ((chartNumber && chartNumber.includes(q)) || (fullName && fullName.includes(q)) || (email && email.includes(q)) || (birthdate && birthdate.includes(q))) return 2
  if (qDigits && phone && phone.includes(qDigits)) return 2
  return -1
}

export function formatPatientSearchName(patient: Patient) {
  return `${patient.FName}${patient.Preferred ? ` "${patient.Preferred}"` : ''} ${patient.LName}`.trim()
}

export function formatPatientSearchPhone(patient: Patient) {
  return patient.WirelessPhone || patient.HmPhone || patient.WkPhone || ''
}

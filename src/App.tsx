import { ComponentType } from 'react'
import AppShell from '@/components/AppShell'
import GenericScreen from '@/components/GenericScreen'
import PatientDetail from '@/screens/PatientDetail'
import { RouterProvider, usePathname } from '@/router'

const screenModules = import.meta.glob('./screens/*.{tsx,jsx}', { eager: true }) as Record<string, { default: ComponentType<any> }>

const SCREEN_FILES: Record<string, string> = {
  dashboard: 'DashboardReact',
  'dashboard-react': 'DashboardReact',
  'dashboard-old': 'Dashboard',
  huddle: 'Huddle',
  schedule: 'Schedule',
  checkin: 'Checkin',
  charting: 'Charting',
  perio: 'Perio',
  treatment: 'Treatment',
  patients: 'Patients',
  messaging: 'Messaging',
  lab: 'Lab',
  recall: 'Recall',
  referrals: 'Referrals',
  billing: 'Billing',
  eligibility: 'Eligibility',
  preauth: 'PreAuth',
  analytics: 'Analytics',
  goals: 'Goals',
  staffing: 'Staffing',
  compensation: 'Compensation',
  inventory: 'Inventory',
  offices: 'Offices',
  marketing: 'Marketing',
  reports: 'Reports',
  calls: 'Calls',
  integrations: 'Integrations',
  compliance: 'Compliance',
  settings: 'Settings',
  'ai-coach': 'AiCoach',
  'ai-transcription': 'AiTranscription',
  'ai-marketing': 'AiMarketing',
  'ai-forecasting': 'AiForecasting',
  'ai-treatment': 'AiTreatment',
  'ai-analysis': 'AiAnalysis',
  credentialing: 'Credentialing',
  'fee-schedule': 'FeeSchedule',
  'mobile-app': 'MobileApp',
  'patient-portal': 'PatientPortal',
  imaging: 'Imaging',
  pnl: 'Pnl',
  'ai-phone': 'AiPhone',
  'contract-ai': 'ContractAi',
  denovo: 'Denovo',
  cbct: 'Cbct',
  watch: 'Watch',
}

function moduleFor(screenFile: string) {
  return screenModules[`./screens/${screenFile}.tsx`] ?? screenModules[`./screens/${screenFile}.jsx`]
}

function Routes() {
  const pathname = usePathname()
  const patientMatch = pathname.match(/^\/patients\/(\d+)$/)
  const providerMatch = pathname.match(/^\/providers\/(\d+)$/)

  if (patientMatch) {
    return (
      <AppShell>
        <PatientDetail patNum={Number(patientMatch[1])} />
      </AppShell>
    )
  }

  if (providerMatch) {
    return (
      <AppShell>
        <GenericScreen title={`Provider ${providerMatch[1]}`} description="Provider detail was linked from the original app but did not have a dedicated screen." badge="bb" />
      </AppShell>
    )
  }

  const id = pathname === '/' ? 'dashboard' : pathname.slice(1)
  const screenFile = SCREEN_FILES[id]
  const Screen = screenFile ? moduleFor(screenFile)?.default : null

  return (
    <AppShell>
      {Screen ? <Screen /> : <GenericScreen title="Not Found" description={`No React route is mapped for ${pathname}.`} badge="br" />}
    </AppShell>
  )
}

export default function App() {
  return (
    <RouterProvider>
      <Routes />
    </RouterProvider>
  )
}

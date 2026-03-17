export interface NavItem {
  id: string
  label: string
  badge?: string | number
  badgeClass?: string
  icon: string // SVG path data
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Clinical',
    items: [
      { id: 'dashboard', label: 'Dashboard', badge: 'AI', badgeClass: 'g', icon: 'M1.5 1.5h5v5h-5zM9.5 1.5h5v5h-5zM1.5 9.5h5v5h-5zM9.5 9.5h5v5h-5z' },
      { id: 'huddle', label: 'Morning Huddle', icon: 'M8 4a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 14c0-3.3 2.7-5 6-5s6 1.7 6 5M11.5 7.5l1 1 2-2' },
      { id: 'schedule', label: 'Schedule', icon: 'M1.5 3h13v11.5H1.5zM1.5 7h13M5 1.5v3M11 1.5v3' },
      { id: 'checkin', label: 'Check-In / Check-Out', badge: 3, badgeClass: 'b', icon: 'M2 1h9a1.5 1.5 0 011.5 1.5v13H2zM11 4h2.5M11 8h2.5M11 12h2.5M5 7l1.5 1.5L9 6' },
      { id: 'charting', label: 'Clinical Charting', icon: 'M8 1.5C5.5 1.5 3.5 3.2 3.5 5.5c0 1.8 1 3.3 2.5 4l-.5 3.5 2.5-1.5 2.5 1.5-.5-3.5c1.5-.7 2.5-2.2 2.5-4 0-2.3-2-4-4.5-4z' },
      { id: 'perio', label: 'Perio Charting', icon: 'M2 12c2-4 4-4 6 0s4 4 6 0M2 8c2-4 4-4 6 0s4 4 6 0' },
      { id: 'treatment', label: 'Treatment Planning', icon: 'M3 8h10M8 3v10M8 14.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z' },
      { id: 'patients', label: 'Patients', badge: 12, badgeClass: 'g', icon: 'M6 5a3 3 0 100-6 3 3 0 000 6zM1 14c0-3 2.2-5 5-5s5 2 5 5M12.5 6a2 2 0 100-4 2 2 0 000 4zM14 11.5c1 .5 1.5 1.5 1.5 2.5' },
      { id: 'messaging', label: 'Patient Messaging', badge: 7, badgeClass: '', icon: 'M14 9.5a5.5 5.5 0 01-5.5 5.5H3l-1.5 1.5v-7A5.5 5.5 0 018 4a5.5 5.5 0 016 5.5z' },
      { id: 'lab', label: 'Lab Cases', badge: 8, badgeClass: 'b', icon: 'M6 1v6L2.5 13.5a1 1 0 00.9 1.5h9.2a1 1 0 00.9-1.5L10 7V1M4.5 4h7' },
      { id: 'recall', label: 'Recall & Recare', badge: 47, badgeClass: '', icon: 'M8 14.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM8 4.5v4l2.5 1.5' },
      { id: 'referrals', label: 'Referrals', icon: 'M10 3l3 3-3 3M13 6H7a4 4 0 000 8h1' },
    ]
  },
  {
    title: 'Revenue Cycle',
    items: [
      { id: 'billing', label: 'Billing & Claims', icon: 'M1 3.5h14a1.5 1.5 0 011.5 1.5v9H1V5A1.5 1.5 0 012.5 3.5zM1 7h14' },
      { id: 'eligibility', label: 'Insurance Eligibility', icon: 'M1.5 2h13a1.5 1.5 0 011.5 1.5v12H0V3.5A1.5 1.5 0 011.5 2zM5 8l2 2 4-4' },
      { id: 'preauth', label: 'Pre-Authorization', icon: 'M8 1.5L2 5v4c0 3.5 2.7 6.3 6 7 3.3-.7 6-3.5 6-7V5L8 1.5zM5.5 8l1.5 1.5 3-3' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { id: 'analytics', label: 'Analytics', icon: 'M1 12l3.5-4.5 3 2 3.5-5 3.5 2' },
      { id: 'goals', label: 'Goals & Benchmarks', icon: 'M8 14.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM8 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM8 9a1 1 0 100-2 1 1 0 000 2z' },
      { id: 'staffing', label: 'Staffing & Scheduling', icon: 'M5 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM11 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1 14c0-2.5 1.8-4 4-4s4 1.5 4 4M12 10.5c2.2 0 3 1.5 3 3.5' },
      { id: 'compensation', label: 'Provider Compensation', icon: 'M8 14.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM8 4.5v7M5.5 6.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2-1 1.5-2.5 2-2.5 1-2.5 2 1 2 2.5 2 2.5-.9 2.5-2' },
      { id: 'inventory', label: 'Inventory', icon: 'M1 8h14v6.5H1zM4 8V5.5a4 4 0 018 0V8' },
      { id: 'offices', label: 'Offices & Locations', icon: 'M2 14.5V5.5l6-4 6 4v9H2zM6 9h4v5.5H6z' },
    ]
  },
  {
    title: 'Growth',
    items: [
      { id: 'marketing', label: 'Marketing & Reviews', icon: 'M1.5 9.5V7L10.5 2.5v11L1.5 9.5zM10.5 6.5l3.5 1' },
      { id: 'reports', label: 'Reports', icon: 'M2 1h12a1.5 1.5 0 011.5 1.5v13H.5V2.5A1.5 1.5 0 012 1zM5 5h6M5 8h6M5 11h4' },
      { id: 'calls', label: 'Call Center', icon: 'M3.5 1.5S2 4 3.5 6 7.5 8 7.5 8s2 1.2 4 2.5 3.5.5 3.5.5l1-2.5-2-1.5-1.2 1.2S11.5 7 9.5 5s-1-2-1-2L6 2.5 3.5 1.5z' },
    ]
  },
  {
    title: 'Platform',
    items: [
      { id: 'integrations', label: 'Integrations', icon: 'M3.5 5.5a2 2 0 100-4 2 2 0 000 4zM12.5 5.5a2 2 0 100-4 2 2 0 000 4zM8 15a2 2 0 100-4 2 2 0 000 4zM5.5 3.5h5M3.5 5.5l3 5.7M12.5 5.5l-3 5.7' },
      { id: 'compliance', label: 'HIPAA / Compliance', icon: 'M8 1.5L2 5v4c0 3.5 2.7 6.3 6 7 3.3-.7 6-3.5 6-7V5L8 1.5z' },
      { id: 'settings', label: 'Settings', icon: 'M8 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4' },
    ]
  },
  {
    title: 'AI Suite',
    items: [
      { id: 'ai-coach', label: 'AI Command Center', icon: 'M8 1.5c-.8 0-1.5.3-2 .8L3 5.5v5l3 3h4l3-3v-5L10 2.3c-.5-.5-1.2-.8-2-.8zM8 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 8.5v2.5' },
      { id: 'ai-transcription', label: 'AI Transcription', icon: 'M8 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 8.5c0 2.2 1.8 4 4 4s4-1.8 4-4M8 12.5v2M5.5 14.5h5' },
      { id: 'ai-marketing', label: 'AI Marketing', icon: 'M2 9a6 6 0 0110.4-4M14 7a6 6 0 01-10.4 4M8 10a2 2 0 100-4 2 2 0 000 4z' },
      { id: 'ai-forecasting', label: 'AI Forecasting', icon: 'M1 13l3-5 3 2 3-5 3 2M10 5h5M13 7l2-4' },
      { id: 'ai-treatment', label: 'AI Treatment Advisor', icon: 'M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5 6.5 5z' },
      { id: 'ai-analysis', label: 'AI Analytics', icon: 'M1.5 8h3v6.5h-3zM6.5 4h3v10.5h-3zM11.5 1h3v13.5h-3zM1.5 6l3.5-3 4 2 5.5-4' },
      { id: 'credentialing', label: 'Credentialing', icon: 'M2 2h12a2 2 0 012 2v10H0V4a2 2 0 012-2zM5 8l2 2 4-4' },
      { id: 'fee-schedule', label: 'AI Fee Scheduling', icon: 'M8 14.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM8 4.5v7M5.5 6c0-1 .9-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 2-2.5 1-2.5 2 1 1.5 2.5 1.5 2.5-.5 2.5-1.5' },
      { id: 'mobile-app', label: 'Mobile App Preview', icon: 'M4 1h8a1.5 1.5 0 011.5 1.5v13H2.5V2.5A1.5 1.5 0 014 1zM7 12.5h2' },
      { id: 'patient-portal', label: 'Patient Portal', icon: 'M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 14c0-3 2.7-5 6-5s6 2 6 5M10.5 9.5l1 1 2-2' },
      { id: 'imaging', label: 'Imaging Viewer', icon: 'M1 2h14a1.5 1.5 0 011.5 1.5v11H-.5V3.5A1.5 1.5 0 011 2zM6 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM10.5 5.5l3 3-3 3' },
    ]
  },
  {
    title: 'The Final 1%',
    items: [
      { id: 'pnl', label: 'P&L / EBITDA Finance', icon: 'M1.5 1.5h13v13h-13zM4 11l2-4 2.5 2 2.5-4.5L14.5 7M4 13.5h8' },
      { id: 'ai-phone', label: 'AI Phone System', icon: 'M3.5 1.5S2 4 3.5 6 7.5 8 7.5 8s2 1.2 4 2.5 3.5.5 3.5.5l1-2.5-2-1.5-1.2 1.2S11.5 7 9.5 5s-1-2-1-2L6 2.5 3.5 1.5z' },
      { id: 'contract-ai', label: 'Contract Negotiation AI', icon: 'M2 1h12a1.5 1.5 0 011.5 1.5v13H.5V2.5A1.5 1.5 0 012 1zM5 5h6M5 8h6M5 11h4' },
      { id: 'denovo', label: 'De Novo / M&A Pipeline', icon: 'M2 14.5V5.5l6-4 6 4v9H2zM8 14.5v-5M5 9h6' },
      { id: 'cbct', label: 'CBCT / 3D Imaging', icon: 'M8 14.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM1.5 8h13M8 1.5v13M8 1.5C5 1.5 1.5 4.5 1.5 8S5 14.5 8 14.5M8 1.5c3 0 6.5 3 6.5 6.5s-3.5 6.5-6.5 6.5' },
      { id: 'watch', label: 'Apple Watch / Wearable', icon: 'M4 3h8a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2zM6 1h-1M10 1h1M6 13h-1M10 13h1M8 6v2.5M8 8.5a.8.8 0 100-1.6.8.8 0 000 1.6z' },
    ]
  }
]

export const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  'dashboard': { title: 'Production Dashboard', sub: 'March 2026  -  Trinity Dental Centers  -  All Offices' },
  'huddle': { title: 'Morning Huddle', sub: 'Sunday, March 15, 2026  -  18 patients  -  $4,820 production' },
  'schedule': { title: 'Schedule', sub: 'March 2026  -  Trinity Sealy Dental' },
  'checkin': { title: 'Check-In / Check-Out', sub: 'Today  -  18 patients scheduled' },
  'charting': { title: 'Clinical Charting', sub: 'Marcus Webb  -  #00482  -  Crown Prep #14' },
  'perio': { title: 'Perio Charting', sub: 'Betty Kim  -  Stage II Grade B Periodontitis' },
  'treatment': { title: 'Treatment Planning', sub: 'Marcus Webb  -  $3,720 total' },
  'patients': { title: 'Patient Management', sub: '2,154 total patients  -  Trinity Sealy Dental' },
  'messaging': { title: 'Patient Messaging', sub: '7 unread  -  24 confirmations sent' },
  'lab': { title: 'Lab Cases', sub: '8 active cases  -  SoCal Ceramics  -  National Dental Lab' },
  'recall': { title: 'Recall & Recare', sub: '47 overdue  -  $16,450 opportunity' },
  'referrals': { title: 'Referrals', sub: '18 out  -  12 in  -  MTD' },
  'billing': { title: 'Billing & Claims', sub: '$28,420 A/R  -  7 denied claims' },
  'eligibility': { title: 'Insurance Eligibility', sub: '4 pending for tomorrow' },
  'preauth': { title: 'Pre-Authorization', sub: '12 active  -  7 pending response' },
  'analytics': { title: 'Analytics', sub: 'YTD  -  All offices  -  2026 vs 2025' },
  'goals': { title: 'Goals & Benchmarks', sub: 'March 2026  -  9 goals tracked' },
  'staffing': { title: 'Staffing & Scheduling', sub: 'Week of March 15  -  24 staff' },
  'compensation': { title: 'Provider Compensation', sub: 'March MTD  -  $42,480 total comp' },
  'inventory': { title: 'Inventory', sub: '284 SKUs  -  12 low stock  -  3 out of stock' },
  'offices': { title: 'Offices & Locations', sub: 'Trinity Dental Centers  -  3 locations' },
  'marketing': { title: 'Marketing & Reviews', sub: '4.8... avg  -  23 new patients MTD' },
  'reports': { title: 'Reports', sub: 'All reports  -  Export & schedule' },
  'calls': { title: 'Call Center', sub: '24 calls today  -  79% answer rate' },
  'integrations': { title: 'Integrations', sub: 'Connected systems & APIs' },
  'compliance': { title: 'HIPAA / Compliance', sub: '94% compliance score' },
  'settings': { title: 'Settings', sub: 'Organization  -  Users  -  Security' },
  'ai-coach': { title: 'AI Command Center', sub: 'Active across all modules  -  Updated 32 sec ago' },
  'ai-transcription': { title: 'AI Transcription', sub: '8 notes today  -  97% CDT accuracy' },
  'ai-marketing': { title: 'AI Marketing', sub: '4 active campaigns  -  38% avg open rate' },
  'ai-forecasting': { title: 'AI Forecasting', sub: '94.2% model accuracy  -  12-month projection' },
  'ai-treatment': { title: 'AI Treatment Advisor', sub: 'Evidence-based clinical decision support' },
  'ai-analysis': { title: 'AI Analytics', sub: 'Natural language queries  -  Anomaly detection' },
  'credentialing': { title: 'Credentialing', sub: '8 providers  -  34 payer enrollments' },
  'fee-schedule': { title: 'AI Fee Scheduling', sub: '$28,400 annual revenue opportunity identified' },
  'mobile-app': { title: 'Mobile App Preview', sub: 'iOS & Android  -  Coming Q3 2026' },
  'patient-portal': { title: 'Patient Portal', sub: '1,242 active accounts  -  57% adoption' },
  'imaging': { title: 'Imaging Viewer', sub: 'Marcus Webb  -  14 images on file' },
  'pnl': { title: 'P&L / EBITDA Finance', sub: 'QuickBooks synced  -  All offices  -  March 2026' },
  'ai-phone': { title: 'AI Phone System', sub: 'AI handling 3 lines  -  75% fully resolved' },
  'contract-ai': { title: 'Contract Negotiation AI', sub: '$84,200 annual increase identified' },
  'denovo': { title: 'De Novo / M&A Pipeline', sub: '3 active opportunities  -  $2.4M committed' },
  'cbct': { title: 'CBCT / 3D Imaging', sub: 'DICOM v3.0  -  AI Model v4.1' },
  'watch': { title: 'Apple Watch / Wearable', sub: 'Provider wearable integration' },
}


'use client'
import { usePathname } from 'next/navigation'
import { PAGE_TITLES } from '@/lib/nav'

export default function Topbar() {
  const pathname = usePathname()
  const currentId = pathname === '/' ? 'dashboard' : pathname.slice(1)
  const page = PAGE_TITLES[currentId] ?? { title: 'Dedicure', sub: 'DSO Platform' }

  return (
    <header className="topbar">
      <div className="tb-info">
        <div className="tb-title">
          <span className="live-pill">
            <span className="live-dot" />
            Live
          </span>
          {page.title}
        </div>
        <div className="tb-sub">{page.sub}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <select className="sel" style={{ fontSize: '11px' }} defaultValue="Trinity Sealy Dental">
          <option>All Offices</option>
          <option>Trinity Sealy Dental</option>
          <option>Main Office</option>
          <option>North Campus</option>
        </select>
        <button className="btn btn-sm"> Export</button>
        <button className="btn btn-sm btn-p">* AI Coach</button>
      </div>
    </header>
  )
}

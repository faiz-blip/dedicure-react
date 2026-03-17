'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS } from '@/lib/nav'

export default function Sidebar() {
  const pathname = usePathname()
  const currentId = pathname === '/' ? 'dashboard' : pathname.slice(1)

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="logo-mark">D</div>
        <div>
          <div className="logo-txt">Dedicure</div>
          <div className="logo-sub">Complete DSO Platform</div>
        </div>
      </div>

      {/* Navigation sections */}
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <div className="sb-sec">{section.title}</div>
          {section.items.map((item) => {
            const isActive = currentId === item.id
            return (
              <Link
                key={item.id}
                href={item.id === 'dashboard' ? '/' : `/${item.id}`}
                className={`nav${isActive ? ' active' : ''}`}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`nbadge${item.badgeClass ? ` ${item.badgeClass}` : ''}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}

      {/* Footer user row */}
      <div className="sb-foot">
        <div className="user-row">
          <div className="av av-g">HS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Hammaad Salik
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text3)' }}>Super Admin  -  All Offices</div>
          </div>
        </div>
      </div>
    </nav>
  )
}


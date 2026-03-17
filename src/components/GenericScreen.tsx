// Generic fallback screen for screens not yet fully implemented
export default function GenericScreen({ title, description, badge, children }: {
  title: string
  description?: string
  badge?: string
  children?: React.ReactNode
}) {
  return (
    <>
      {children}
      {!children && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}> - </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
          {description && <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>{description}</div>}
          {badge && <span className={`badge ${badge}`}>Feature Active</span>}
        </div>
      )}
    </>
  )
}


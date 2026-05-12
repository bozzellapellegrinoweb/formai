import { useNavigate, useLocation } from 'react-router-dom'
import { c } from '../../design/themes'

const navItems = [
  {
    path: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w55} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      </svg>
    ),
  },
  {
    path: '/piano',
    label: 'Piano',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w55} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
      </svg>
    ),
  },
  {
    path: '/chat',
    label: 'NUTRI',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w55} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    path: '/profilo',
    label: 'Profilo',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w55} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 50,
      background: 'var(--bg)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
      paddingLeft: 8,
      paddingRight: 8,
    }}>
      {navItems.map((item) => {
        const active = location.pathname === item.path
        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: active ? 6 : 0,
              cursor: 'pointer',
              padding: active ? '8px 16px' : '8px 12px',
              borderRadius: 50,
              background: active ? c.lime : 'transparent',
              transition: 'background 0.18s, padding 0.18s',
            }}
          >
            {item.icon(active)}
            {active && (
              <span style={{
                fontSize: 13,
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                color: c.ink,
                letterSpacing: '-0.01em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

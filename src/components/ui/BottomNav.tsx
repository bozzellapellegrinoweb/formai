import { useNavigate, useLocation } from 'react-router-dom'

const c = {
  lime: '#EAFF55',
  ink:  '#0a0d00',
  w40:  'rgba(255,255,255,0.40)',
  w20:  'rgba(255,255,255,0.20)',
  w06:  'rgba(255,255,255,0.06)',
}

const navItems = [
  {
    path: '/home',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w40} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      </svg>
    ),
  },
  {
    path: '/piano',
    label: 'Piano',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w40} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
        stroke={active ? c.ink : c.w40} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    path: '/profilo',
    label: 'Profilo',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={active ? c.ink : c.w40} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <div style={{
      background: 'rgba(14,16,8,0.82)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: `1px solid rgba(255,255,255,0.07)`,
      padding: '10px 8px 24px',
      display: 'flex',
      justifyContent: 'space-around',
      flexShrink: 0,
    }}>
      {navItems.map((item) => {
        const active = location.pathname === item.path
        return (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 3,
              cursor: 'pointer',
              padding: active ? '6px 18px' : '6px 12px',
              borderRadius: 50,
              background: active ? c.lime : 'transparent',
              transition: 'background 0.2s',
            }}
          >
            {item.icon(active)}
            <span style={{
              fontSize: 10,
              fontFamily: "'Poppins', sans-serif",
              fontWeight: active ? 700 : 400,
              color: active ? c.ink : c.w40,
              letterSpacing: '0.1px',
            }}>
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

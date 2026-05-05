import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/ui/StatusBar'

const c = {
  bg:    '#0e1008',
  bg4:   '#252912',
  lime:  '#EAFF55',
  limeD: '#b8cc00',
  w:     '#ffffff',
  w80:   'rgba(255,255,255,0.80)',
  w60:   'rgba(255,255,255,0.60)',
  w40:   'rgba(255,255,255,0.40)',
  w20:   'rgba(255,255,255,0.20)',
  w10:   'rgba(255,255,255,0.10)',
  w06:   'rgba(255,255,255,0.06)',
  ink:   '#0a0d00',
}

function DynamicIsland() {
  return (
    <div style={{
      position: 'absolute',
      top: 12, left: '50%', transform: 'translateX(-50%)',
      width: 90, height: 26,
      background: '#000', borderRadius: 50, zIndex: 30,
    }}/>
  )
}

function InputField({ icon, placeholder, type = 'text' }: { icon: React.ReactNode; placeholder: string; type?: string }) {
  return (
    <div style={{
      width: '100%', height: 42,
      background: c.bg4,
      border: `1px solid ${c.w10}`,
      borderRadius: 10,
      padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          fontSize: 12, color: c.w60,
          fontFamily: "'Poppins', sans-serif",
        }}
      />
    </div>
  )
}

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const navigate = useNavigate()

  return (
    <div style={{
      background: c.bg,
      height: '100svh',
      display: 'flex', flexDirection: 'column',
      maxWidth: 390, margin: '0 auto',
      position: 'relative', overflow: 'hidden',
    }}>
      <DynamicIsland />
      <StatusBar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Title */}
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: c.w }}>
            Accedi o registrati<br/>su forma<span style={{ color: c.lime }}>.ai</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2,
          margin: '14px 20px 0',
          background: c.bg4, borderRadius: 50,
          padding: 3, flexShrink: 0,
        }}>
          {(['login', 'signup'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '8px',
                borderRadius: 50,
                fontSize: 12, fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                textAlign: 'center', cursor: 'pointer', border: 'none',
                background: activeTab === tab ? c.lime : 'transparent',
                color: activeTab === tab ? c.ink : c.w40,
              }}
            >
              {tab === 'login' ? 'Accedi' : 'Registrati'}
            </motion.button>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: '14px 20px 0', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <InputField
            placeholder="Indirizzo email"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.w20} strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            }
          />
          <InputField
            placeholder="Password"
            type="password"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.w20} strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            }
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif" }}>
              <div style={{ width: 13, height: 13, border: `1px solid ${c.w20}`, borderRadius: 3 }}/>
              Ricordami
            </div>
            <span style={{ fontSize: 12, color: c.limeD, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
              Password dimenticata
            </span>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/onboarding')}
          style={{
            margin: '14px 20px 0',
            height: 46,
            background: c.lime, borderRadius: 10,
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            fontFamily: "'Poppins', sans-serif",
            color: c.ink,
            flexShrink: 0,
          }}
        >
          {activeTab === 'login' ? 'Accedi' : 'Registrati'}
        </motion.button>

        {/* OR */}
        <div style={{
          textAlign: 'center', fontSize: 12, color: c.w40,
          margin: '10px 20px 0', flexShrink: 0,
          position: 'relative', fontFamily: "'Poppins', sans-serif",
        }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: c.w10 }}/>
          <span style={{ background: c.bg, padding: '0 8px', position: 'relative' }}>
            {activeTab === 'login' ? 'Oppure accedi con' : 'Oppure registrati con'}
          </span>
        </div>

        {/* Social */}
        <div style={{ display: 'flex', gap: 8, margin: '10px 20px 0', flexShrink: 0 }}>
          {([
            {
              label: 'Google',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              ),
            },
            {
              label: 'Apple',
              icon: (
                <svg width="15" height="15" viewBox="0 0 814 1000" fill="rgba(255,255,255,0.85)">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 443.5 27.8 233 111.4 170.8c44-35 105.2-57.5 163.1-57.5 59.1 0 112.6 35.6 150.8 35.6 35.7 0 99.3-39.5 168.5-39.5 27.2 0 138.2 5.8 203.5 93.1zm-192-181.6c31.1-37.5 53.1-89.8 53.1-142 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 84.7-55.1 139.5 0 8.4 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-72.6z"/>
                </svg>
              ),
            },
          ] as { label: string; icon: React.ReactNode }[]).map((s) => (
            <motion.button
              key={s.label}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, height: 38,
                background: c.bg4, border: `1px solid ${c.w10}`,
                borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 7, fontSize: 12, fontWeight: 500,
                fontFamily: "'Poppins', sans-serif", color: 'rgba(255,255,255,0.8)',
              }}
            >
              {s.icon} {s.label}
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', fontSize: 12, color: c.w40,
          margin: '10px 0 0', flexShrink: 0,
          fontFamily: "'Poppins', sans-serif",
        }}>
          {activeTab === 'login'
            ? <><span>Non hai un account? </span><span style={{ color: c.limeD, cursor: 'pointer' }} onClick={() => setActiveTab('signup')}>Registrati</span></>
            : <><span>Hai già un account? </span><span style={{ color: c.limeD, cursor: 'pointer' }} onClick={() => setActiveTab('login')}>Accedi</span></>
          }
        </div>

        <div style={{ flex: 1 }}/>
      </div>
    </div>
  )
}

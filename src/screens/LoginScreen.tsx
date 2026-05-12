import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, signInWithGoogle } from '../lib/auth'
import { c } from '../design/themes'

const red = '#ff4d4d'


function InputField({
  icon, placeholder, type = 'text', value, onChange,
}: {
  icon: React.ReactNode
  placeholder: string
  type?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{
      width: '100%', height: 42, background: c.bg4,
      border: `1px solid ${c.w10}`, borderRadius: 10,
      padding: '0 14px', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          fontSize: 15, color: c.w80, fontFamily: "'Poppins', sans-serif",
        }}
      />
    </div>
  )
}

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    if (!email || !password) { setError('Inserisci email e password'); return }
    setLoading(true)
    setError(null)

    if (activeTab === 'login') {
      const { error: e } = await signIn(email, password)
      if (e) { setError(e.message === 'Email not confirmed' ? 'Conferma prima la tua email — controlla la casella di posta.' : e.message); setLoading(false); return }
      navigate('/home')
    } else {
      const { error: e } = await signUp(email, password)
      if (e) { setError(e.message); setLoading(false); return }
      setEmailSent(true)
    }
    setLoading(false)
  }

  const emailIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
  const lockIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  )

  /* ── Schermata conferma email ── */
  if (emailSent) {
    return (
      <div style={{
        background: c.bg, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        paddingTop: 'env(safe-area-inset-top)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 28px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(234,255,85,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.lime} strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: c.w, textAlign: 'center', marginBottom: 12 }}>
          Controlla la tua email
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, color: c.w60, textAlign: 'center', lineHeight: 1.6, marginBottom: 32 }}>
          Abbiamo inviato un link di conferma a<br/>
          <span style={{ color: c.lime, fontWeight: 600 }}>{email}</span><br/>
          Clicca il link per attivare il tuo account.
        </div>
        <motion.div whileTap={{ scale: 0.97 }} onClick={() => { setEmailSent(false); setActiveTab('login') }}
          style={{
            height: 46, width: '100%', maxWidth: 320,
            background: c.lime, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink,
            cursor: 'pointer',
          }}>
          Vai al login
        </motion.div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40, marginTop: 16, textAlign: 'center' }}>
          Non hai ricevuto nulla? Controlla la cartella spam.
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: c.bg, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, paddingTop: 'env(safe-area-inset-top)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Title */}
        <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: c.w }}>
            Accedi o registrati<br/>su forma<span style={{ color: c.lime }}>.ai</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2, margin: '14px 20px 0',
          background: c.bg4, borderRadius: 50, padding: 3, flexShrink: 0,
        }}>
          {(['login', 'signup'] as const).map((tab) => (
            <motion.button key={tab} whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveTab(tab); setError(null) }}
              style={{
                flex: 1, padding: '8px', borderRadius: 50,
                fontSize: 14, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
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
          <InputField placeholder="Indirizzo email" icon={emailIcon} value={email} onChange={setEmail} />
          <InputField placeholder="Password" type="password" icon={lockIcon} value={password} onChange={setPassword} />

          {activeTab === 'login' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 14, color: c.limeD, fontFamily: "'Poppins', sans-serif", cursor: 'pointer' }}>
                Password dimenticata
              </span>
            </div>
          )}

          {error && (
            <div style={{
              fontSize: 14, color: red, fontFamily: "'Poppins', sans-serif",
              background: 'rgba(255,77,77,0.1)', borderRadius: 8,
              padding: '8px 12px',
            }}>
              {error}
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          style={{
            margin: '14px 20px 0', height: 46,
            background: loading ? c.bg4 : c.lime,
            borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
            color: loading ? c.w40 : c.ink, flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Caricamento...' : activeTab === 'login' ? 'Accedi' : 'Registrati'}
        </motion.button>

        {/* OR */}
        <div style={{
          textAlign: 'center', fontSize: 14, color: c.w40,
          margin: '10px 20px 0', flexShrink: 0,
          position: 'relative', fontFamily: "'Poppins', sans-serif",
        }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: c.w10 }}/>
          <span style={{ background: c.bg, padding: '0 8px', position: 'relative' }}>
            {activeTab === 'login' ? 'Oppure accedi con' : 'Oppure registrati con'}
          </span>
        </div>

        {/* Social — solo Google */}
        <div style={{ margin: '10px 20px 0', flexShrink: 0 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => signInWithGoogle()}
            style={{
              width: '100%', height: 42, background: c.bg4, border: `1px solid ${c.w10}`,
              borderRadius: 10, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, fontSize: 15, fontWeight: 500,
              fontFamily: "'Poppins', sans-serif", color: 'rgba(255,255,255,0.85)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continua con Google
          </motion.button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', fontSize: 14, color: c.w40,
          margin: '10px 0 0', flexShrink: 0, fontFamily: "'Poppins', sans-serif",
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

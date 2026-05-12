import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { Users, Activity, TrendingUp, LogOut, RefreshCw, ChevronRight, ChevronLeft, Shield, Mail, Calendar, Dumbbell } from 'lucide-react'

const c = {
  bg:    '#0a0c02',
  bg2:   '#111400',
  bg3:   '#181c06',
  bg4:   '#1e2209',
  lime:  '#EAFF55',
  limeD: '#b8cc00',
  limeBg:'rgba(234,255,85,0.08)',
  w:     '#ffffff',
  w80:   'rgba(255,255,255,0.80)',
  w60:   'rgba(255,255,255,0.60)',
  w40:   'rgba(255,255,255,0.40)',
  w20:   'rgba(255,255,255,0.20)',
  w10:   'rgba(255,255,255,0.10)',
  w06:   'rgba(255,255,255,0.06)',
  ink:   '#0a0d00',
  red:   '#ff4d4d',
  green: '#4caf81',
}

interface Profile {
  id: string
  email: string | null
  nome: string | null
  cognome: string | null
  eta: number | null
  peso_kg: number | null
  altezza_cm: number | null
  obiettivo: string | null
  livello_attivita: string | null
  onboarding_done: boolean
  is_admin: boolean
  created_at: string
}

function StatCard({ icon, label, value, sub, color = c.lime }: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div style={{
      background: c.bg3,
      border: `1px solid ${c.w10}`,
      borderRadius: 14,
      padding: '16px 18px',
      flex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: c.w40, fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 800, color: c.w, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: c.w40, marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function Badge({ text, color = c.lime }: { text: string; color?: string }) {
  return (
    <span style={{
      background: `${color}18`, color,
      fontFamily: "'Poppins', sans-serif",
      fontSize: 10, fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
      letterSpacing: '0.3px',
    }}>
      {text}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function UserRow({ p, onClick }: { p: Profile; onClick: () => void }) {
  const initials = [p.nome, p.cognome].filter(Boolean).map(s => s![0].toUpperCase()).join('') || p.email?.[0].toUpperCase() || '?'
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderBottom: `1px solid ${c.w06}`,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = c.w06)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: p.is_admin ? `${c.lime}22` : c.bg4,
        border: p.is_admin ? `1.5px solid ${c.lime}44` : `1px solid ${c.w10}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700,
        color: p.is_admin ? c.lime : c.w60, flexShrink: 0,
      }}>
        {initials}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {p.nome && p.cognome ? `${p.nome} ${p.cognome}` : p.email || 'Utente senza nome'}
          </span>
          {p.is_admin && <Badge text="ADMIN" color={c.lime} />}
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: c.w40, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {p.email}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        <Badge
          text={p.onboarding_done ? 'Attivo' : 'Onboarding'}
          color={p.onboarding_done ? c.green : c.w40}
        />
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, color: c.w40 }}>
          {formatDate(p.created_at)}
        </span>
      </div>

      <ChevronRight size={14} color={c.w20} />
    </div>
  )
}

function UserDetail({ p, onClose }: { p: Profile; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860,
          background: c.bg3,
          borderRadius: '16px 16px 0 0',
          padding: '24px 24px 40px',
          maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w }}>
            Dettaglio utente
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: c.w60, cursor: 'pointer', fontFamily: "'Poppins', sans-serif", fontSize: 14 }}>
            Chiudi
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Email', value: p.email || '—', icon: <Mail size={13} color={c.lime} /> },
            { label: 'Iscritto il', value: formatDate(p.created_at), icon: <Calendar size={13} color={c.lime} /> },
            { label: 'Obiettivo', value: p.obiettivo || '—', icon: <TrendingUp size={13} color={c.lime} /> },
            { label: 'Peso', value: p.peso_kg ? `${p.peso_kg} kg` : '—', icon: <Activity size={13} color={c.lime} /> },
            { label: 'Altezza', value: p.altezza_cm ? `${p.altezza_cm} cm` : '—', icon: <Activity size={13} color={c.lime} /> },
            { label: 'Età', value: p.eta ? `${p.eta} anni` : '—', icon: <Users size={13} color={c.lime} /> },
            { label: 'Livello attività', value: p.livello_attivita || '—', icon: <Dumbbell size={13} color={c.lime} /> },
            { label: 'Onboarding', value: p.onboarding_done ? 'Completato' : 'Non completato', icon: <Activity size={13} color={c.lime} /> },
            { label: 'Ruolo', value: p.is_admin ? 'Admin' : 'Utente', icon: <Shield size={13} color={c.lime} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ background: c.bg4, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {icon}
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, color: c.w40, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ADMIN_EMAILS = ['bozzellapellegrino@gmail.com']

export default function AdminScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')

  const isAdmin = !!(user && ADMIN_EMAILS.includes(user.email ?? ''))

  useEffect(() => {
    if (user && isAdmin) loadProfiles()
  }, [user, isAdmin])

  async function loadProfiles() {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (e) { setError(e.message); setLoading(false); return }
    setProfiles(data || [])
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    return (
      p.email?.toLowerCase().includes(q) ||
      p.nome?.toLowerCase().includes(q) ||
      p.cognome?.toLowerCase().includes(q)
    )
  })

  const totalUsers = profiles.length
  const activeUsers = profiles.filter(p => p.onboarding_done).length
  const todayUsers = profiles.filter(p => {
    const d = new Date(p.created_at)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length

  if (!isAdmin) {
    return (
      <div style={{
        height: '100%',
        background: c.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 24,
        fontFamily: "'Poppins', sans-serif",
      }}>
        <Shield size={40} color={c.red} />
        <div style={{ fontSize: 20, fontWeight: 700, color: c.w, textAlign: 'center' }}>Accesso negato</div>
        <div style={{ fontSize: 13, color: c.w60, textAlign: 'center' }}>Non hai i permessi per accedere al pannello admin.</div>
        <button
          onClick={() => navigate('/profilo')}
          style={{ background: c.lime, border: 'none', borderRadius: 50, padding: '10px 28px', fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: c.ink, cursor: 'pointer' }}
        >
          Torna al Profilo
        </button>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%',
      background: c.bg, fontFamily: "'Poppins', sans-serif",
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>

      {/* Top bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: `${c.bg}ee`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${c.w10}`,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/profilo')}
            style={{
              background: 'none', border: 'none', padding: '4px 8px 4px 0',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronLeft size={20} color={c.w60} />
          </button>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: c.limeBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={16} color={c.lime} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: c.w, lineHeight: 1 }}>
              forma<span style={{ color: c.lime }}>.ai</span> Admin
            </div>
            <div style={{ fontSize: 10, color: c.w40, marginTop: 1 }}>Super Panel</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={loadProfiles}
            style={{
              background: c.w06, border: `1px solid ${c.w10}`,
              borderRadius: 8, padding: '7px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', fontSize: 12, color: c.w60,
            }}
          >
            <RefreshCw size={13} />
            Aggiorna
          </button>
          <button
            onClick={handleSignOut}
            style={{
              background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)',
              borderRadius: 8, padding: '7px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', fontSize: 12, color: c.red,
            }}
          >
            <LogOut size={13} />
            Esci
          </button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <StatCard
            icon={<Users size={15} color={c.lime} />}
            label="Utenti totali"
            value={totalUsers}
            sub="dalla prima registrazione"
          />
          <StatCard
            icon={<Activity size={15} color={c.green} />}
            label="Attivi"
            value={activeUsers}
            sub="onboarding completato"
            color={c.green}
          />
          <StatCard
            icon={<TrendingUp size={15} color={c.limeD} />}
            label="Oggi"
            value={todayUsers}
            sub="nuovi iscritti"
            color={c.limeD}
          />
        </div>

        {/* Users table */}
        <div style={{
          background: c.bg3,
          border: `1px solid ${c.w10}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${c.w10}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.w }}>
              Utenti registrati
            </div>
            <input
              placeholder="Cerca per nome o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: c.bg4,
                border: `1px solid ${c.w10}`,
                borderRadius: 8, padding: '7px 12px',
                fontSize: 12, color: c.w,
                outline: 'none', width: 220,
              }}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: c.w40, fontSize: 13 }}>
              Caricamento utenti...
            </div>
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center', color: c.red, fontSize: 13 }}>
              Errore: {error}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: c.w40, fontSize: 13 }}>
              {search ? 'Nessun risultato' : 'Nessun utente trovato'}
            </div>
          ) : (
            filtered.map(p => (
              <UserRow key={p.id} p={p} onClick={() => setSelected(p)} />
            ))
          )}

          {/* Footer */}
          <div style={{
            padding: '10px 16px',
            borderTop: `1px solid ${c.w06}`,
            fontSize: 11, color: c.w40,
          }}>
            {filtered.length} utenti {search && `(filtrati da ${totalUsers})`}
          </div>
        </div>
      </div>

      {selected && <UserDetail p={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

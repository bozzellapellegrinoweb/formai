import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppState, addMeal } from '../lib/appStore'
import { MealIcon, Camera, Zap, Flame } from '../components/ui/AppIcons'
import { useAuth, getProfile } from '../lib/auth'
import { c } from '../design/themes'

const WORKOUT_COLORS: Record<string, string> = {
  push:         '#EAFF55',
  pull:         '#60a5fa',
  gambe:        '#fb923c',
  lower:        '#fb923c',
  upper:        '#a78bfa',
  full_body:    '#c084fc',
  cardio:       '#f472b6',
  riposo:       'rgba(255,255,255,0.25)',
  riposo_attivo:'#4ade80',
}

const WORKOUT_LABEL: Record<string, string> = {
  push:'Push', pull:'Pull', gambe:'Gambe', lower:'Lower', upper:'Upper',
  full_body:'Full body', cardio:'Cardio', riposo:'Riposo', riposo_attivo:'Recupero',
}

const GIORNO_NAMES = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
const MESE_NAMES  = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buongiorno'
  if (h < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}

// ── TriRing (Apple Fitness–style triple activity rings) ───────────────────────
function TriRing({ kcalPct, protPct, workPct, size = 140 }: {
  kcalPct: number; protPct: number; workPct: number; size?: number
}) {
  const stroke = 14
  const gap    = 4
  const rings  = [
    { r: size/2 - stroke/2,                   pct: kcalPct, color: c.limeInk, bg: c.limeBg },
    { r: size/2 - stroke/2 - stroke - gap,    pct: protPct, color: c.blue,  bg: 'rgba(122,167,227,0.10)' },
    { r: size/2 - stroke/2 - 2*(stroke+gap),  pct: workPct, color: c.terra, bg: 'rgba(196,113,74,0.10)' },
  ]
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      {rings.map((ring, i) => {
        const C            = 2 * Math.PI * ring.r
        const targetOffset = C * (1 - Math.min(1, Math.max(0, ring.pct)))
        return (
          <g key={i}>
            <circle cx={size/2} cy={size/2} r={ring.r}
              stroke={ring.bg} strokeWidth={stroke} fill="none" />
            <motion.circle
              cx={size/2} cy={size/2} r={ring.r}
              stroke={ring.color} strokeWidth={stroke} fill="none"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: targetOffset }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
              strokeLinecap="round"
            />
          </g>
        )
      })}
    </svg>
  )
}

// ── Meal log modal ────────────────────────────────────────────────────────────
type MealType = 'colazione' | 'pranzo' | 'spuntino' | 'cena'
interface MealResult { descrizione: string; kcal: number; macro: { p: number; c: number; g: number }; commento: string }
const MEAL_TYPES_LIST: { key: MealType; label: string; emoji: string }[] = [
  { key: 'colazione', label: 'Colazione', emoji: '☕' },
  { key: 'pranzo',   label: 'Pranzo',    emoji: '🍽️' },
  { key: 'spuntino', label: 'Spuntino',  emoji: '🍎' },
  { key: 'cena',     label: 'Cena',      emoji: '🌙' },
]
function guessMealType(): MealType {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'colazione'
  if (h >= 11 && h < 15) return 'pranzo'
  if (h >= 15 && h < 19) return 'spuntino'
  return 'cena'
}

function LogMealModal({ initialType, onClose }: { initialType: MealType; onClose: () => void }) {
  const { user } = useAuth()
  const [method, setMethod] = useState<'foto' | 'testo' | null>(null)
  const [text, setText] = useState('')
  const [_imageBase64, setImageBase64] = useState<string | null>(null)
  const [_mediaType, setMediaType] = useState('image/jpeg')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<MealResult | null>(null)
  const [mealType, setMealType] = useState<MealType>(initialType)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function analyzePhoto(base64: string, mime: string) {
    setAnalyzing(true); setError(null)
    try {
      const profile = user ? { obiettivo: 'dimagrimento' } : {}
      const res = await fetch('/api/analyze-meal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: mime, profile }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      if (!json.result) throw new Error('Risposta API non valida')
      setResult(json.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore analisi')
    } finally { setAnalyzing(false) }
  }

  async function analyzeText() {
    if (!text.trim()) return
    setAnalyzing(true); setError(null)
    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textDescription: text.trim(), profile: {} }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      if (!json.result) throw new Error('Risposta API non valida')
      setResult(json.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore analisi')
    } finally { setAnalyzing(false) }
  }

  function saveMeal() {
    if (!result) return
    addMeal({ tipo: mealType, nome: result.descrizione, kcal: result.kcal, macro: result.macro, completato: true, alimenti: [], ricetta: '' })
    setSaved(true)
    setTimeout(onClose, 800)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    e.target.value = ''
    setMediaType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = (ev.target?.result as string).split(',')[1]
      setImageBase64(b64)
      setMethod('foto')
      analyzePhoto(b64, file.type || 'image/jpeg')
    }
    reader.readAsDataURL(file)
  }

  if (saved) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 48 }}>✅</div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', bottom: 'var(--nav-h)', left: 0, right: 0,
          background: c.bg3, borderRadius: '24px 24px 0 0',
          padding: '20px 20px', maxHeight: '80vh', overflowY: 'auto', zIndex: 201,
        }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: c.w10, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 700, color: c.w }}>Logga pasto</span>
          <motion.div whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', background: c.w10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.w55} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </motion.div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {MEAL_TYPES_LIST.map((m) => (
            <motion.div key={m.key} whileTap={{ scale: 0.95 }} onClick={() => setMealType(m.key)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer', textAlign: 'center' as const,
                background: mealType === m.key ? c.lime : c.bg4,
                border: `1px solid ${mealType === m.key ? c.lime : c.w06}`,
              }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{m.emoji}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, fontWeight: 600, color: mealType === m.key ? c.ink : c.w55 }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {!method && !analyzing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <label htmlFor="log-meal-foto" style={{ flex: 1, display: 'block', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <div style={{ background: `linear-gradient(135deg, ${c.limeBg}, ${c.bg4})`, borderRadius: 14, padding: '20px 12px', textAlign: 'center' as const, border: `1px solid rgba(234,255,85,0.15)` }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>📷</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.w }}>Foto</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 2 }}>Scatta o scegli</div>
              </div>
            </label>
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => setMethod('testo')}
              style={{ flex: 1, background: c.bg4, borderRadius: 14, padding: '20px 12px', cursor: 'pointer', textAlign: 'center' as const, border: `1px solid ${c.w06}` }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>✏️</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.w }}>Descrivi</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 2 }}>Scrivi cosa hai mangiato</div>
            </motion.div>
          </div>
        )}

        {method === 'testo' && !result && (
          <div>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Es: pasta al pomodoro con parmigiano, 200g..."
              style={{
                width: '100%', minHeight: 96, background: c.bg4, border: `1px solid ${c.w10}`,
                borderRadius: 12, padding: '12px 14px', color: c.w, fontSize: 14,
                fontFamily: "'DM Mono', monospace", outline: 'none', resize: 'none' as const, boxSizing: 'border-box' as const,
              }} />
            <motion.div whileTap={{ scale: 0.97 }} onClick={analyzeText}
              style={{
                marginTop: 10, height: 46, borderRadius: 46,
                background: text.trim() ? c.lime : c.bg4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: text.trim() ? c.ink : c.w40 }}>Analizza →</span>
            </motion.div>
          </div>
        )}

        {analyzing && (
          <div style={{ textAlign: 'center' as const, padding: '32px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${c.w10}`, borderTopColor: c.lime, animation: 'spin 0.9s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w55 }}>Analizzo il pasto…</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: c.w40, letterSpacing: '0.14em', marginTop: 4, textTransform: 'uppercase' as const }}>VISION + CLAUDE</div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 10 }}>
            <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#ff6b6b' }}>{error}</div>
            </div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => { setError(null); setMethod(null) }}
              style={{ height: 40, borderRadius: 40, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>← Riprova</span>
            </motion.div>
          </div>
        )}

        {result && (
          <div>
            <div style={{ background: c.limeBg, border: '1px solid rgba(234,255,85,0.20)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: c.limeD, marginBottom: 6 }}>RICONOSCIUTO</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.w, marginBottom: 12 }}>{result.descrizione}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: result.commento ? 12 : 0 }}>
                {([['kcal', result.kcal, c.w], ['P', result.macro.p + 'g', c.lime], ['C', result.macro.c + 'g', c.blue], ['G', result.macro.g + 'g', c.terra]] as [string, string|number, string][]).map(([label, val, col]) => (
                  <div key={String(label)} style={{ flex: 1, background: c.w03, borderRadius: 8, padding: '8px 6px', textAlign: 'center' as const }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: col }}>{val}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: c.w40, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              {result.commento && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w55, lineHeight: 1.5 }}>💬 {result.commento}</div>}
            </div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={saveMeal}
              style={{ height: 48, borderRadius: 48, background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink }}>
                ✓ Salva come {MEAL_TYPES_LIST.find(m => m.key === mealType)?.label}
              </span>
            </motion.div>
          </div>
        )}

        <input id="log-meal-foto" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const WORKOUT_BG: Record<string, string> = {
  push:          `linear-gradient(145deg, rgba(234,255,85,0.14) 0%, var(--bg-card) 100%)`,
  pull:          `linear-gradient(145deg, rgba(122,167,227,0.16) 0%, var(--bg-card) 100%)`,
  gambe:         `linear-gradient(145deg, rgba(245,166,35,0.15) 0%, var(--bg-card) 100%)`,
  lower:         `linear-gradient(145deg, rgba(245,166,35,0.15) 0%, var(--bg-card) 100%)`,
  upper:         `linear-gradient(145deg, rgba(167,139,250,0.15) 0%, var(--bg-card) 100%)`,
  full_body:     `linear-gradient(145deg, rgba(196,181,253,0.13) 0%, var(--bg-card) 100%)`,
  cardio:        `linear-gradient(145deg, rgba(244,114,182,0.15) 0%, var(--bg-card) 100%)`,
  riposo:        `var(--bg-card2)`,
  riposo_attivo: `linear-gradient(145deg, rgba(110,231,183,0.13) 0%, var(--bg-card) 100%)`,
}

function computeTargetKcal(peso: number, altezza: number, eta: number, obiettivo: string): number {
  const bmr  = 10 * peso + 6.25 * altezza - 5 * eta + 80
  const tdee = Math.round(bmr * 1.55)
  if (obiettivo === 'dimagrimento') return tdee - 500
  if (obiettivo === 'massa') return tdee + 300
  return tdee
}

type Profile = {
  id: string
  email?: string
  nome?: string
  peso_kg?: number
  altezza_cm?: number
  eta?: number
  obiettivo?: string
  onboarding_done?: boolean
  streak_days?: number
}

// ── Shared style helpers ──────────────────────────────────────────────────────
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace", letterSpacing: '-0.01em' }
const kicker: React.CSSProperties = { fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.w40, fontWeight: 500 }

export default function HomeScreen() {
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const { piano, todayIndex } = useAppState()
  const [selectedDay, setSelectedDay]   = useState(todayIndex)
  const [logOpen, setLogOpen]           = useState(false)
  const [logInitialType, setLogInitialType] = useState<MealType>(guessMealType())

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then((data) => {
      if (!data?.onboarding_done) { navigate('/onboarding', { replace: true }); return }
      setProfile(data)
    })
  }, [user, navigate])

  const giorno   = piano[selectedDay]
  const isToday  = selectedDay === todayIndex

  const pastiCompletati = isToday ? giorno.pasti.filter(p => p.completato) : []
  const consumedKcal    = pastiCompletati.reduce((s, p) => s + p.kcal, 0)
  const consumedMacros  = {
    p: pastiCompletati.reduce((s, p) => s + p.macro.p, 0),
    c: pastiCompletati.reduce((s, p) => s + p.macro.c, 0),
    g: pastiCompletati.reduce((s, p) => s + p.macro.g, 0),
  }

  const displayName = profile?.nome
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Utente'
  const initials = displayName.slice(0, 2).toUpperCase()

  const targetKcal = (giorno.kcal_totali > 0)
    ? giorno.kcal_totali
    : (profile?.peso_kg && profile?.altezza_cm && profile?.eta && profile?.obiettivo)
      ? computeTargetKcal(profile.peso_kg, profile.altezza_cm, profile.eta, profile.obiettivo)
      : 2000

  const kcalPct = Math.min(1, targetKcal > 0 ? consumedKcal / targetKcal : 0)
  const protPct = Math.min(1, giorno.macro.proteine > 0 ? consumedMacros.p / giorno.macro.proteine : 0)
  // workout ring: 0 until workout tracking is implemented
  const workPct = 0

  // Workout stats
  const setTot   = giorno.esercizi?.reduce((s, e) => s + ((e as { serie?: number }).serie ?? 0), 0) ?? 0
  const rirVals  = (giorno.esercizi ?? []).map(e => (e as { rir?: number }).rir).filter((v): v is number => v != null)
  const rirText  = rirVals.length
    ? (Math.min(...rirVals) === Math.max(...rirVals) ? String(Math.min(...rirVals)) : `${Math.min(...rirVals)}-${Math.max(...rirVals)}`)
    : '—'

  const isRestDay  = giorno.tipo_allenamento === 'riposo' || giorno.tipo_allenamento === 'riposo_attivo'
  const workoutDotColor = WORKOUT_COLORS[giorno.tipo_allenamento] || c.w25

  const now = new Date()
  const dateKicker = `${GIORNO_NAMES[now.getDay()]} · ${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getFullYear()).slice(2)}`
  const monthLabel = `${MESE_NAMES[now.getMonth()]} ${now.getFullYear()}`

  const streakDays = profile?.streak_days ?? 0

  return (
    <div style={{
      background: `radial-gradient(ellipse 120% 40% at 50% 0%, rgba(234,255,85,0.12) 0%, transparent 60%), ${c.bg}`,
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    }}>
      <div style={{
        position: 'absolute',
        top: 'env(safe-area-inset-top)',
        left: 0, right: 0, bottom: 0,
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'var(--nav-h)',
      }}>

        {/* ── Header ── */}
        <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...kicker, fontSize: 10, marginBottom: 4 }}>{dateKicker}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: c.w, lineHeight: 1.1 }}>
              {greeting()},&nbsp;<span style={{ color: c.limeInk }}>{displayName}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Streak chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 999,
              background: c.limeBg, border: `1px solid ${c.limeBg}`,
            }}>
              <Flame size={12} color={c.limeInk} strokeWidth={1.6} />
              <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: c.limeInk }}>{streakDays}</span>
            </div>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: c.lime, color: c.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700,
              flexShrink: 0,
            }}>{initials}</div>
          </div>
        </div>

        {/* ── Week strip ── */}
        <div style={{ padding: '0 18px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w55 }}>{monthLabel}</span>
            <motion.span whileTap={{ scale: 0.95 }} onClick={() => navigate('/piano')}
              style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.limeInk, cursor: 'pointer' }}>
              Programma →
            </motion.span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {piano.map((g, i) => {
              const isSel = i === selectedDay
              const isT   = i === todayIndex
              const dot   = WORKOUT_COLORS[g.tipo_allenamento] || c.w25
              return (
                <motion.div
                  key={g.sigla + g.data}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4, padding: '9px 2px', borderRadius: 12, cursor: 'pointer',
                    background: isSel ? c.lime : isT ? c.limeBg : c.bg2,
                    border: `1px solid ${isSel ? c.lime : isT ? c.limeBg : c.bgLine}`,
                  }}>
                  <div style={{ ...mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
                    color: isSel ? 'rgba(10,13,0,0.5)' : c.w40 }}>{g.sigla}</div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 800,
                    color: isSel ? c.ink : isT ? c.limeInk : c.w70 }}>{g.data}</div>
                  <div style={{ width: 5, height: 5, borderRadius: '50%',
                    background: isSel ? 'rgba(10,13,0,0.5)' : dot,
                    opacity: g.tipo_allenamento === 'riposo' ? 0.5 : 1,
                  }}/>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── TriRing hero card ── */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ background: c.bg2, border: `1px solid ${c.bgLine}`, borderRadius: 18, padding: 18, display: 'flex', gap: 16, alignItems: 'center' }}>
            <TriRing kcalPct={kcalPct} protPct={protPct} workPct={workPct} size={140} />
            <div style={{ flex: 1 }}>
              {[
                { l: 'kcal',     v: consumedKcal,      g: targetKcal,               color: c.limeInk, suf: '' },
                { l: 'proteine', v: consumedMacros.p,  g: giorno.macro.proteine,    color: c.blue,  suf: 'g' },
                { l: 'workout',  v: 0,                 g: giorno.durata_min || 0,   color: c.terra, suf: '', rawGoal: 'min' },
              ].map((row) => (
                <div key={row.l} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
                    <span style={{ ...kicker }}>{row.l}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: '-0.04em', color: row.color }}>{row.v}{row.suf}</span>
                    <span style={{ ...mono, fontSize: 10, color: c.w40 }}>/ {row.g}{row.rawGoal ?? row.suf}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Workout tile ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay + '-workout'}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            style={{ padding: '0 18px', marginBottom: 12 }}>
            <motion.div
              whileTap={{ scale: 0.98 }} onClick={() => !isRestDay && navigate('/workout')}
              style={{
                background: WORKOUT_BG[giorno.tipo_allenamento] || WORKOUT_BG.riposo,
                border: `1px solid ${c.bgLine}`, borderRadius: 18,
                padding: 16, position: 'relative', overflow: 'hidden',
                cursor: isRestDay ? 'default' : 'pointer',
              }}>
              {/* subtle lime shimmer */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: '100%', background: `linear-gradient(90deg, transparent, rgba(234,255,85,0.04))`, pointerEvents: 'none' }}/>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ ...kicker, color: c.limeInk }}>
                      {isToday ? 'OGGI' : piano[selectedDay]?.giorno?.toUpperCase?.() ?? 'GIORNO'}
                    </span>
                    {!isRestDay && (
                      <>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: workoutDotColor }} />
                        <span style={{ ...kicker, color: c.w55 }}>
                          {WORKOUT_LABEL[giorno.tipo_allenamento] || giorno.tipo_allenamento}
                        </span>
                      </>
                    )}
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 700, color: c.w, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                    {isRestDay
                      ? (giorno.tipo_allenamento === 'riposo_attivo' ? 'Recupero attivo' : 'Giornata di riposo')
                      : (giorno.sessione_label || `Allenamento ${giorno.tipo_allenamento}`)}
                  </div>
                </div>
                {!isRestDay && (
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Zap size={20} color={c.ink} strokeWidth={2.5} fill={c.ink} />
                  </div>
                )}
              </div>

              {!isRestDay && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {[
                    { l: 'min',      v: String(giorno.durata_min || '—') },
                    { l: 'esercizi', v: String(giorno.esercizi?.length ?? 0).padStart(2, '0') },
                    { l: 'set tot',  v: String(setTot).padStart(2, '0') },
                    { l: 'RIR',      v: rirText },
                  ].map(s => (
                    <div key={s.l} style={{ flex: 1, padding: '8px 6px', background: c.w03, borderRadius: 8, border: `1px solid ${c.bgLine}` }}>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: '-0.04em', color: c.w }}>{s.v}</div>
                      <div style={{ ...kicker, fontSize: 8, marginTop: 2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {isRestDay && giorno.note_sessione && (
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w55, lineHeight: 1.5, marginTop: 8 }}>
                  {giorno.note_sessione}
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* ── Macros 3-card row ── */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { l: 'Proteine', cur: consumedMacros.p, goal: giorno.macro.proteine,  color: c.limeInk },
              { l: 'Carb',     cur: consumedMacros.c, goal: giorno.macro.carboidrati, color: c.blue  },
              { l: 'Grassi',   cur: consumedMacros.g, goal: giorno.macro.grassi,    color: c.terra },
            ].map(m => (
              <div key={m.l} style={{ background: c.bg2, border: `1px solid ${c.bgLine}`, borderRadius: 14, padding: '12px 10px' }}>
                <div style={{ ...kicker, fontSize: 9 }}>{m.l}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 6 }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '-0.04em', color: m.color }}>{m.cur}</span>
                  <span style={{ ...mono, fontSize: 9, color: c.w40 }}>/{m.goal}g</span>
                </div>
                <div style={{ height: 3, background: c.w10, borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, m.goal > 0 ? (m.cur / m.goal) * 100 : 0)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', borderRadius: 2, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div style={{ padding: '0 18px', marginBottom: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {/* NUTRI */}
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate('/chat')}
              style={{
                background: `linear-gradient(160deg, ${c.limeBg}, ${c.bg2})`,
                border: `1px solid rgba(234,255,85,0.12)`, borderRadius: 14,
                padding: 14, cursor: 'pointer',
              }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink }}>N</div>
              <div style={{ ...kicker, color: c.limeInk, marginBottom: 4 }}>NUTRI</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w, lineHeight: 1.2 }}>Chiedi al coach AI</div>
            </motion.div>
            {/* LOG */}
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => { setLogInitialType(guessMealType()); setLogOpen(true) }}
              style={{ background: c.bg2, border: `1px solid ${c.bgLine}`, borderRadius: 14, padding: 14, cursor: 'pointer' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Camera size={18} color={c.limeInk} strokeWidth={1.6} />
              </div>
              <div style={{ ...kicker, marginBottom: 4 }}>LOG</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>Scatta un pasto</div>
            </motion.div>
          </div>
        </div>

        {/* ── Meals list ── */}
        <div style={{ padding: '0 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w }}>I tuoi pasti</span>
            <span style={{ ...mono, fontSize: 11, color: c.w40 }}>
              {giorno.pasti.filter(p => p.completato).length} / {giorno.pasti.length} completati
            </span>
          </div>
          <div style={{ background: c.bg2, border: `1px solid ${c.bgLine}`, borderRadius: 18, padding: 6 }}>
            {giorno.pasti.map((pasto, i) => (
              <motion.div
                key={pasto.tipo + selectedDay}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { if (isToday) { setLogInitialType(pasto.tipo as MealType); setLogOpen(true) } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px',
                  borderTop: i > 0 ? `1px solid ${c.bgLine}` : 'none',
                  background: pasto.completato ? 'rgba(234,255,85,0.04)' : 'transparent',
                  borderRadius: pasto.completato ? 12 : 0,
                  cursor: isToday ? 'pointer' : 'default',
                }}>
                {/* Icon */}
                <div style={{ width: 32, height: 32, borderRadius: 8, background: pasto.completato ? c.limeBg : c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MealIcon type={pasto.tipo} size={16} color={pasto.completato ? c.lime : c.w40} />
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
                    <span style={{ ...kicker, fontSize: 9, textTransform: 'capitalize' as const }}>{pasto.tipo}</span>
                    {pasto.completato && <span style={{ width: 3, height: 3, borderRadius: '50%', background: c.lime }}/>}
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pasto.nome}</div>
                  <div style={{ ...mono, fontSize: 10, color: c.w40, marginTop: 1 }}>
                    {pasto.kcal} kcal · P{pasto.macro.p}g · C{pasto.macro.c}g · G{pasto.macro.g}g
                  </div>
                </div>
                {/* Done circle */}
                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pasto.completato ? c.lime : 'transparent', border: pasto.completato ? 'none' : `1px solid ${c.w25}` }}>
                  {pasto.completato && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.ink} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
              </motion.div>
            ))}
          </div>
          {/* Footer */}
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate('/piano')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 10, cursor: 'pointer' }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>Vedi piano completo</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </motion.div>
        </div>

      </div>

      {/* Meal log modal */}
      <AnimatePresence>
        {logOpen && <LogMealModal initialType={logInitialType} onClose={() => setLogOpen(false)} />}
      </AnimatePresence>

    </div>
  )
}

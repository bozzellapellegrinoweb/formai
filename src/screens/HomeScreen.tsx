import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppState, addMeal } from '../lib/appStore'
import { MealIcon, Camera, Bot, Dumbbell, ChevronRight, Zap } from '../components/ui/AppIcons'
import { useAuth, getProfile } from '../lib/auth'

const c = {
  bg:     '#0e1008',
  bg2:    '#151809',
  bg3:    '#1c1f0d',
  bg4:    '#252912',
  lime:   '#EAFF55',
  limeD:  '#b8cc00',
  limeBg: 'rgba(234,255,85,0.1)',
  limeBg2:'rgba(234,255,85,0.06)',
  terra:  '#C4714A',
  gold:   '#C9A84C',
  w:      '#ffffff',
  w80:    'rgba(255,255,255,0.80)',
  w60:    'rgba(255,255,255,0.60)',
  w40:    'rgba(255,255,255,0.40)',
  w20:    'rgba(255,255,255,0.20)',
  w10:    'rgba(255,255,255,0.10)',
  w06:    'rgba(255,255,255,0.06)',
  ink:    '#0a0d00',
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
  const fileRef = useRef<HTMLInputElement>(null)

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
      setResult(json)
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
      setResult(json)
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
    setMediaType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const b64 = (ev.target?.result as string).split(',')[1]
      setImageBase64(b64)
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
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} />
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{
          position: 'absolute', bottom: 'var(--nav-h)', left: 0, right: 0,
          background: c.bg3, borderRadius: '20px 20px 0 0',
          padding: '20px 20px', maxHeight: '80vh', overflowY: 'auto',
          zIndex: 201,
        }}>
        {/* Handle + header */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: c.w10, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 700, color: c.w }}>
            Logga pasto
          </span>
          <motion.div whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: '50%', background: c.w10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.w60} strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </motion.div>
        </div>

        {/* Meal type selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {MEAL_TYPES_LIST.map((m) => (
            <motion.div key={m.key} whileTap={{ scale: 0.95 }} onClick={() => setMealType(m.key)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer', textAlign: 'center' as const,
                background: mealType === m.key ? c.lime : c.bg4,
                border: `1px solid ${mealType === m.key ? c.lime : c.w06}`,
              }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{m.emoji}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, fontWeight: 600, color: mealType === m.key ? c.ink : c.w60 }}>{m.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Method selection */}
        {!method && !analyzing && (
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => { setMethod('foto'); fileRef.current?.click() }}
              style={{ flex: 1, background: c.bg4, borderRadius: 14, padding: '16px 12px', cursor: 'pointer', textAlign: 'center' as const, border: `1px solid ${c.w06}` }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📷</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>Foto</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>Scatta o scegli</div>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={() => setMethod('testo')}
              style={{ flex: 1, background: c.bg4, borderRadius: 14, padding: '16px 12px', cursor: 'pointer', textAlign: 'center' as const, border: `1px solid ${c.w06}` }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>✏️</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>Descrivi</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>Scrivi cosa hai mangiato</div>
            </motion.div>
          </div>
        )}

        {/* Text method */}
        {method === 'testo' && !result && (
          <div>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder="Es: pasta al pomodoro con parmigiano, 200g..."
              style={{
                width: '100%', minHeight: 90, background: c.bg4, border: `1px solid ${c.w10}`,
                borderRadius: 12, padding: '12px 14px', color: c.w, fontSize: 15,
                fontFamily: "'Poppins', sans-serif", outline: 'none', resize: 'none' as const,
                boxSizing: 'border-box' as const,
              }} />
            <motion.div whileTap={{ scale: 0.97 }} onClick={analyzeText}
              style={{
                marginTop: 10, height: 46, borderRadius: 46, background: text.trim() ? c.lime : c.bg4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: text.trim() ? c.ink : c.w40 }}>
                Analizza →
              </span>
            </motion.div>
          </div>
        )}

        {/* Loading */}
        {analyzing && (
          <div style={{ textAlign: 'center' as const, padding: '24px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, color: c.w60 }}>Analizzo il pasto...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 10, padding: '12px 14px', marginTop: 10 }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: '#ff6b6b' }}>{error}</div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            <div style={{ background: 'rgba(234,255,85,0.06)', border: '1px solid rgba(234,255,85,0.2)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.lime, marginBottom: 8 }}>{result.descrizione}</div>
              <div style={{ display: 'flex', gap: 20, marginBottom: result.commento ? 10 : 0 }}>
                {[['kcal', result.kcal], ['P', result.macro.p + 'g'], ['C', result.macro.c + 'g'], ['G', result.macro.g + 'g']].map(([label, val]) => (
                  <div key={String(label)} style={{ textAlign: 'center' as const }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: c.w }}>{val}</div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: c.w40 }}>{label}</div>
                  </div>
                ))}
              </div>
              {result.commento && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60, lineHeight: 1.5 }}>💬 {result.commento}</div>}
            </div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={saveMeal}
              style={{ height: 48, borderRadius: 48, background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink }}>
                ✓ Salva come {MEAL_TYPES_LIST.find(m => m.key === mealType)?.label}
              </span>
            </motion.div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </motion.div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

function KcalRing({ consumed, total, size = 60 }: { consumed: number; total: number; size?: number }) {
  const r = size / 2 - 5
  const circ = 2 * Math.PI * r
  const pct = Math.min(consumed / total, 1)
  const offset = circ * (1 - pct)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c.lime} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: c.w, lineHeight: 1 }}>{consumed}</span>
        <span style={{ fontSize: 14, color: c.w40, fontFamily: "'DM Mono', monospace", marginTop: 1 }}>kcal</span>
      </div>
    </div>
  )
}

const WORKOUT_BG: Record<string, string> = {
  push:         'linear-gradient(145deg, #2e4a08 0%, #1a2d04 40%, #0a1500 80%, #060e00 100%)',
  pull:         'linear-gradient(145deg, #08304a 0%, #041a2d 40%, #000a15 80%, #000610 100%)',
  gambe:        'linear-gradient(145deg, #4a2e08 0%, #2d1a04 40%, #150a00 80%, #0e0600 100%)',
  lower:        'linear-gradient(145deg, #4a2e08 0%, #2d1a04 40%, #150a00 80%, #0e0600 100%)',
  upper:        'linear-gradient(145deg, #1a0e30 0%, #0d071e 40%, #060010 80%, #030008 100%)',
  full_body:    'linear-gradient(145deg, #1a0830 0%, #0d0420 40%, #060012 80%, #030008 100%)',
  cardio:       'linear-gradient(145deg, #3a0a2e 0%, #200617 40%, #0f0010 80%, #070008 100%)',
  riposo:       'linear-gradient(145deg, #1c1f0d 0%, #151809 40%, #0e1008 80%, #0a0d00 100%)',
  riposo_attivo:'linear-gradient(145deg, #1c1f0d 0%, #151809 40%, #0e1008 80%, #0a0d00 100%)',
}

function computeTargetKcal(peso: number, altezza: number, eta: number, obiettivo: string): number {
  const bmr = 10 * peso + 6.25 * altezza - 5 * eta + 80
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
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const { piano, todayIndex } = useAppState()
  const [selectedDay, setSelectedDay] = useState(todayIndex)
  const [logOpen, setLogOpen] = useState(false)
  const [logInitialType, setLogInitialType] = useState<MealType>(guessMealType())

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then((data) => {
      if (!data?.onboarding_done) {
        navigate('/onboarding', { replace: true })
        return
      }
      setProfile(data)
    })
  }, [user, navigate])

  const giorno = piano[selectedDay]
  const isToday = selectedDay === todayIndex
  const pastiVisibili = giorno.pasti

  // Calorie e macro EFFETTIVAMENTE consumate (solo pasti con completato:true)
  const pastiCompletati = isToday ? giorno.pasti.filter(p => p.completato) : []
  const consumedKcal = pastiCompletati.reduce((s, p) => s + p.kcal, 0)
  const consumedMacros = {
    p: pastiCompletati.reduce((s, p) => s + p.macro.p, 0),
    c: pastiCompletati.reduce((s, p) => s + p.macro.c, 0),
    g: pastiCompletati.reduce((s, p) => s + p.macro.g, 0),
  }

  const displayName = profile?.nome
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Utente'

  const initials = displayName.slice(0, 2).toUpperCase()

  // Prefer AI plan kcal (giorno.kcal_totali) over the generic formula, fall back to formula if plan not ready
  const targetKcal = (giorno.kcal_totali > 0)
    ? giorno.kcal_totali
    : (profile?.peso_kg && profile?.altezza_cm && profile?.eta && profile?.obiettivo)
      ? computeTargetKcal(profile.peso_kg, profile.altezza_cm, profile.eta, profile.obiettivo)
      : 2000

  return (
    <div style={{
      background: `radial-gradient(ellipse 120% 40% at 50% 0%, rgba(234,255,85,0.18) 0%, transparent 65%), radial-gradient(ellipse 80% 35% at 90% 100%, rgba(234,255,85,0.08) 0%, transparent 55%), ${c.bg}`,
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

        {/* Header */}
        <div style={{ padding: '10px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: c.lime,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 800, color: c.ink,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>{displayName}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px', color: c.w }}>
                Il tuo <span style={{ color: c.lime }}>piano</span>
              </div>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.92 }} onClick={() => navigate('/piano')} style={{
            width: 30, height: 30, borderRadius: '50%',
            border: `1.5px solid ${c.w20}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.w60} strokeWidth="2.2" strokeLinecap="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
            </svg>
          </motion.div>
        </div>

        {/* Calendario */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>Maggio 2026</span>
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => navigate('/piano')} style={{ cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD }}>Vedi programma →</span>
            </motion.div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {piano.map((g, i) => {
              const isSelected = i === selectedDay
              const isT = i === todayIndex
              return (
                <motion.div
                  key={g.sigla + g.data}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedDay(i)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 5, padding: '8px 2px', borderRadius: 14,
                    background: isSelected ? c.lime : isT ? c.limeBg : 'transparent',
                    border: isT && !isSelected ? `1px solid rgba(234,255,85,0.2)` : '1px solid transparent',
                    cursor: 'pointer',
                  }}>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500,
                    textTransform: 'uppercase' as const,
                    color: isSelected ? 'rgba(10,13,0,0.5)' : c.w40,
                  }}>{g.sigla}</div>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 800,
                    color: isSelected ? c.ink : isT ? c.lime : c.w60,
                  }}>{g.data}</div>
                  {/* workout type dot */}
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: g.tipo_allenamento === 'riposo'
                      ? (isSelected ? 'rgba(10,13,0,0.3)' : c.w20)
                      : (isSelected ? 'rgba(10,13,0,0.6)' : c.lime),
                  }}/>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Workout banner (compact) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay + '-workout'}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/workout')}
            style={{
              margin: '0 20px 10px',
              borderRadius: 18, overflow: 'hidden', height: 90, cursor: 'pointer', position: 'relative',
              background: WORKOUT_BG[giorno.tipo_allenamento] || WORKOUT_BG.misto,
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-55deg, transparent, transparent 18px, rgba(234,255,85,0.025) 18px, rgba(234,255,85,0.025) 19px)' }}/>
            <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.06 }}>
              <Dumbbell size={80} color={c.lime} strokeWidth={0.8} />
            </div>
            <div style={{ position: 'relative', padding: '12px 16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600,
                    color: giorno.tipo_allenamento === 'riposo' ? c.w40 : c.lime,
                    background: giorno.tipo_allenamento === 'riposo' ? 'rgba(255,255,255,0.06)' : 'rgba(234,255,85,0.15)',
                    borderRadius: 20, padding: '2px 8px',
                    textTransform: 'capitalize' as const,
                  }}>
                    {giorno.tipo_allenamento === 'riposo' ? 'Riposo' : '🏋️ ' + giorno.tipo_allenamento}
                  </span>
                  {isToday && (
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD }}>oggi</span>
                  )}
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, color: c.w, lineHeight: 1.15 }}>
                  {giorno.tipo_allenamento === 'riposo'
                    ? 'Giornata di riposo'
                    : `Allenamento ${giorno.tipo_allenamento}`
                  }
                </div>
                {giorno.tipo_allenamento !== 'riposo' && (
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60, marginTop: 2 }}>
                    {giorno.note?.split('.')[0] || ''}
                  </div>
                )}
              </div>
              {giorno.tipo_allenamento !== 'riposo' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={16} color={c.ink} strokeWidth={2.5} fill={c.ink} />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Calorie + NUTRI row */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 10 }}>
          {/* Calorie compact */}
          <div style={{
            flex: 1, borderRadius: 16, overflow: 'hidden',
            background: 'linear-gradient(145deg, #1e3a08 0%, #0f1e04 100%)',
            padding: '12px 14px', position: 'relative',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,255,85,0.12) 0%, transparent 70%)' }}/>
            <KcalRing consumed={consumedKcal} total={targetKcal} />
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40, marginBottom: 3 }}>Calorie consumate</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: c.lime, fontWeight: 700 }}>
                {consumedKcal} / {targetKcal}
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
                P {consumedMacros.p}g · C {consumedMacros.c}g · G {consumedMacros.g}g
              </div>
            </div>
          </div>
          {/* NUTRI */}
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate('/chat')}
            style={{
              width: 100, borderRadius: 16,
              background: 'linear-gradient(145deg, #1a2a06 0%, #0e1803 100%)',
              padding: '12px 14px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Bot size={13} color={c.lime} strokeWidth={1.8} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.lime }}>NUTRI</span>
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w, lineHeight: 1.3 }}>
              Chiedi al coach AI
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={12} color={c.ink} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Macro progress ── */}
        <div style={{ margin: '0 20px 12px', background: c.bg3, borderRadius: 18, border: `1px solid ${c.w06}`, padding: '14px 16px' }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: c.w40, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Macro del giorno
          </div>
          {[
            { label: 'Proteine', val: consumedMacros.p, tot: giorno.macro.proteine, color: c.lime },
            { label: 'Carboidrati', val: consumedMacros.c, tot: giorno.macro.carboidrati, color: '#55AAFF' },
            { label: 'Grassi', val: consumedMacros.g, tot: giorno.macro.grassi, color: '#FF8C55' },
          ].map(({ label, val, tot, color }) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60 }}>{label}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: c.w60 }}>{val}g / {tot}g</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: c.w10 }}>
                <div style={{
                  height: 5, borderRadius: 3,
                  background: color,
                  width: `${Math.min(100, tot > 0 ? (val / tot) * 100 : 0)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Sezione pasti ── */}
        <div style={{ margin: '0 20px', background: c.bg3, borderRadius: 18, border: `1px solid ${c.w06}`, overflow: 'hidden', marginBottom: 12 }}>
          {/* Header pasti */}
          <div style={{ padding: '12px 16px 8px', borderBottom: `1px solid ${c.w06}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.w }}>
              I tuoi pasti
            </span>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>
              {pastiVisibili.filter(p => p.completato).length}/{pastiVisibili.length} completati
            </span>
          </div>
          {/* Pasti — flat list (tutti i pasti del giorno) */}
          <div style={{ padding: '8px 0 4px' }}>
            {pastiVisibili.map((pasto, i) => (
              <motion.div
                key={pasto.tipo + selectedDay}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: i * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { if (isToday) { setLogInitialType(pasto.tipo as MealType); setLogOpen(true) } }}
                style={{
                  margin: '0 8px 8px',
                  background: pasto.completato
                    ? 'linear-gradient(135deg, rgba(50,80,10,0.7) 0%, rgba(30,50,6,0.7) 100%)'
                    : c.bg4,
                  borderRadius: 14,
                  border: `1px solid ${pasto.completato ? 'rgba(234,255,85,0.2)' : c.w06}`,
                  display: 'flex', alignItems: 'center', overflow: 'hidden',
                  cursor: isToday ? 'pointer' : 'default',
                }}
              >
                <div style={{
                  width: 58, height: 58,
                  background: pasto.completato ? 'rgba(234,255,85,0.08)' : 'rgba(255,255,255,0.025)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <MealIcon type={pasto.tipo} size={22} color={pasto.completato ? c.lime : c.w40} />
                </div>
                <div style={{ flex: 1, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' as const, letterSpacing: '0.3px' }}>{pasto.tipo}</span>
                    {pasto.completato && <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.lime }}/>}
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: c.w, marginBottom: 2 }}>{pasto.nome}</div>
                  <div style={{ fontSize: 13, color: c.w40, fontFamily: "'DM Mono', monospace" }}>
                    {pasto.completato ? `${pasto.kcal} kcal · P ${pasto.macro.p}g` : `Obiettivo: ${pasto.kcal} kcal`}
                  </div>
                </div>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: pasto.completato ? c.lime : c.bg3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 12, flexShrink: 0,
                }}>
                  {pasto.completato ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.ink} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  ) : (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer link */}
          <motion.div
            whileTap={{ scale: 0.97 }} onClick={() => navigate('/piano')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '8px 16px 12px', cursor: 'pointer', borderTop: `1px solid ${c.w06}`,
            }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>
              Vedi piano completo
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => { setLogInitialType(guessMealType()); setLogOpen(true) }}
            style={{
              flex: 1, padding: '13px 14px', borderRadius: 16,
              background: c.bg3, border: `1px solid ${c.w06}`,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: c.limeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Camera size={16} color={c.lime} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>Log pasto</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>Foto o testo</div>
            </div>
          </motion.div>
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate('/chat')}
            style={{
              flex: 1, padding: '13px 14px', borderRadius: 16,
              background: c.bg3, border: `1px solid ${c.w06}`,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: c.limeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} color={c.lime} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>Chiedi a NUTRI</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>Coach AI</div>
            </div>
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

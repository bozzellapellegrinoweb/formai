import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Flame, Sparkles, MessageSquare, Pencil } from '../components/ui/AppIcons'
import { signOut, useAuth, getProfile } from '../lib/auth'

const c = {
  bg:     '#0e1008',
  bg3:    '#1c1f0d',
  bg4:    '#252912',
  lime:   '#EAFF55',
  limeD:  '#b8cc00',
  limeBg: 'rgba(234,255,85,0.1)',
  limeBg2:'rgba(234,255,85,0.06)',
  gold:   '#C9A84C',
  goldBg: 'rgba(201,168,76,0.12)',
  w:      '#ffffff',
  w60:    'rgba(255,255,255,0.60)',
  w40:    'rgba(255,255,255,0.40)',
  w20:    'rgba(255,255,255,0.20)',
  w10:    'rgba(255,255,255,0.10)',
  w06:    'rgba(255,255,255,0.06)',
  ink:    '#0a0d00',
  red:    '#ff6b6b',
}

type WeightEntry = { val: number; date: string }
type MisureData = { vita: number; petto: number; bicipite: number; coscia: number; fianchi: number }
type MisureEntry = { date: string; data: MisureData }


const EMPTY_MISURE: MisureData = { vita: 0, petto: 0, bicipite: 0, coscia: 0, fianchi: 0 }

const chartW = 280
const chartH = 52

function WeightChart({ data }: { data: WeightEntry[] }) {
  const vals = data.map(d => d.val)
  const minW = Math.min(...vals)
  const maxW = Math.max(...vals)
  const range = maxW - minW || 1
  const visible = data.slice(-7)

  const pts = visible.map((d, i) => {
    const x = (i / Math.max(visible.length - 1, 1)) * chartW
    const y = chartH - ((d.val - minW) / range) * (chartH - 12) - 6
    return { x, y }
  })

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const last = pts[pts.length - 1]

  return (
    <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
      <polyline
        points={polyline}
        fill="none" stroke={c.lime} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      {last && <>
        <circle cx={last.x} cy={last.y} r="4" fill={c.lime}/>
        <circle cx={last.x} cy={last.y} r="7" fill={c.lime} opacity="0.2"/>
      </>}
    </svg>
  )
}

function StatBox({ label, val, unit }: { label: string; val: string; unit: string }) {
  return (
    <div style={{
      flex: 1, background: c.bg4, borderRadius: 12, padding: '10px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: c.w }}>{val}</span>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>{unit}</span>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginTop: 1 }}>{label}</span>
    </div>
  )
}

const MISURE_LABELS: Record<keyof MisureData, string> = {
  vita: 'Vita', petto: 'Petto', bicipite: 'Bicipite', coscia: 'Coscia', fianchi: 'Fianchi',
}

// Settings items with optional action
type SettingsItem = { icon: React.ReactNode; label: string; action?: () => void; badge?: string }
const buildSettingsItems = (navigate: ReturnType<typeof useNavigate>): SettingsItem[] => [
  {
    icon: <Pencil size={14} color={c.w60} strokeWidth={1.6} />,
    label: 'Modifica profilo',
    action: () => navigate('/onboarding'),
  },
  {
    icon: <MessageSquare size={14} color={c.w60} strokeWidth={1.6} />,
    label: 'Invia feedback',
    action: () => window.open('mailto:bozzellapellegrino@gmail.com?subject=Feedback forma.ai', '_blank'),
  },
]

function todayLabel() {
  const d = new Date()
  return `${d.getDate()} ${['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'][d.getMonth()]}`
}

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const settingsItems = buildSettingsItems(navigate)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)

  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [showPesoInput, setShowPesoInput] = useState(false)
  const [nuovoPeso, setNuovoPeso] = useState('')
  const [showWeightHistory, setShowWeightHistory] = useState(false)

  const [misureHistory, setMisureHistory] = useState<MisureEntry[]>([])
  const [editMisure, setEditMisure] = useState(false)
  const [misureDraft, setMisureDraft] = useState<MisureData>(EMPTY_MISURE)
  const [showMisureHistory, setShowMisureHistory] = useState(false)

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(p => {
        setProfile(p)
        if (p?.peso_kg) {
          setWeights([{ val: p.peso_kg as number, date: todayLabel() }])
        }
      })
    }
  }, [user])

  const currentMisure = misureHistory.length > 0 ? misureHistory[misureHistory.length - 1].data : EMPTY_MISURE
  const prevMisure = misureHistory.length > 1 ? misureHistory[misureHistory.length - 2].data : null

  const currentWeight = weights.length > 0 ? weights[weights.length - 1].val : (profile?.peso_kg as number | null) ?? 0
  const firstWeight = weights.length > 0 ? weights[0].val : currentWeight
  const delta = (currentWeight - firstWeight).toFixed(1)
  const altezza = (profile?.altezza_cm as number | null) ?? 170
  const bmi = currentWeight > 0 ? (currentWeight / Math.pow(altezza / 100, 2)).toFixed(1) : '—'

  const handleSavePeso = () => {
    const val = parseFloat(nuovoPeso.replace(',', '.'))
    if (!isNaN(val) && val > 30 && val < 300) {
      setWeights(prev => [...prev, { val, date: todayLabel() }])
      setNuovoPeso('')
      setShowPesoInput(false)
    }
  }

  const handleSaveMisure = () => {
    setMisureHistory(prev => [...prev, { date: todayLabel(), data: misureDraft }])
    setEditMisure(false)
  }

  return (
    <div style={{
      background: c.bg,
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    }}>

      <div style={{
        position: 'absolute',
        top: 'env(safe-area-inset-top)',
        left: 0, right: 0, bottom: 0,
        overflowY: 'scroll',
        WebkitOverflowScrolling: 'touch',
        display: 'flex', flexDirection: 'column',
        paddingBottom: 'var(--nav-h)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px 14px', flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: c.w }}>Profilo</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: c.limeBg, borderRadius: 20, padding: '4px 10px',
            border: `1px solid rgba(234,255,85,0.18)`,
          }}>
            <Flame size={13} color={c.lime} strokeWidth={1.6} />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: c.lime }}>0</span>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD }}>giorni</span>
          </div>
        </div>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px 16px', flexShrink: 0 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: c.lime,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.ink,
            flexShrink: 0,
          }}>
            {user?.email?.slice(0, 2).toUpperCase() ?? 'ME'}
          </div>
          <div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 700, color: c.w }}>
              {(profile?.nome as string) || user?.email?.split('@')[0] || 'Profilo'}
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginTop: 2 }}>
              Obiettivo: <span style={{ color: c.limeD, fontWeight: 600, textTransform: 'capitalize' }}>
                {(profile?.obiettivo as string) || '—'}
              </span> · {(profile?.frequenza_allenamento as number | null) ?? '—'}x/settimana
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 5, background: c.limeBg2, borderRadius: 20, padding: '3px 8px',
              border: `1px solid rgba(234,255,85,0.15)`, cursor: 'pointer',
            }}>
              <Pencil size={9} color={c.limeD} strokeWidth={2} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD }}>Modifica profilo</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8 }}>
          <StatBox label="Peso" val={`${currentWeight}`} unit="kg" />
          <StatBox label="Altezza" val={profile?.altezza_cm ? `${profile.altezza_cm}` : '—'} unit="cm" />
          <StatBox label="Età" val={profile?.eta ? `${profile.eta}` : '—'} unit="anni" />
          <StatBox label="BMI" val={bmi} unit="indice" />
        </div>

        {/* ── Andamento peso ── */}
        <div style={{ margin: '0 20px 12px' }}>
          <div style={{
            background: c.bg3, borderRadius: 16,
            border: `1px solid ${c.w06}`,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w, marginBottom: 1 }}>
                  Andamento peso
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>
                  Ultimi {Math.min(weights.length, 7)} {Math.min(weights.length, 7) === 1 ? 'rilevamento' : 'rilevamenti'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700,
                    color: parseFloat(delta) <= 0 ? c.lime : c.red,
                  }}>
                    {parseFloat(delta) <= 0 ? '' : '+'}{delta} <span style={{ fontSize: 12 }}>kg</span>
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD }}>
                    totale {parseFloat(delta) <= 0 ? '↓' : '↑'}
                  </div>
                </div>
                {/* + button */}
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  onClick={() => { setShowPesoInput(v => !v); setShowWeightHistory(false) }}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: showPesoInput ? c.lime : c.bg4,
                    border: `1px solid ${showPesoInput ? c.lime : 'rgba(255,255,255,0.14)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={showPesoInput ? c.ink : c.w60} strokeWidth="2.5" strokeLinecap="round">
                    {showPesoInput
                      ? <path d="M18 6L6 18M6 6l12 12"/>
                      : <path d="M12 5v14M5 12h14"/>
                    }
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Inline input peso */}
            <AnimatePresence>
              {showPesoInput && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0 16px 12px' }}>
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'center',
                      background: c.bg4, borderRadius: 10, border: `1px solid rgba(234,255,85,0.25)`,
                      padding: '0 12px',
                    }}>
                      <input
                        autoFocus
                        type="number"
                        step="0.1"
                        placeholder="es. 81.5"
                        value={nuovoPeso}
                        onChange={e => setNuovoPeso(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSavePeso()}
                        style={{
                          flex: 1, background: 'transparent', border: 'none', outline: 'none',
                          fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600,
                          color: c.w, padding: '10px 0',
                        }}
                      />
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>kg</span>
                    </div>
                    <motion.div whileTap={{ scale: 0.94 }} onClick={handleSavePeso}
                      style={{
                        background: nuovoPeso ? c.lime : c.bg4,
                        borderRadius: 10, padding: '10px 16px',
                        cursor: nuovoPeso ? 'pointer' : 'default',
                        fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
                        color: nuovoPeso ? c.ink : c.w40,
                        flexShrink: 0,
                      }}>
                      Salva
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chart */}
            <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'center' }}>
              <WeightChart data={weights} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px 0' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.w40 }}>{weights.length > 0 ? `${weights[0].date} · ${firstWeight} kg` : '— kg'}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.lime }}>oggi · {currentWeight} kg</span>
            </div>

            {/* Storico toggle */}
            <motion.div
              onClick={() => { setShowWeightHistory(v => !v); setShowPesoInput(false) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '10px 16px 12px', cursor: 'pointer',
              }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>
                {showWeightHistory ? 'Nascondi storico' : `Storico (${weights.length} ${weights.length === 1 ? 'rilevamento' : 'rilevamenti'})`}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
                <path d={showWeightHistory ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
              </svg>
            </motion.div>

            {/* Storico lista */}
            <AnimatePresence>
              {showWeightHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ borderTop: `1px solid ${c.w06}`, padding: '8px 16px 14px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[...weights].reverse().map((entry, i, arr) => {
                      const prev = arr[i + 1]
                      const diff = prev ? (entry.val - prev.val).toFixed(1) : null
                      const isFirst = i === 0
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '7px 0',
                          borderBottom: i < arr.length - 1 ? `1px solid ${c.w06}` : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: isFirst ? c.lime : c.w20, flexShrink: 0,
                            }}/>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: isFirst ? c.w : c.w60 }}>
                              {entry.date}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {diff !== null && (
                              <span style={{
                                fontFamily: "'DM Mono', monospace", fontSize: 14,
                                color: parseFloat(diff) <= 0 ? c.lime : c.red,
                              }}>
                                {parseFloat(diff) <= 0 ? '' : '+'}{diff} kg
                              </span>
                            )}
                            <span style={{
                              fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600,
                              color: isFirst ? c.w : c.w60,
                            }}>
                              {entry.val} kg
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Misure corpo ── */}
        <div style={{ margin: '0 20px 12px' }}>
          <div style={{
            background: c.bg3, borderRadius: 16,
            border: `1px solid ${c.w06}`,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '14px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>
                  Misure corpo
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginTop: 1 }}>
                  Circonferenze in cm · {misureHistory.length > 0 ? misureHistory[misureHistory.length - 1].date : '—'}
                </div>
              </div>
              <motion.div whileTap={{ scale: 0.9 }}
                onClick={() => { setMisureDraft(currentMisure); setEditMisure(v => !v); setShowMisureHistory(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: editMisure ? c.lime : c.bg4,
                  borderRadius: 20, padding: '5px 12px',
                  border: `1px solid ${editMisure ? c.lime : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer',
                }}>
                <Pencil size={10} color={editMisure ? c.ink : c.w60} strokeWidth={2} />
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: editMisure ? c.ink : c.w60 }}>
                  {editMisure ? 'Annulla' : 'Aggiorna'}
                </span>
              </motion.div>
            </div>

            {/* Grid misure */}
            <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {(Object.keys(MISURE_LABELS) as Array<keyof MisureData>).map((key) => {
                const prev = prevMisure ? prevMisure[key] : null
                const curr = currentMisure[key]
                const diff = prev !== null ? curr - prev : null
                return (
                  <div key={key} style={{
                    width: 'calc(50% - 4px)',
                    background: c.bg4, borderRadius: 10, padding: '10px 12px',
                    border: editMisure ? `1px solid rgba(234,255,85,0.2)` : `1px solid ${c.w06}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>
                        {MISURE_LABELS[key]}
                      </span>
                      {diff !== null && !editMisure && (
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 14,
                          color: diff <= 0 ? c.lime : c.red,
                        }}>
                          {diff <= 0 ? '' : '+'}{diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {editMisure ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <input
                          type="number"
                          value={misureDraft[key]}
                          onChange={e => setMisureDraft(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                          style={{
                            width: '60px', background: 'transparent', border: 'none', outline: 'none',
                            fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: c.lime,
                            padding: 0,
                          }}
                        />
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>cm</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: c.w }}>
                          {curr}
                        </span>
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>cm</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Save button misure */}
            <AnimatePresence>
              {editMisure && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  style={{ padding: '12px 16px' }}
                >
                  <motion.div whileTap={{ scale: 0.97 }} onClick={handleSaveMisure}
                    style={{
                      height: 42, borderRadius: 42, background: c.lime,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink }}>
                      Salva misure
                    </span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Storico misure toggle */}
            {!editMisure && (
              <motion.div
                onClick={() => setShowMisureHistory(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '10px 16px 12px', cursor: 'pointer',
                }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>
                  {showMisureHistory ? 'Nascondi storico' : `Storico (${misureHistory.length} ${misureHistory.length === 1 ? 'rilevamento' : 'rilevamenti'})`}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
                  <path d={showMisureHistory ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}/>
                </svg>
              </motion.div>
            )}

            {/* Storico misure lista */}
            <AnimatePresence>
              {showMisureHistory && !editMisure && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ borderTop: `1px solid ${c.w06}`, padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...misureHistory].reverse().map((entry, i, arr) => {
                      const prevEntry = arr[i + 1]
                      const isFirst = i === 0
                      return (
                        <div key={i} style={{
                          background: isFirst ? c.bg4 : 'transparent',
                          borderRadius: 10,
                          padding: isFirst ? '10px 12px' : '6px 0',
                          borderBottom: !isFirst && i < arr.length - 1 ? `1px solid ${c.w06}` : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: isFirst ? c.lime : c.w20 }}/>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: isFirst ? c.w : c.w60 }}>
                              {entry.date}
                            </span>
                            {isFirst && (
                              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD, background: c.limeBg, borderRadius: 10, padding: '1px 6px' }}>
                                attuale
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                            {(Object.keys(MISURE_LABELS) as Array<keyof MisureData>).map(key => {
                              const val = entry.data[key]
                              const prevVal = prevEntry ? prevEntry.data[key] : null
                              const diff = prevVal !== null ? val - prevVal : null
                              return (
                                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 44 }}>
                                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 2 }}>
                                    {MISURE_LABELS[key]}
                                  </span>
                                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: isFirst ? c.w : c.w60 }}>
                                    {val}
                                  </span>
                                  {diff !== null && (
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: diff <= 0 ? c.lime : c.red }}>
                                      {diff <= 0 ? '' : '+'}{diff.toFixed(0)}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Subscription card */}
        <div style={{ margin: '0 20px 12px' }}>
          <div style={{
            background: `linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0.06) 100%)`,
            borderRadius: 16, padding: '14px 16px',
            border: `1px solid rgba(201,168,76,0.3)`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Sparkles size={14} color={c.gold} strokeWidth={1.6} />
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.gold }}>forma.ai Base</span>
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: 'rgba(201,168,76,0.7)', lineHeight: 1.5 }}>
                  Trial gratuito · 28 giorni rimanenti
                </div>
              </div>
              <motion.div whileTap={{ scale: 0.96 }}
                style={{ background: c.lime, borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink }}>Upgrade</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Settings list */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {settingsItems.map((s) => (
            <motion.div key={s.label} whileTap={{ scale: 0.98 }}
              onClick={s.action}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: c.bg3, border: `1px solid ${c.w06}`,
                borderRadius: 10, padding: '11px 14px', cursor: 'pointer',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, background: c.bg4, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 500, color: c.w }}>{s.label}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Logout + Admin */}
        <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {user?.email === 'bozzellapellegrino@gmail.com' && (
            <motion.div whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/admin')}
              style={{
                height: 44, borderRadius: 44,
                background: 'rgba(234,255,85,0.08)', border: `1px solid rgba(234,255,85,0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', gap: 8,
              }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.lime }}>
                ⚙ Admin Panel
              </span>
            </motion.div>
          )}
          <motion.div whileTap={{ scale: 0.97 }}
            onClick={async () => { await signOut(); navigate('/login') }}
            style={{
              height: 44, borderRadius: 44,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.w10}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w40 }}>
              Esci dall'account
            </span>
          </motion.div>
        </div>

        <div style={{ flex: 1 }}/>
      </div>

    </div>
  )
}

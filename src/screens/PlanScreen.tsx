import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type GiornoPiano, type Pasto, type EsercizioScheda } from '../lib/mock/plan'
import { useAppState } from '../lib/appStore'
import { MealIcon, WorkoutIcon } from '../components/ui/AppIcons'

const c = {
  bg:      '#0e1008',
  bg2:     '#151809',
  bg3:     '#1c1f0d',
  bg4:     '#252912',
  lime:    '#EAFF55',
  limeD:   '#b8cc00',
  limeBg:  'rgba(234,255,85,0.1)',
  limeBg2: 'rgba(234,255,85,0.06)',
  terra:   '#C4714A',
  gold:    '#C9A84C',
  w:       '#ffffff',
  w80:     'rgba(255,255,255,0.80)',
  w60:     'rgba(255,255,255,0.60)',
  w40:     'rgba(255,255,255,0.40)',
  w20:     'rgba(255,255,255,0.20)',
  w10:     'rgba(255,255,255,0.10)',
  w06:     'rgba(255,255,255,0.06)',
  ink:     '#0a0d00',
}

const WORKOUT_COLOR: Record<string, string> = {
  push:          c.lime,
  pull:          '#60a5fa',
  gambe:         '#fb923c',
  lower:         '#fb923c',
  upper:         '#a78bfa',
  full_body:     '#c084fc',
  cardio:        '#f472b6',
  riposo:        c.w20,
  riposo_attivo: '#4ade80',
}


function MacroPill({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'rgba(0,0,0,0.25)', borderRadius: 8, padding: '6px 10px', minWidth: 52,
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color }}>{val}g</span>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>{label}</span>
    </div>
  )
}

function MealCard({ pasto, expanded, onToggle }: {
  pasto: Pasto; expanded: boolean; onToggle: () => void
}) {
  const completato = pasto.completato
  return (
    <div style={{
      background: completato
        ? 'linear-gradient(135deg, rgba(50,80,10,0.7) 0%, rgba(30,50,6,0.7) 100%)'
        : c.bg3,
      borderRadius: 16,
      border: `1px solid ${completato ? 'rgba(234,255,85,0.2)' : c.w06}`,
      overflow: 'hidden', marginBottom: 8,
    }}>
      <motion.div whileTap={{ scale: 0.99 }} onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{
          width: 68, height: 64,
          background: completato ? 'rgba(234,255,85,0.12)' : c.limeBg2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          borderRight: `1px solid ${completato ? 'rgba(234,255,85,0.12)' : 'rgba(255,255,255,0.04)'}`,
        }}>
          <MealIcon type={pasto.tipo} size={22} color={completato ? c.lime : c.w40} />
        </div>
        <div style={{ flex: 1, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, textTransform: 'uppercase' as const, letterSpacing: '0.4px' }}>{pasto.tipo}</span>
            {completato && <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.lime }} />}
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.w, marginBottom: 3 }}>{pasto.nome}</div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.w40 }}>
            {pasto.kcal} kcal · P {pasto.macro.p}g · C {pasto.macro.c}g · G {pasto.macro.g}g
          </div>
        </div>
        <div style={{ paddingRight: 14 }}>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 14px 14px' }}>
              <div style={{
                background: 'rgba(234,255,85,0.05)', border: '1px solid rgba(234,255,85,0.1)',
                borderRadius: 12, padding: '12px 14px', marginTop: 10,
              }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Alimenti</div>
                {pasto.alimenti.map((a) => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: c.lime, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60 }}>{a}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(234,255,85,0.1)' }}>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD, fontWeight: 700, marginBottom: 5, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>Ricetta</div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60, lineHeight: 1.7 }}>{pasto.ricetta}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EsercizioRow({ ex, idx }: { ex: EsercizioScheda; idx: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
      <motion.div whileTap={{ scale: 0.99 }} onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', padding: '9px 0', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          background: 'rgba(234,255,85,0.1)', border: '1px solid rgba(234,255,85,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: c.lime }}>{idx + 1}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w }}>{ex.nome}</div>
          {ex.muscolo_primario && (
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>{ex.muscolo_primario}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '3px 7px', textAlign: 'center' as const }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: c.w60 }}>
              {ex.serie}×{ex.reps}
            </span>
          </div>
          {ex.rir !== undefined && (
            <div style={{ background: 'rgba(234,255,85,0.08)', borderRadius: 6, padding: '3px 7px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.limeD }}>RIR {ex.rir}</span>
            </div>
          )}
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.12 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingBottom: 10, paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>Recupero:</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.w60 }}>
                  {ex.recupero_s >= 60 ? `${Math.floor(ex.recupero_s / 60)}′${ex.recupero_s % 60 > 0 ? ex.recupero_s % 60 + '″' : ''}` : `${ex.recupero_s}″`}
                </span>
              </div>
              {ex.note && (
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, fontStyle: 'italic', lineHeight: 1.5 }}>{ex.note}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Programma: 4 settimane ─────────────────────────────────────────────

const MESI = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic']

function buildWeeks(piano: GiornoPiano[], todayIndex: number) {
  // Genera 4 settimane: settimana corrente + 3 future
  // La settimana corrente usa i dati reali, le altre ripetono lo stesso schema
  const weeks = []
  for (let w = 0; w < 4; w++) {
    const days = piano.map((g, i) => {
      const dateOffset = (w * 7) + (i - todayIndex)
      const d = new Date() // today (dynamic)
      d.setDate(d.getDate() + dateOffset)
      return {
        ...g,
        data: d.getDate(),
        mese: MESI[d.getMonth()],
        weekIndex: w,
        dayIndex: i,
      }
    })
    weeks.push({ label: w === 0 ? 'Settimana corrente' : `Settimana +${w}`, days })
  }
  return weeks
}

function ProgrammaView({ piano, todayIndex, onSelectDay }: {
  piano: GiornoPiano[]
  todayIndex: number
  onSelectDay: (weekIdx: number, dayIdx: number) => void
}) {
  const weeks = buildWeeks(piano, todayIndex)
  const [expandedWeek, setExpandedWeek] = useState(0)

  return (
    <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{
          background: c.bg3, borderRadius: 16,
          border: `1px solid ${wi === 0 ? 'rgba(234,255,85,0.15)' : c.w06}`,
          overflow: 'hidden',
        }}>
          {/* Week header */}
          <motion.div whileTap={{ scale: 0.99 }}
            onClick={() => setExpandedWeek(expandedWeek === wi ? -1 : wi)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px', cursor: 'pointer',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {wi === 0 && (
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.lime }} />
              )}
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: wi === 0 ? c.w : c.w60 }}>
                {week.label}
              </span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>
                {week.days[0].data} {week.days[0].mese} – {week.days[6].data} {week.days[6].mese}
              </span>
            </div>
            <motion.div animate={{ rotate: expandedWeek === wi ? 180 : 0 }} transition={{ duration: 0.15 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </motion.div>
          </motion.div>

          {/* Days compact strip (always visible) */}
          <div style={{ padding: '0 14px 12px', display: 'flex', gap: 4 }}>
            {week.days.map((day, di) => {
              const isToday = wi === 0 && di === todayIndex
              const wColor = WORKOUT_COLOR[day.tipo_allenamento] || c.w20
              return (
                <motion.div key={di} whileTap={{ scale: 0.88 }}
                  onClick={() => onSelectDay(wi, di)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '6px 2px', borderRadius: 10, cursor: 'pointer',
                    background: isToday ? c.limeBg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isToday ? 'rgba(234,255,85,0.2)' : 'transparent'}`,
                  }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: isToday ? c.limeD : c.w40, textTransform: 'uppercase' as const }}>
                    {day.sigla}
                  </span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: isToday ? c.lime : c.w60 }}>
                    {day.data}
                  </span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: wColor, opacity: day.tipo_allenamento === 'riposo' ? 0.3 : 1 }} />
                </motion.div>
              )
            })}
          </div>

          {/* Expanded: week detail */}
          <AnimatePresence>
            {expandedWeek === wi && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                <div style={{ borderTop: `1px solid ${c.w06}`, padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {week.days.map((day, di) => {
                    const isToday = wi === 0 && di === todayIndex
                    const wColor = WORKOUT_COLOR[day.tipo_allenamento] || c.w20
                    return (
                      <motion.div key={di} whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectDay(wi, di)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                          background: isToday ? c.limeBg2 : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isToday ? 'rgba(234,255,85,0.12)' : 'transparent'}`,
                        }}>
                        {/* Day */}
                        <div style={{ width: 42, flexShrink: 0 }}>
                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, textTransform: 'uppercase' as const }}>{day.sigla}</div>
                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: isToday ? c.lime : c.w60 }}>{day.data}</div>
                        </div>
                        {/* Workout dot + type */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: wColor, flexShrink: 0 }}/>
                          <span style={{
                            fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600,
                            color: day.tipo_allenamento === 'riposo' ? c.w40 : c.w,
                            textTransform: 'capitalize' as const,
                          }}>{day.tipo_allenamento === 'riposo' ? 'Riposo' : day.tipo_allenamento}</span>
                        </div>
                        {/* Kcal */}
                        <div style={{ flexShrink: 0, textAlign: 'right' as const }}>
                          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: c.w60 }}>{day.kcal_totali}</div>
                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>kcal</div>
                        </div>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Legenda workout */}
      <div style={{ background: c.bg3, borderRadius: 14, padding: '12px 14px', border: `1px solid ${c.w06}` }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
          Legenda allenamenti
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
          {Object.entries(WORKOUT_COLOR).filter(([k]) => k !== 'misto').map(([tipo, col]) => (
            <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }}/>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60, textTransform: 'capitalize' as const }}>{tipo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────

export default function PlanScreen() {
  const { piano, todayIndex } = useAppState()
  const [view, setView] = useState<'piano' | 'programma'>('piano')
  const [selectedDay, setSelectedDay] = useState(todayIndex)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  const giorno = piano[selectedDay]

  const handleSelectFromProgramma = (_weekIdx: number, dayIdx: number) => {
    // Per ora mostriamo solo dati settimana corrente (i dati mock coprono 7 giorni)
    setSelectedDay(dayIdx)
    setView('piano')
  }

  return (
    <div style={{
      background: c.bg, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
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
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px 12px', flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: c.w }}>Piano</span>

          {/* Toggle Piano / Programma */}
          <div style={{
            display: 'flex', background: c.bg4, borderRadius: 20, padding: 3,
            border: `1px solid ${c.w06}`,
          }}>
            {(['piano', 'programma'] as const).map(v => (
              <motion.div key={v} whileTap={{ scale: 0.95 }}
                onClick={() => setView(v)}
                style={{
                  padding: '5px 14px', borderRadius: 17, cursor: 'pointer',
                  background: view === v ? c.lime : 'transparent',
                  transition: 'background 0.15s',
                }}>
                <span style={{
                  fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
                  color: view === v ? c.ink : c.w40,
                  textTransform: 'capitalize' as const,
                }}>{v}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'piano' ? (
            <motion.div key="piano" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>

              {/* Day selector */}
              <div style={{ padding: '0 18px 14px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>
                  {piano.map((g, i) => (
                    <motion.div
                      key={g.giorno}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => { setSelectedDay(i); setExpandedMeal(null) }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 4, padding: '8px 8px', borderRadius: 14, cursor: 'pointer', flexShrink: 0,
                        minWidth: 48,
                        background: selectedDay === i ? c.lime : i === todayIndex ? c.limeBg2 : 'transparent',
                        border: i === todayIndex && selectedDay !== i ? `1px solid rgba(234,255,85,0.2)` : '1px solid transparent',
                      }}>
                      <span style={{
                        fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600,
                        textTransform: 'uppercase' as const,
                        color: selectedDay === i ? c.ink : c.w40,
                      }}>{g.sigla}</span>
                      <span style={{
                        fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700,
                        color: selectedDay === i ? c.ink : i === todayIndex ? c.lime : c.w60,
                      }}>{g.data}</span>
                      <WorkoutIcon type={g.tipo_allenamento} size={12} color={selectedDay === i ? c.ink : WORKOUT_COLOR[g.tipo_allenamento] || c.w40} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Hero day card */}
              <AnimatePresence mode="wait">
                <motion.div key={selectedDay} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
                  style={{ margin: '0 18px 16px' }}>
                  <div style={{
                    background: 'linear-gradient(145deg, #2e4a08 0%, #1a2d04 40%, #0a1500 80%, #060e00 100%)',
                    borderRadius: 20, padding: '16px 16px 14px',
                    border: '1px solid rgba(255,255,255,0.07)',
                    overflow: 'hidden', position: 'relative' as const,
                  }}>
                    <div style={{ position: 'absolute' as const, top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(234,255,85,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1, paddingRight: 12 }}>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: c.w, lineHeight: 1.1 }}>{giorno.giorno}</div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.5 }}>{giorno.note}</div>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: c.limeBg, border: '1px solid rgba(234,255,85,0.2)',
                        borderRadius: 20, padding: '5px 10px', flexShrink: 0,
                      }}>
                        <WorkoutIcon type={giorno.tipo_allenamento} size={13} color={c.lime} />
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.lime, textTransform: 'capitalize' as const }}>{giorno.tipo_allenamento}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        flex: 1, background: 'rgba(0,0,0,0.30)', borderRadius: 10, padding: '8px 12px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: c.w, lineHeight: 1 }}>{giorno.kcal_totali}</span>
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.40)', marginTop: 3 }}>kcal/giorno</span>
                      </div>
                      <MacroPill label="Proteine" val={giorno.macro.proteine} color={c.lime} />
                      <MacroPill label="Carb" val={giorno.macro.carboidrati} color={c.gold} />
                      <MacroPill label="Grassi" val={giorno.macro.grassi} color={c.terra} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Allenamento (if exercises exist) */}
              {giorno.esercizi && giorno.esercizi.length > 0 && (
                <div style={{ padding: '0 18px 16px' }}>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
                    color: c.w40, marginBottom: 8,
                    textTransform: 'uppercase' as const, letterSpacing: '0.8px',
                  }}>Allenamento</div>
                  <div style={{
                    background: c.bg3, borderRadius: 16,
                    border: `1px solid ${WORKOUT_COLOR[giorno.tipo_allenamento] ? `${WORKOUT_COLOR[giorno.tipo_allenamento]}22` : c.w06}`,
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.w }}>{giorno.sessione_label}</div>
                        {giorno.muscoli.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, marginTop: 5 }}>
                            {giorno.muscoli.map(m => (
                              <div key={m} style={{ background: 'rgba(234,255,85,0.08)', border: '1px solid rgba(234,255,85,0.15)', borderRadius: 8, padding: '2px 7px' }}>
                                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD, fontWeight: 600 }}>{m}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {giorno.durata_min && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '5px 9px', textAlign: 'center' as const, flexShrink: 0, marginLeft: 10 }}>
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: c.w }}>{giorno.durata_min}</span>
                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>min</div>
                        </div>
                      )}
                    </div>
                    {giorno.note_sessione && (
                      <div style={{
                        fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 10,
                        padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                        lineHeight: 1.5,
                      }}>{giorno.note_sessione}</div>
                    )}
                    <div>
                      {giorno.esercizi.map((ex, idx) => (
                        <EsercizioRow key={`${ex.nome}-${idx}`} ex={ex} idx={idx} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Pasti */}
              <div style={{ padding: '0 18px 24px' }}>
                <div style={{
                  fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
                  color: c.w40, marginBottom: 8,
                  textTransform: 'uppercase' as const, letterSpacing: '0.8px',
                }}>Pasti</div>
                {giorno.pasti.map((pasto) => (
                  <MealCard
                    key={pasto.nome}
                    pasto={pasto}
                    expanded={expandedMeal === pasto.nome}
                    onToggle={() => setExpandedMeal(expandedMeal === pasto.nome ? null : pasto.nome)}
                  />
                ))}
              </div>

            </motion.div>
          ) : (
            <motion.div key="programma" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>

              {/* Legenda colori workout inline in header */}
              <div style={{ padding: '0 18px 14px' }}>
                <div style={{
                  background: c.bg3, borderRadius: 14, padding: '10px 14px',
                  border: `1px solid ${c.w06}`,
                  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const,
                }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, fontWeight: 600, marginRight: 4 }}>SPLIT:</span>
                  {Object.entries(WORKOUT_COLOR).filter(([k]) => k !== 'misto').map(([tipo, col]) => (
                    <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: col }}/>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60, textTransform: 'capitalize' as const }}>{tipo}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ProgrammaView piano={piano} todayIndex={todayIndex} onSelectDay={handleSelectFromProgramma} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  )
}

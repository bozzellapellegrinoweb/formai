import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type GiornoPiano, type Pasto, type EsercizioScheda } from '../lib/mock/plan'
import { useAppState, updateMeal } from '../lib/appStore'
import { MealIcon } from '../components/ui/AppIcons'
import { c } from '../design/themes'

const WORKOUT_COLOR: Record<string, string> = {
  push:          c.limeInk,
  pull:          'var(--blue)',
  gambe:         '#fb923c',
  lower:         '#fb923c',
  upper:         '#a78bfa',
  full_body:     '#c084fc',
  cardio:        '#f472b6',
  riposo:        'var(--w40)',
  riposo_attivo: '#4ade80',
}

const WORKOUT_LABEL: Record<string, string> = {
  push: 'Push', pull: 'Pull', gambe: 'Gambe', lower: 'Lower',
  upper: 'Upper', full_body: 'Full Body', cardio: 'Cardio',
  riposo: 'Riposo', riposo_attivo: 'Recupero',
}

const mono = { fontFamily: "'DM Mono', monospace" } as const
const sans = { fontFamily: "'Poppins', sans-serif" } as const

// ── Macro stat box ────────────────────────────────────────────────────────────
function MacroBox({ label, val, unit, color }: { label: string; val: number; unit: string; color: string }) {
  return (
    <div style={{
      flex: 1, background: c.bg3, borderRadius: 12, padding: '10px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
      border: `1px solid ${c.bgLine}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <span style={{ ...mono, fontSize: 18, fontWeight: 700, color }}>{val}</span>
        <span style={{ ...mono, fontSize: 10, color: c.w40 }}>{unit}</span>
      </div>
      <span style={{ ...sans, fontSize: 9, fontWeight: 600, color: c.w40, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{label}</span>
    </div>
  )
}

// ── Exercise row ─────────────────────────────────────────────────────────────
function EsercizioRow({ ex, idx }: { ex: EsercizioScheda; idx: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: `1px solid ${c.bgLine}` }}>
      <motion.div whileTap={{ scale: 0.99 }} onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', padding: '12px 0', gap: 10, cursor: 'pointer' }}>
        {/* Number badge */}
        <div style={{
          width: 24, height: 24, borderRadius: 8, flexShrink: 0,
          background: c.limeBg, border: `1px solid ${c.limeBg2}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: c.limeInk }}>{idx + 1}</span>
        </div>
        {/* Name + muscle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...sans, fontSize: 14, fontWeight: 700, color: c.w, lineHeight: 1.2 }}>{ex.nome}</div>
          {ex.muscolo_primario && (
            <div style={{ ...sans, fontSize: 10, color: c.w40, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginTop: 2 }}>
              {ex.muscolo_primario}
            </div>
          )}
        </div>
        {/* Sets × reps */}
        <div style={{ background: c.bg4, borderRadius: 6, padding: '3px 8px' }}>
          <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: c.w60 }}>
            {ex.serie}×{ex.reps}
          </span>
        </div>
        {/* RIR badge */}
        {ex.rir !== undefined && (
          <div style={{ background: c.limeBg, border: `1px solid ${c.limeBg2}`, borderRadius: 6, padding: '3px 8px' }}>
            <span style={{ ...mono, fontSize: 12, color: c.limeInk }}>RIR {ex.rir}</span>
          </div>
        )}
        {/* Arrow */}
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.14 }} style={{ flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingBottom: 12, paddingLeft: 34, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ ...sans, fontSize: 12, color: c.w40 }}>Recupero:</span>
                <span style={{ ...mono, fontSize: 12, color: c.w60 }}>
                  {ex.recupero_s >= 60
                    ? `${Math.floor(ex.recupero_s / 60)}′${ex.recupero_s % 60 > 0 ? ex.recupero_s % 60 + '″' : ''}`
                    : `${ex.recupero_s}″`}
                </span>
              </div>
              {ex.note && (
                <span style={{ ...sans, fontSize: 12, color: c.w40, fontStyle: 'italic', lineHeight: 1.5 }}>{ex.note}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Meal row ─────────────────────────────────────────────────────────────────
function MealRow({ pasto, expanded, onToggle, isToday }: {
  pasto: Pasto; expanded: boolean; onToggle: () => void; isToday: boolean
}) {
  const done = pasto.completato
  const [flash, setFlash] = useState(false)

  function handleCheck(e: React.MouseEvent) {
    e.stopPropagation()
    setFlash(true)
    updateMeal(pasto.tipo, { completato: !done })
    setTimeout(() => setFlash(false), 400)
  }

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return (
    <div style={{
      background: done
        ? 'linear-gradient(135deg, rgba(50,80,10,0.55) 0%, rgba(30,50,6,0.5) 100%)'
        : c.bg2,
      borderRadius: 14,
      border: `1px solid ${done ? 'rgba(234,255,85,0.18)' : c.bgLine}`,
      overflow: 'hidden', marginBottom: 6,
    }}>
      <motion.div whileTap={{ scale: 0.99 }} onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 12px 0 0' }}>
        {/* Icon */}
        <div style={{
          width: 56, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: done ? 'rgba(234,255,85,0.10)' : c.bg3,
          borderRight: `1px solid ${done ? 'rgba(234,255,85,0.10)' : c.bgLine}`,
        }}>
          <MealIcon type={pasto.tipo} size={20} color={done ? c.limeInk : c.w40} />
        </div>
        {/* Content */}
        <div style={{ flex: 1, padding: '10px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            <span style={{ ...sans, fontSize: 10, color: done ? c.limeInk : c.w40, textTransform: 'uppercase' as const, fontWeight: 600, letterSpacing: '0.06em' }}>
              {pasto.tipo}
            </span>
            {done && (
              <>
                <span style={{ ...sans, fontSize: 10, color: c.limeInk }}>{timeStr}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: c.limeInk, flexShrink: 0 }} />
              </>
            )}
          </div>
          <div style={{ ...sans, fontSize: 14, fontWeight: 700, color: c.w, lineHeight: 1.2, marginBottom: 2 }}>
            {pasto.nome}
          </div>
          <div style={{ ...mono, fontSize: 11, color: c.w40 }}>
            {pasto.kcal} kcal · P{pasto.macro.p}g · C{pasto.macro.c}g · G{pasto.macro.g}g
          </div>
        </div>
        {/* Check + Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {isToday && (
            <motion.div whileTap={{ scale: 0.85 }} onClick={handleCheck}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: done || flash ? c.lime : c.limeBg,
                border: `1.5px solid ${done || flash ? c.lime : 'rgba(234,255,85,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={done || flash ? c.ink : c.limeInk} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </motion.div>
          )}
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.14 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 14px 14px', paddingLeft: 70 }}>
              <div style={{ background: c.bg3, border: `1px solid ${c.bgLine}`, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ ...sans, fontSize: 10, fontWeight: 700, color: c.w40, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 }}>Alimenti</div>
                {pasto.alimenti.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.limeInk, flexShrink: 0 }}/>
                    <span style={{ ...sans, fontSize: 12, color: c.w60 }}>{a}</span>
                  </div>
                ))}
                {pasto.ricetta && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${c.bgLine}` }}>
                    <div style={{ ...sans, fontSize: 10, fontWeight: 700, color: c.limeInk, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 }}>Ricetta</div>
                    <div style={{ ...sans, fontSize: 12, color: c.w60, lineHeight: 1.6 }}>{pasto.ricetta}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PlanScreen() {
  const { piano, todayIndex } = useAppState()
  const [selectedDay, setSelectedDay] = useState(todayIndex)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)

  const giorno: GiornoPiano = piano[selectedDay]
  const isRestDay = giorno.tipo_allenamento === 'riposo' || giorno.tipo_allenamento === 'riposo_attivo'
  const isToday = selectedDay === todayIndex
  const wColor = WORKOUT_COLOR[giorno.tipo_allenamento] || c.w40
  const wLabel = WORKOUT_LABEL[giorno.tipo_allenamento] || giorno.tipo_allenamento

  const totalPastiKcal = giorno.pasti.reduce((s, p) => s + p.kcal, 0)

  return (
    <div style={{ background: c.bg, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div style={{
        position: 'absolute', top: 'env(safe-area-inset-top)', left: 0, right: 0, bottom: 0,
        overflowY: 'scroll', WebkitOverflowScrolling: 'touch',
        paddingBottom: 'calc(var(--nav-h) + 12px)',
      }}>

        {/* ── Day selector strip ── */}
        <div style={{ padding: '10px 16px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: 4, minWidth: 'max-content', paddingBottom: 10 }}>
            {piano.map((g, i) => {
              const sel = i === selectedDay
              const tod = i === todayIndex
              return (
                <motion.div key={g.giorno} whileTap={{ scale: 0.9 }}
                  onClick={() => { setSelectedDay(i); setExpandedMeal(null) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 4, padding: '8px 10px', borderRadius: 14, cursor: 'pointer', flexShrink: 0,
                    background: sel ? c.lime : tod ? c.limeBg : c.bg2,
                    border: `1px solid ${sel ? c.lime : tod ? c.limeBg : c.bgLine}`,
                    minWidth: 46,
                  }}>
                  <span style={{ ...sans, fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                    color: sel ? c.ink : c.w40 }}>{g.sigla}</span>
                  <span style={{ ...sans, fontSize: 16, fontWeight: 800,
                    color: sel ? c.ink : tod ? c.limeInk : c.w70 }}>{g.data}</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%',
                    background: sel ? 'rgba(10,13,0,0.4)' : WORKOUT_COLOR[g.tipo_allenamento] || c.w25,
                    opacity: g.tipo_allenamento === 'riposo' ? 0.4 : 1,
                  }}/>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Hero day card ── */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedDay} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
            style={{ padding: '0 16px', marginBottom: 14 }}>
            <div style={{
              background: c.bg2, borderRadius: 20, padding: '16px',
              border: `1px solid ${c.bgLine}`, overflow: 'hidden',
            }}>
              {/* Kicker + workout chip row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ ...sans, fontSize: 10, fontWeight: 700, color: c.w40, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 4 }}>
                    {giorno.giorno}
                    {isToday && <span style={{ color: c.limeInk, marginLeft: 6 }}>· oggi</span>}
                  </div>
                  <div style={{ ...sans, fontSize: 18, fontWeight: 800, color: c.w, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                    {isRestDay ? giorno.sessione_label : giorno.sessione_label}
                  </div>
                  {!isRestDay && (
                    <div style={{ ...sans, fontSize: 12, color: c.w40, marginTop: 4 }}>
                      {giorno.durata_min} min · {giorno.esercizi?.length ?? 0} esercizi
                      {giorno.kcal_bonus ? ` · +${giorno.kcal_bonus} kcal` : ''}
                    </div>
                  )}
                </div>
                {/* Workout chip */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: c.bg3, border: `1px solid ${c.bgLine}`,
                  borderRadius: 20, padding: '5px 10px', flexShrink: 0, marginLeft: 10,
                }}>
                  <span style={{ ...sans, fontSize: 10, color: wColor, fontWeight: 700 }}>++</span>
                  <span style={{ ...sans, fontSize: 11, color: c.w60, fontWeight: 600 }}>{wLabel}</span>
                </div>
              </div>

              {/* Macro boxes row */}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <MacroBox label="KCAL" val={giorno.kcal_totali} unit="" color={c.w} />
                <MacroBox label="PROT" val={giorno.macro.proteine} unit="g" color={c.limeInk} />
                <MacroBox label="CARB" val={giorno.macro.carboidrati} unit="g" color={c.blue} />
                <MacroBox label="GRASSI" val={giorno.macro.grassi} unit="g" color={c.terra} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Allenamento section ── */}
        {!isRestDay && giorno.esercizi && giorno.esercizi.length > 0 && (
          <div style={{ padding: '0 16px', marginBottom: 14 }}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ ...sans, fontSize: 15, fontWeight: 700, color: c.w }}>Allenamento</span>
              <span style={{ ...sans, fontSize: 12, color: c.w40 }}>
                {giorno.durata_min} min · {giorno.esercizi.length} esercizi
              </span>
            </div>

            {/* Workout card */}
            <div style={{ background: c.bg2, borderRadius: 16, border: `1px solid ${c.bgLine}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 14px 0' }}>
                {/* Session title */}
                <div style={{ ...sans, fontSize: 15, fontWeight: 700, color: c.w, marginBottom: 8 }}>
                  {giorno.sessione_label.split('—')[0]?.trim() || giorno.sessione_label}
                </div>
                {/* Muscle tags */}
                {giorno.muscoli.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 10 }}>
                    {giorno.muscoli.map(m => (
                      <div key={m} style={{
                        background: c.bg3, border: `1px solid ${c.bgLine}`,
                        borderRadius: 20, padding: '3px 9px',
                      }}>
                        <span style={{ ...sans, fontSize: 11, color: c.w60, fontWeight: 500 }}>{m.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Session notes */}
                {giorno.note_sessione && (
                  <div style={{ ...sans, fontSize: 12, color: c.w55, lineHeight: 1.6, marginBottom: 12 }}>
                    {giorno.note_sessione}
                  </div>
                )}
              </div>

              {/* Exercise list */}
              <div style={{ padding: '0 14px 4px' }}>
                {giorno.esercizi.map((ex, idx) => (
                  <EsercizioRow key={`${ex.nome}-${idx}`} ex={ex} idx={idx} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rest day note */}
        {isRestDay && giorno.note_sessione && (
          <div style={{ margin: '0 16px 14px' }}>
            <div style={{ background: c.bg2, borderRadius: 14, padding: '14px', border: `1px solid ${c.bgLine}` }}>
              <div style={{ ...sans, fontSize: 12, color: c.w55, lineHeight: 1.6 }}>{giorno.note_sessione}</div>
            </div>
          </div>
        )}

        {/* ── Pasti section ── */}
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ ...sans, fontSize: 15, fontWeight: 700, color: c.w }}>Pasti</span>
            <span style={{ ...sans, fontSize: 12, color: c.w40 }}>
              {giorno.pasti.length} pasti · {totalPastiKcal} kcal
            </span>
          </div>
          {giorno.pasti.map((pasto) => (
            <MealRow
              key={pasto.tipo}
              pasto={pasto}
              expanded={expandedMeal === pasto.tipo}
              onToggle={() => setExpandedMeal(expandedMeal === pasto.tipo ? null : pasto.tipo)}
              isToday={isToday}
            />
          ))}
        </div>

      </div>
    </div>
  )
}

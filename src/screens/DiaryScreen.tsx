import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBar from '../components/ui/StatusBar'
import BottomNav from '../components/ui/BottomNav'
import { mockDiaryEntries, type DiaryEntry } from '../lib/mock/diary'
import { MealIcon, Flame, Camera, Bot } from '../components/ui/AppIcons'
import { useAppState } from '../lib/appStore'

const c = {
  bg:     '#0e1008',
  bg3:    '#1c1f0d',
  bg4:    '#252912',
  lime:   '#EAFF55',
  limeD:  '#b8cc00',
  limeBg: 'rgba(234,255,85,0.1)',
  limeBg2:'rgba(234,255,85,0.06)',
  terra:  '#C4714A',
  terraBg:'rgba(196,113,74,0.15)',
  gold:   '#C9A84C',
  w:      '#ffffff',
  w60:    'rgba(255,255,255,0.60)',
  w40:    'rgba(255,255,255,0.40)',
  w20:    'rgba(255,255,255,0.20)',
  w10:    'rgba(255,255,255,0.10)',
  w06:    'rgba(255,255,255,0.06)',
  ink:    '#0a0d00',
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

function StreakBadge({ count }: { count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: c.limeBg, borderRadius: 20, padding: '5px 12px',
      border: `1px solid ${c.lime}`,
    }}>
      <Flame size={14} color={c.lime} strokeWidth={1.6} />
      <div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: c.lime }}>{count}</span>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, marginLeft: 3 }}>giorni di fila</span>
      </div>
    </div>
  )
}

function EntryCard({ entry }: { entry: DiaryEntry }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{
      background: c.bg3, borderRadius: 16,
      border: `1px solid ${entry.in_linea ? 'rgba(234,255,85,0.2)' : 'rgba(196,113,74,0.2)'}`,
      overflow: 'hidden', marginBottom: 8,
    }}>
      <motion.div whileTap={{ scale: 0.99 }} onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{
          width: 64, height: 58,
          background: 'linear-gradient(135deg, rgba(234,255,85,0.11) 0%, rgba(74,107,78,0.08) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <MealIcon type={entry.meal_type} size={20} color={c.w40} />
        </div>
        <div style={{ flex: 1, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' as const }}>
              {entry.meal_type}
            </span>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.w20 }}/>
            <span style={{ fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif" }}>{entry.label}</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w, marginBottom: 3 }}>
            {entry.description}
          </div>
          <div style={{ fontSize: 12, color: c.w40, fontFamily: "'DM Mono', monospace" }}>
            {entry.kcal_estimated} kcal · P {entry.macro.p}g · C {entry.macro.c}g · G {entry.macro.g}g
          </div>
        </div>
        <div style={{ paddingRight: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            background: entry.in_linea ? c.limeBg : c.terraBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {entry.in_linea ? (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c.lime} strokeWidth="3" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            ) : (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={c.terra} strokeWidth="3" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            )}
          </div>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              margin: '0 12px 12px',
              background: entry.in_linea ? 'rgba(234,255,85,0.06)' : c.terraBg,
              borderRadius: 10, padding: '10px 12px',
              border: `1px solid ${entry.in_linea ? 'rgba(234,255,85,0.1)' : 'rgba(196,113,74,0.2)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <Bot size={11} color={entry.in_linea ? c.limeD : c.terra} strokeWidth={1.8} />
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: entry.in_linea ? c.limeD : c.terra }}>
                  NUTRI
                </span>
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w60, lineHeight: 1.6 }}>
                {entry.agent_comment}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LogModal({ onClose }: { onClose: () => void }) {
  const [method, setMethod] = useState<'foto' | 'testo' | null>(null)
  const [text, setText] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 390, margin: '0 auto',
          background: '#1a1c0f', borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }}/>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w, marginBottom: 4 }}>
          Aggiungi pasto
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 20 }}>
          Registra in 10 secondi
        </div>

        {!method && (
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'foto', title: 'Scatta foto', desc: 'NUTRI analizza e stima' },
              { key: 'testo', title: 'Descrivi', desc: 'Scrivi cosa hai mangiato' },
            ].map((m) => (
              <motion.div key={m.key} whileTap={{ scale: 0.97 }}
                onClick={() => setMethod(m.key as 'foto' | 'testo')}
                style={{
                  flex: 1, padding: '16px', borderRadius: 14,
                  background: c.bg3, border: `1px solid ${c.w06}`,
                  cursor: 'pointer', textAlign: 'center' as const,
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  {m.key === 'foto' ? <Camera size={26} color={c.w40} strokeWidth={1.4} /> : <Bot size={26} color={c.w40} strokeWidth={1.4} />}
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w, marginBottom: 3 }}>{m.title}</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{m.desc}</div>
              </motion.div>
            ))}
          </div>
        )}

        {method === 'foto' && (
          <div style={{
            background: c.bg3, borderRadius: 14, border: `2px dashed ${c.w20}`,
            padding: '32px 20px', textAlign: 'center' as const, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <Camera size={32} color={c.w40} strokeWidth={1.3} />
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w, marginBottom: 6 }}>
              Scatta o carica una foto
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
              NUTRI analizzerà il piatto e stima calorie e macro in automatico
            </div>
          </div>
        )}

        {method === 'testo' && (
          <div>
            <textarea
              placeholder="Es. 150g petto di pollo alla griglia con riso integrale 100g..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%', minHeight: 90, background: c.bg3,
                border: `1px solid ${c.w06}`, borderRadius: 12,
                padding: '12px 14px', resize: 'none' as const,
                fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w,
                outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
              }}
            />
            <motion.div whileTap={{ scale: 0.97 }} onClick={onClose}
              style={{
                height: 48, borderRadius: 48,
                background: text.trim() ? c.lime : c.bg4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: text.trim() ? 'pointer' : 'default', marginTop: 10,
              }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: text.trim() ? c.ink : c.w40 }}>
                Analizza con NUTRI →
              </span>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function DiaryScreen() {
  const { todayMacros } = useAppState()
  const kcalConsumate = todayMacros.kcal_consumed
  const kcalTarget = todayMacros.kcal_target
  const pct = Math.round((kcalConsumate / kcalTarget) * 100)
  const [showLogModal, setShowLogModal] = useState(false)

  const grouped = mockDiaryEntries.reduce<Record<string, DiaryEntry[]>>((acc, e) => {
    if (!acc[e.label]) acc[e.label] = []
    acc[e.label].push(e)
    return acc
  }, {})

  return (
    <div style={{
      background: c.bg,
      height: '100svh',
      display: 'flex', flexDirection: 'column',
      maxWidth: 390, margin: '0 auto',
      position: 'relative',
    }}>
      <DynamicIsland />
      <StatusBar />

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 20px 10px', flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: c.w }}>Diario</span>
          <StreakBadge count={7} />
        </div>

        {/* Daily summary */}
        <div style={{ margin: '0 18px 14px' }}>
          <div style={{
            background: c.bg3, borderRadius: 16, padding: '12px 14px',
            border: `1px solid ${c.w06}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 2 }}>Oggi loggato</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: c.lime }}>{kcalConsumate}</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>kcal su {kcalTarget.toLocaleString('it-IT')} target</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, marginBottom: 6 }}>
                  {pct < 50 ? 'Aggiorna il diario' : pct < 90 ? 'In linea col piano' : 'Target quasi raggiunto'}
                </div>
                <div style={{
                  background: c.limeBg, borderRadius: 20, padding: '3px 10px',
                  border: `1px solid rgba(234,255,85,0.25)`, display: 'inline-block',
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: c.lime }}>{pct}%</span>
                </div>
              </div>
            </div>
            {/* Macro bar */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'P', val: todayMacros.proteine_consumed, target: todayMacros.proteine, color: c.lime },
                { label: 'C', val: todayMacros.carboidrati_consumed, target: todayMacros.carboidrati, color: c.gold },
                { label: 'G', val: todayMacros.grassi_consumed, target: todayMacros.grassi, color: c.terra },
              ].map(m => (
                <div key={m.label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{m.label}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: c.w60 }}>{m.val}/{m.target}g</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${Math.min(m.val / m.target * 100, 100)}%`, background: m.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Log CTA */}
        <div style={{ padding: '0 18px 14px' }}>
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => setShowLogModal(true)}
            style={{
              height: 48, borderRadius: 48,
              background: c.lime,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, cursor: 'pointer',
            }}>
            <Camera size={16} color={c.ink} strokeWidth={2} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: c.ink }}>
              Logga un pasto
            </span>
          </motion.div>
        </div>

        {/* Entries grouped by day */}
        {Object.entries(grouped).map(([label, entries]) => (
          <div key={label} style={{ padding: '0 18px' }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600,
              color: c.w40, marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.5px',
            }}>
              {label}
            </div>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ))}

        <div style={{ height: 20 }} />
      </div>

      <AnimatePresence>
        {showLogModal && <LogModal onClose={() => setShowLogModal(false)} />}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

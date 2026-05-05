import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/ui/StatusBar'
import BottomNav from '../components/ui/BottomNav'
import { mockUser } from '../lib/mock/user'
import { useAppState } from '../lib/appStore'
import { MealIcon, Camera, Bot, Dumbbell, ChevronRight, Zap } from '../components/ui/AppIcons'

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

function DynamicIsland() {
  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      width: 90, height: 26, background: '#000', borderRadius: 50, zIndex: 30,
    }}/>
  )
}

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
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: c.w, lineHeight: 1 }}>{consumed}</span>
        <span style={{ fontSize: 12, color: c.w40, fontFamily: "'DM Mono', monospace", marginTop: 1 }}>kcal</span>
      </div>
    </div>
  )
}

const TABS = ['Mattina', 'Pomeriggio', 'Sera']
const TAB_TIPI: Record<number, string[]> = {
  0: ['colazione'],
  1: ['pranzo', 'spuntino'],
  2: ['cena'],
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

export default function HomeScreen() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState(0)
  const { todayMacros: m, piano, todayIndex } = useAppState()
  const [selectedDay, setSelectedDay] = useState(todayIndex)

  const giorno = piano[selectedDay]
  const isToday = selectedDay === todayIndex
  const pastiVisibili = giorno.pasti.filter(p => TAB_TIPI[selectedTab].includes(p.tipo))

  const macroGiorno = giorno.macro

  return (
    <div style={{
      background: `radial-gradient(ellipse 120% 40% at 50% 0%, rgba(234,255,85,0.18) 0%, transparent 65%), radial-gradient(ellipse 80% 35% at 90% 100%, rgba(234,255,85,0.08) 0%, transparent 55%), ${c.bg}`,
      height: '100svh',
      display: 'flex', flexDirection: 'column',
      maxWidth: 390, margin: '0 auto',
      position: 'relative',
    }}>
      <DynamicIsland />
      <StatusBar />

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '10px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: c.lime,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 800, color: c.ink,
            }}>
              {mockUser.avatar_initials}
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{mockUser.name}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, fontWeight: 800, letterSpacing: '-0.5px', color: c.w }}>
                Today's <span style={{ color: c.lime }}>Habit</span>
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
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w }}>Maggio 2026</span>
            <motion.div whileTap={{ scale: 0.95 }} onClick={() => navigate('/piano')} style={{ cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD }}>Vedi programma →</span>
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
                    fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 500,
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
                    fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600,
                    color: giorno.tipo_allenamento === 'riposo' ? c.w40 : c.lime,
                    background: giorno.tipo_allenamento === 'riposo' ? 'rgba(255,255,255,0.06)' : 'rgba(234,255,85,0.15)',
                    borderRadius: 20, padding: '2px 8px',
                    textTransform: 'capitalize' as const,
                  }}>
                    {giorno.tipo_allenamento === 'riposo' ? 'Riposo' : '🏋️ ' + giorno.tipo_allenamento}
                  </span>
                  {isToday && (
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD }}>oggi</span>
                  )}
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, color: c.w, lineHeight: 1.15 }}>
                  {giorno.tipo_allenamento === 'riposo'
                    ? 'Giornata di riposo'
                    : `Allenamento ${giorno.tipo_allenamento}`
                  }
                </div>
                {giorno.tipo_allenamento !== 'riposo' && (
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w60, marginTop: 2 }}>
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
            <KcalRing consumed={isToday ? m.kcal_consumed : 0} total={giorno.kcal_totali} />
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 3 }}>Calorie</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: c.lime, fontWeight: 700 }}>
                {isToday ? m.kcal_consumed : 0} / {giorno.kcal_totali}
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
                P {macroGiorno.proteine}g · C {macroGiorno.carboidrati}g · G {macroGiorno.grassi}g
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
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: c.lime }}>NUTRI</span>
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w, lineHeight: 1.3 }}>
              Chiedi al coach AI
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={12} color={c.ink} strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Sezione pasti con tab ── */}
        <div style={{ margin: '0 20px', background: c.bg3, borderRadius: 18, border: `1px solid ${c.w06}`, overflow: 'hidden', marginBottom: 12 }}>
          {/* Tab header */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${c.w06}` }}>
            {TABS.map((t, i) => (
              <div
                key={t}
                onClick={() => setSelectedTab(i)}
                style={{
                  flex: 1, padding: '11px 0', textAlign: 'center' as const,
                  fontFamily: "'Poppins', sans-serif", fontSize: 12,
                  fontWeight: selectedTab === i ? 700 : 400,
                  color: selectedTab === i ? c.w : c.w40,
                  cursor: 'pointer',
                  borderBottom: selectedTab === i ? `2px solid ${c.lime}` : '2px solid transparent',
                  transition: 'all 0.15s',
                  background: selectedTab === i ? 'rgba(234,255,85,0.04)' : 'transparent',
                }}>
                {t}
              </div>
            ))}
          </div>

          {/* Pasti */}
          <div style={{ padding: '8px 0 4px' }}>
            <AnimatePresence mode="wait">
              {pastiVisibili.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ padding: '20px 16px', textAlign: 'center' as const }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
                    Nessun pasto in questa fascia oraria
                  </span>
                </motion.div>
              ) : (
                <motion.div key={`tab-${selectedTab}-day-${selectedDay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {pastiVisibili.map((pasto, i) => (
                    <motion.div
                      key={pasto.nome}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.04 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/piano')}
                      style={{
                        margin: '0 8px 8px',
                        background: pasto.completato
                          ? 'linear-gradient(135deg, rgba(50,80,10,0.7) 0%, rgba(30,50,6,0.7) 100%)'
                          : c.bg4,
                        borderRadius: 14,
                        border: `1px solid ${pasto.completato ? 'rgba(234,255,85,0.2)' : c.w06}`,
                        display: 'flex', alignItems: 'center', overflow: 'hidden', cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 58, height: 54,
                        background: pasto.completato ? 'rgba(234,255,85,0.08)' : 'rgba(255,255,255,0.025)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <MealIcon type={pasto.tipo} size={20} color={pasto.completato ? c.lime : c.w40} />
                      </div>
                      <div style={{ flex: 1, padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
                          <span style={{ fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' as const }}>{pasto.tipo}</span>
                          {pasto.completato && <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.lime }}/>}
                        </div>
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w, marginBottom: 1 }}>{pasto.nome}</div>
                        <div style={{ fontSize: 12, color: c.w40, fontFamily: "'DM Mono', monospace" }}>
                          {pasto.kcal} kcal · P {pasto.macro.p}g
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer link */}
          <motion.div
            whileTap={{ scale: 0.97 }} onClick={() => navigate('/piano')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '8px 16px 12px', cursor: 'pointer', borderTop: `1px solid ${c.w06}`,
            }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
              Vedi piano completo
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </motion.div>
        </div>

        {/* Quick actions */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => navigate('/diario')}
            style={{
              flex: 1, padding: '13px 14px', borderRadius: 16,
              background: c.bg3, border: `1px solid ${c.w06}`,
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: c.limeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Camera size={16} color={c.lime} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w }}>Log pasto</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>Foto o testo</div>
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
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w }}>Chiedi a NUTRI</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>Coach AI</div>
            </div>
          </motion.div>
        </div>

      </div>

      <BottomNav />
    </div>
  )
}

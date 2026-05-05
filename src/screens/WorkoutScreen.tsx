import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/ui/StatusBar'
import BottomNav from '../components/ui/BottomNav'
import { exerciseVideoMap, type Exercise } from '../lib/mock/workout'
import { useAppState } from '../lib/appStore'
import {
  Dumbbell, Flame, Clock, ChevronLeft, ChevronDown,
  Play, Pause, RotateCcw, Check, Bot, Timer,
  Activity, Zap,
} from 'lucide-react'

const c = {
  bg:      '#0e1008',
  bg2:     '#151809',
  bg3:     '#1c1f0d',
  bg4:     '#252912',
  lime:    '#EAFF55',
  limeD:   '#b8cc00',
  limeBg:  'rgba(234,255,85,0.10)',
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
  w04:     'rgba(255,255,255,0.04)',
  ink:     '#0a0d00',
}

function DynamicIsland() {
  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      width: 90, height: 26, background: '#000', borderRadius: 50, zIndex: 30,
    }}/>
  )
}

function WorkoutTypeIcon({ tipo, size = 14, color = c.w40 }: { tipo: string; size?: number; color?: string }) {
  if (tipo === 'riposo') return <Clock size={size} color={color} strokeWidth={1.6} />
  if (tipo === 'cardio') return <Activity size={size} color={color} strokeWidth={1.6} />
  return <Dumbbell size={size} color={color} strokeWidth={1.6} />
}

// ── Rest Timer Modal ──────────────────────────────────────────
function RestTimerModal({ seconds, onSkip }: { seconds: number; onSkip: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) { onSkip(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, onSkip])

  const pct = (remaining / seconds) * 100
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 20,
      }}
    >
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>Riposo</div>
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <svg width={96} height={96} viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={48} cy={48} r={r} fill="none" stroke={c.w06} strokeWidth={5} />
          <circle cx={48} cy={48} r={r} fill="none" stroke={c.lime} strokeWidth={5}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 700, color: c.w }}>
            {remaining}
          </span>
        </div>
      </div>
      <motion.div whileTap={{ scale: 0.96 }} onClick={onSkip}
        style={{
          background: c.bg3, borderRadius: 20, padding: '8px 24px',
          border: `1px solid ${c.w10}`, cursor: 'pointer',
          fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40,
        }}>
        Salta
      </motion.div>
    </motion.div>
  )
}

// ── Video Player ──────────────────────────────────────────────
function VideoPlayer({ ex }: { ex: Exercise }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hasVideo = !!ex.video_url
  const isWebP = ex.video_url?.endsWith('.webp') ?? false

  function togglePlay() {
    if (hasVideo && videoRef.current) {
      if (playing) {
        videoRef.current.pause()
        setPlaying(false)
      } else {
        videoRef.current.play()
        setPlaying(true)
      }
      return
    }
    // Fallback mock
    if (playing) {
      clearInterval(ivRef.current!)
      setPlaying(false)
      return
    }
    setPlaying(true)
    let p = progress
    ivRef.current = setInterval(() => {
      p += 1.4
      setProgress(p)
      if (p >= 100) {
        clearInterval(ivRef.current!)
        setPlaying(false)
        setProgress(0)
      }
    }, 120)
  }

  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v || v.duration === 0) return
    setProgress((v.currentTime / v.duration) * 100)
  }

  function handleEnded() {
    setPlaying(false)
    setProgress(0)
  }

  function handleRestart() {
    if (hasVideo && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setPlaying(true)
    } else {
      setProgress(0)
      setPlaying(false)
    }
  }

  useEffect(() => () => clearInterval(ivRef.current!), [])

  return (
    <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', background: c.bg4 }}>
      {/* Video area */}
      <div style={{
        height: 220,
        background: 'linear-gradient(135deg, #2a3a08 0%, #111a04 60%, #080f00 100%)',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {hasVideo && isWebP ? (
          <img
            src={ex.video_url}
            alt={ex.name}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : hasVideo ? (
          <video
            ref={videoRef}
            src={ex.video_url}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            playsInline
            muted
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(234,255,85,0.03) 20px, rgba(234,255,85,0.03) 21px)',
          }}/>
        )}

        {/* Top-left label */}
        <div style={{
          position: 'absolute', top: 8, left: 10, zIndex: 2,
          background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '3px 8px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: playing ? c.terra : c.w40 }}/>
          <span style={{ fontSize: 12, color: c.w60, fontFamily: "'Poppins', sans-serif" }}>{ex.video_label}</span>
        </div>

        {/* Top-right duration */}
        <div style={{
          position: 'absolute', top: 8, right: 10, zIndex: 2,
          background: 'rgba(0,0,0,0.55)', borderRadius: 6, padding: '3px 8px',
        }}>
          <span style={{ fontSize: 12, color: c.w60, fontFamily: "'DM Mono', monospace" }}>{ex.video_duration}</span>
        </div>

        {/* Play/Pause button — hidden for auto-looping WebP */}
        {!isWebP && (
          <motion.div whileTap={{ scale: 0.9 }} onClick={togglePlay}
            style={{
              width: 52, height: 52, borderRadius: '50%', zIndex: 2,
              background: playing ? 'rgba(0,0,0,0.45)' : c.lime,
              border: `2px solid ${playing ? 'rgba(234,255,85,0.5)' : 'transparent'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: playing ? 'blur(4px)' : 'none',
            }}>
            {playing
              ? <Pause size={18} fill={c.lime} color={c.lime} />
              : <Play size={18} fill={c.ink} color={c.ink} style={{ marginLeft: 2 }} />}
          </motion.div>
        )}

        {/* Bottom info */}
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10, zIndex: 2,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: c.w60, fontFamily: "'Poppins', sans-serif", textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{ex.muscle}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: c.lime, fontFamily: "'DM Mono', monospace", textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {ex.sets}×{ex.reps}
          </span>
        </div>
      </div>

      {/* Progress bar — hidden for auto-looping WebP */}
      {!isWebP && (
        <div style={{ height: 2, background: c.w06 }}>
          <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }}
            style={{ height: '100%', background: c.lime }} />
        </div>
      )}

      {/* Controls */}
      <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <motion.div whileTap={{ scale: 0.9 }} onClick={handleRestart} style={{ cursor: 'pointer' }}>
            <RotateCcw size={14} color={c.w40} strokeWidth={1.8} />
          </motion.div>
          <span style={{ fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif" }}>
            {hasVideo ? 'Demo esercizio' : 'Velocità: 1×'}
          </span>
        </div>
        {ex.note && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Bot size={10} color={c.limeD} strokeWidth={1.8} />
            <span style={{ fontSize: 12, color: c.limeD, fontFamily: "'Poppins', sans-serif" }}>Nota tecnica</span>
          </div>
        )}
      </div>

      {/* Coach note */}
      {ex.note && (
        <div style={{
          margin: '0 10px 10px',
          background: c.limeBg2, borderRadius: 8, padding: '8px 10px',
          border: `1px solid rgba(234,255,85,0.1)`,
        }}>
          <span style={{ fontSize: 12, color: c.w60, fontFamily: "'Poppins', sans-serif", lineHeight: 1.5 }}>
            {ex.note}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Set Tracker ───────────────────────────────────────────────
function SetTracker({
  ex, completedSets, onSetDone, onRestStart,
}: {
  ex: Exercise
  completedSets: number
  onSetDone: () => void
  onRestStart: (sec: number) => void
}) {
  function handleSetTap() {
    if (completedSets >= ex.sets) return
    onSetDone()
    if (completedSets + 1 < ex.sets) onRestStart(ex.rest_sec)
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
          Serie
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: c.limeD }}>
          {completedSets}/{ex.sets} completate
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: ex.sets }).map((_, i) => {
          const done = i < completedSets
          const current = i === completedSets
          return (
            <motion.div
              key={i}
              whileTap={current ? { scale: 0.88 } : {}}
              onClick={current ? handleSetTap : undefined}
              style={{
                flex: 1, height: 36, borderRadius: 10,
                background: done ? c.lime : current ? c.limeBg : c.bg4,
                border: `1px solid ${done ? c.lime : current ? 'rgba(234,255,85,0.28)' : c.w06}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: current ? 'pointer' : 'default',
                flexDirection: 'column', gap: 1,
              }}
            >
              {done ? (
                <Check size={14} color={c.ink} strokeWidth={2.5} />
              ) : (
                <>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: current ? c.lime : c.w20 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 7, color: current ? c.limeD : c.w20, fontFamily: "'Poppins', sans-serif" }}>
                    {ex.reps}
                  </span>
                </>
              )}
            </motion.div>
          )
        })}
      </div>
      {completedSets > 0 && completedSets < ex.sets && (
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 5,
          background: c.limeBg2, borderRadius: 8, padding: '5px 10px',
        }}>
          <Timer size={11} color={c.limeD} strokeWidth={1.8} />
          <span style={{ fontSize: 12, color: c.limeD, fontFamily: "'Poppins', sans-serif" }}>
            Riposo: {ex.rest_sec}s tra le serie
          </span>
        </div>
      )}
      {completedSets === ex.sets && (
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', gap: 5,
          background: c.limeBg, borderRadius: 8, padding: '5px 10px',
        }}>
          <Check size={11} color={c.lime} strokeWidth={2.5} />
          <span style={{ fontSize: 12, color: c.limeD, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
            Esercizio completato!
          </span>
        </div>
      )}
    </div>
  )
}

// ── Exercise Card ─────────────────────────────────────────────
function ExerciseCard({
  ex, index, expanded, sessionStarted,
  completedSets, onToggle, onSetDone, onRestStart,
}: {
  ex: Exercise
  index: number
  expanded: boolean
  sessionStarted: boolean
  completedSets: number
  onToggle: () => void
  onSetDone: () => void
  onRestStart: (sec: number) => void
}) {
  const allDone = completedSets >= ex.sets
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.05 }}
      style={{
        background: allDone
          ? `linear-gradient(135deg, rgba(74,107,78,0.35) 0%, rgba(50,80,54,0.4) 100%)`
          : c.bg3,
        borderRadius: 16,
        border: `1px solid ${allDone ? 'rgba(234,255,85,0.22)' : expanded ? 'rgba(234,255,85,0.18)' : c.w06}`,
        marginBottom: 8, overflow: 'hidden',
      }}
    >
      <motion.div whileTap={{ scale: 0.99 }} onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', cursor: 'pointer', gap: 12 }}>
        {/* Index / done badge */}
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: allDone ? c.lime : expanded ? c.limeBg : c.bg4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {allDone
            ? <Check size={14} color={c.ink} strokeWidth={2.5} />
            : <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: expanded ? c.lime : c.w40 }}>{index + 1}</span>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w, marginBottom: 2 }}>
            {ex.name}
          </div>
          <div style={{ fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif" }}>{ex.muscle}</div>
          {!sessionStarted && !expanded && ex.note && (
            <div style={{
              fontSize: 12, color: c.w40, fontFamily: "'Poppins', sans-serif",
              marginTop: 4, lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
            }}>
              {ex.note}
            </div>
          )}
        </div>

        {/* Sets badge + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: allDone ? 'rgba(234,255,85,0.15)' : c.bg4,
            borderRadius: 8, padding: '4px 8px',
          }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: allDone ? c.lime : c.limeD }}>
              {ex.sets}×{ex.reps.split(' ')[0]}
            </span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronDown size={14} color={c.w40} strokeWidth={2} />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 14px' }}>
              {sessionStarted && (
                <SetTracker
                  ex={ex}
                  completedSets={completedSets}
                  onSetDone={onSetDone}
                  onRestStart={onRestStart}
                />
              )}
              <VideoPlayer ex={ex} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Session Timer ─────────────────────────────────────────────
function SessionTimer({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [running])
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const s = String(elapsed % 60).padStart(2, '0')
  return (
    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: c.lime }}>
      {m}:{s}
    </span>
  )
}

// ── Main Screen ───────────────────────────────────────────────
export default function WorkoutScreen() {
  const navigate = useNavigate()
  const { piano, todayIndex } = useAppState()
  const giorno = piano[todayIndex]

  // Build a WorkoutSession from the real plan data
  const session = {
    id: `wk-${giorno.giorno.toLowerCase()}`,
    giorno: giorno.giorno,
    tipo: giorno.tipo_allenamento,
    label: giorno.sessione_label,
    durata_min: giorno.durata_min ?? 60,
    kcal_bonus: giorno.kcal_bonus ?? 180,
    carb_bonus: giorno.tipo_allenamento === 'gambe' ? 40 : 20,
    note_nutri: giorno.note_sessione ?? giorno.note,
    esercizi: (giorno.esercizi ?? []).map((ex, i): Exercise => ({
      id: `ex-${i}`,
      name: ex.nome,
      muscle: ex.muscolo_primario ?? '',
      sets: ex.serie,
      reps: `${ex.reps} rep`,
      rest_sec: ex.recupero_s,
      video_label: ex.muscolo_primario ?? 'Vista laterale',
      video_duration: '8s',
      note: ex.note,
      video_url: exerciseVideoMap[ex.nome],
    })),
  }

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({})
  const [restTimer, setRestTimer] = useState<{ sec: number } | null>(null)

  const totalSets = session.esercizi.reduce((a, e) => a + e.sets, 0)
  const doneSets = Object.values(completedSets).reduce((a, v) => a + v, 0)
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0
  const allDone = progressPct === 100

  function handleSetDone(id: string) {
    setCompletedSets(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  function handleStart() {
    setSessionStarted(true)
    setExpandedId(session.esercizi[0].id)
  }

  function handleComplete() {
    setSessionDone(true)
    setSessionStarted(false)
  }

  return (
    <div style={{
      background: c.bg, height: '100svh',
      display: 'flex', flexDirection: 'column',
      maxWidth: 390, margin: '0 auto', position: 'relative',
    }}>
      <DynamicIsland />
      <StatusBar />

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px 8px', flexShrink: 0,
      }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1.5px solid ${c.w20}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
          <ChevronLeft size={14} color={c.w60} strokeWidth={2} />
        </motion.div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w }}>
            Scheda Allenamento
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
            {session.giorno} · {session.label}
          </div>
        </div>
        {sessionStarted && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: c.limeBg, borderRadius: 20, padding: '4px 10px',
            border: `1px solid rgba(234,255,85,0.25)`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.lime }} />
            <SessionTimer running={sessionStarted} />
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Weekly schedule strip — from real plan */}
        <div style={{ padding: '0 18px 12px' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {piano.map((g, i) => {
              const isToday = i === todayIndex
              return (
                <div key={g.sigla} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '6px 2px', borderRadius: 10,
                  background: isToday ? c.lime : 'transparent',
                }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, color: isToday ? c.ink : c.w40 }}>
                    {g.sigla}
                  </span>
                  <WorkoutTypeIcon tipo={g.tipo_allenamento} size={12} color={isToday ? c.ink : c.w40} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Session overview card */}
        <div style={{ margin: '0 18px 10px' }}>
          <div style={{
            background: 'linear-gradient(145deg, #2e4a08 0%, #1a2d04 40%, #0a1500 80%)',
            borderRadius: 18, padding: '14px 16px',
            border: `1px solid ${sessionStarted ? 'rgba(234,255,85,0.3)' : c.w06}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w }}>
                  {session.label}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 6 }}>
                  {[
                    { icon: <Clock size={11} color={c.w40} strokeWidth={1.6} />, val: `${session.durata_min} min` },
                    { icon: <Dumbbell size={11} color={c.w40} strokeWidth={1.6} />, val: `${session.esercizi.length} esercizi` },
                    { icon: <Flame size={11} color={c.w40} strokeWidth={1.6} />, val: `+${session.kcal_bonus} kcal` },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {s.icon}
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {sessionStarted && (
                <div style={{ textAlign: 'right' as const }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, color: c.lime }}>
                    {progressPct}%
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>completato</div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {sessionStarted && (
              <div style={{ height: 3, background: c.w06, borderRadius: 3, marginBottom: 12 }}>
                <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }}
                  style={{ height: '100%', background: c.lime, borderRadius: 3 }} />
              </div>
            )}

            {/* NUTRI note */}
            <div style={{
              background: c.limeBg2, borderRadius: 10, padding: '8px 12px',
              border: `1px solid rgba(234,255,85,0.1)`,
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <Bot size={13} color={c.limeD} strokeWidth={1.6} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: c.limeD, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>
                {session.note_nutri}
              </span>
            </div>
          </div>
        </div>

        {/* Session complete banner */}
        {sessionDone && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: '0 18px 10px' }}
          >
            <div style={{
              background: `linear-gradient(135deg, rgba(74,107,78,0.5) 0%, rgba(50,80,54,0.6) 100%)`,
              borderRadius: 16, padding: '16px',
              border: `1px solid rgba(234,255,85,0.28)`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: c.lime,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Check size={20} color={c.ink} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: c.w }}>
                  Sessione completata!
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, marginTop: 2 }}>
                  {totalSets} serie · +{session.kcal_bonus} kcal bruciate
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exercises */}
        <div style={{ padding: '0 18px 8px' }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w40, marginBottom: 10, textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
            Esercizi · {session.esercizi.length}
          </div>
          {session.esercizi.map((ex, i) => (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              index={i}
              expanded={expandedId === ex.id}
              sessionStarted={sessionStarted}
              completedSets={completedSets[ex.id] ?? 0}
              onToggle={() => setExpandedId(expandedId === ex.id ? null : ex.id)}
              onSetDone={() => handleSetDone(ex.id)}
              onRestStart={(sec) => setRestTimer({ sec })}
            />
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* Bottom CTA */}
      {!sessionDone && (
        <div style={{ padding: '8px 18px 16px', flexShrink: 0 }}>
          {!sessionStarted ? (
            <motion.div whileTap={{ scale: 0.97 }} onClick={handleStart}
              style={{
                height: 52, borderRadius: 52, background: c.lime,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: 'pointer',
              }}>
              <Zap size={18} fill={c.ink} color={c.ink} strokeWidth={2} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink }}>
                Inizia sessione
              </span>
            </motion.div>
          ) : allDone ? (
            <motion.div whileTap={{ scale: 0.97 }} onClick={handleComplete}
              style={{
                height: 52, borderRadius: 52, background: c.lime,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: 'pointer',
              }}>
              <Check size={18} color={c.ink} strokeWidth={2.5} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink }}>
                Completa sessione
              </span>
            </motion.div>
          ) : (
            <div style={{
              height: 52, borderRadius: 52,
              background: c.bg3, border: `1px solid ${c.w06}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <Activity size={16} color={c.lime} strokeWidth={1.8} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60 }}>
                Sessione in corso · {doneSets}/{totalSets} serie
              </span>
            </div>
          )}
        </div>
      )}

      {/* Rest Timer overlay */}
      <AnimatePresence>
        {restTimer && (
          <RestTimerModal
            seconds={restTimer.sec}
            onSkip={() => setRestTimer(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}

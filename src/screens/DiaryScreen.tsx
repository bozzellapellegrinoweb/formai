import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mockDiaryEntries, type DiaryEntry } from '../lib/mock/diary'
import { MealIcon, Flame, Camera, Bot } from '../components/ui/AppIcons'
import { useAppState, addMeal } from '../lib/appStore'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { c } from '../design/themes'

const ANALYZE_URL = '/api/analyze-meal'


function StreakBadge({ count }: { count: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: c.limeBg, borderRadius: 20, padding: '5px 12px',
      border: `1px solid ${c.limeBg}`,
    }}>
      <Flame size={14} color={c.limeInk} strokeWidth={1.6} />
      <div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: c.limeInk }}>{count}</span>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeInk, marginLeft: 3 }}>giorni di fila</span>
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
            <span style={{ fontSize: 14, color: c.w40, fontFamily: "'Poppins', sans-serif", textTransform: 'capitalize' as const }}>
              {entry.meal_type}
            </span>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: c.w20 }}/>
            <span style={{ fontSize: 14, color: c.w40, fontFamily: "'Poppins', sans-serif" }}>{entry.label}</span>
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w, marginBottom: 3 }}>
            {entry.description}
          </div>
          <div style={{ fontSize: 14, color: c.w40, fontFamily: "'DM Mono', monospace" }}>
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
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: entry.in_linea ? c.limeInk : c.terra }}>
                  NUTRI
                </span>
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60, lineHeight: 1.6 }}>
                {entry.agent_comment}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

type MealType = 'colazione' | 'pranzo' | 'spuntino' | 'cena'

interface MealResult {
  descrizione: string
  kcal: number
  macro: { p: number; c: number; g: number }
  commento: string
}

function guessMealType(): MealType {
  const h = new Date().getHours()
  if (h >= 6 && h < 11) return 'colazione'
  if (h >= 11 && h < 15) return 'pranzo'
  if (h >= 15 && h < 19) return 'spuntino'
  return 'cena'
}

const MEAL_TYPES: { key: MealType; label: string; emoji: string }[] = [
  { key: 'colazione', label: 'Colazione', emoji: '☕' },
  { key: 'pranzo',   label: 'Pranzo',    emoji: '🍽️' },
  { key: 'spuntino', label: 'Spuntino',  emoji: '🍎' },
  { key: 'cena',     label: 'Cena',      emoji: '🌙' },
]

function ResultCard({ result }: { result: MealResult }) {
  return (
    <div style={{
      background: c.limeBg2, border: `1px solid ${c.limeBg}`,
      borderRadius: 12, padding: '14px', marginBottom: 12,
    }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.limeInk, marginBottom: 8 }}>
        {result.descrizione}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: result.commento ? 10 : 0 }}>
        {[['kcal', result.kcal], ['P', result.macro.p + 'g'], ['C', result.macro.c + 'g'], ['G', result.macro.g + 'g']].map(([label, val]) => (
          <div key={String(label)} style={{ textAlign: 'center' as const }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 17, fontWeight: 700, color: c.w }}>{val}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 10, color: c.w40 }}>{label}</div>
          </div>
        ))}
      </div>
      {result.commento && (
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w60, lineHeight: 1.5, marginTop: 8 }}>
          💬 {result.commento}
        </div>
      )}
    </div>
  )
}

function MealTypeSelector({ value, onChange }: { value: MealType; onChange: (v: MealType) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: c.w40, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
        Che pasto è?
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {MEAL_TYPES.map((m) => (
          <motion.div key={m.key} whileTap={{ scale: 0.95 }}
            onClick={() => onChange(m.key)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
              textAlign: 'center' as const,
              background: value === m.key ? c.lime : c.bg3,
              border: `1px solid ${value === m.key ? c.lime : c.w06}`,
              transition: 'all 0.15s',
            }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>{m.emoji}</div>
            <div style={{
              fontFamily: "'Poppins', sans-serif", fontSize: 10, fontWeight: 600,
              color: value === m.key ? c.ink : c.w60,
            }}>
              {m.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function LogModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const [method, setMethod] = useState<'foto' | 'testo' | null>(null)
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>('image/jpeg')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<MealResult | null>(null)
  const [mealType, setMealType] = useState<MealType>(guessMealType())
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchProfile() {
    if (!user) return null
    const { data } = await supabase.from('profiles').select('nome,obiettivo').eq('id', user.id).single()
    return data
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      setImageBase64(dataUrl.split(',')[1])
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  async function analyzePhoto() {
    if (!imageBase64) return
    setAnalyzing(true)
    setError(null)
    try {
      const profile = await fetchProfile()
      const res = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType, profile }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Errore analisi')
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setAnalyzing(false)
    }
  }

  async function analyzeText() {
    if (!text.trim()) return
    setAnalyzing(true)
    setError(null)
    try {
      const profile = await fetchProfile()
      const res = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textDescription: text.trim(), profile }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Errore analisi')
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setAnalyzing(false)
    }
  }

  function saveMeal() {
    if (!result) return
    addMeal({
      tipo: mealType,
      nome: result.descrizione,
      alimenti: [],
      kcal: result.kcal,
      macro: result.macro,
      ricetta: '',
      completato: true,
    })
    setSaved(true)
    setTimeout(onClose, 900)
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ textAlign: 'center' as const }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.limeInk }}>Pasto salvato!</div>
        </div>
      </motion.div>
    )
  }

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
          width: '100%',
          background: '#1a1c0f', borderRadius: '24px 24px 0 0',
          padding: '20px 20px 40px', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }}/>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w, marginBottom: 4 }}>
          Aggiungi pasto
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20 }}>
          NUTRI analizza e stima calorie e macro
        </div>

        {!method && (
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { key: 'foto', title: 'Foto', desc: 'Scatta o scegli dalla libreria' },
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
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w, marginBottom: 3 }}>{m.title}</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{m.desc}</div>
              </motion.div>
            ))}
          </div>
        )}

        {method === 'foto' && (
          <div>
            {/* Hidden file input — NO capture attribute: iOS shows picker with Camera + Library */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!preview ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Camera button */}
                <motion.div whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: c.bg3, borderRadius: 14, border: `2px dashed ${c.w20}`,
                    padding: '28px 20px', textAlign: 'center' as const, cursor: 'pointer',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <Camera size={32} color={c.lime} strokeWidth={1.3} />
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: c.w, marginBottom: 4 }}>
                    Scatta o scegli dalla libreria
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
                    Tocca per aprire la fotocamera o scegliere una foto
                  </div>
                </motion.div>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
                  <img src={preview} alt="pasto" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => { setPreview(null); setImageBase64(null); setResult(null); setError(null) }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 20,
                      padding: '5px 10px', cursor: 'pointer',
                      fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w,
                    }}
                  >↩ Cambia foto</button>
                </div>

                {result && <ResultCard result={result} />}
                {error && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#ff6b6b', marginBottom: 10, textAlign: 'center' as const }}>{error}</div>}

                {!result && (
                  <motion.div whileTap={{ scale: 0.97 }}
                    onClick={analyzing ? undefined : analyzePhoto}
                    style={{
                      height: 48, borderRadius: 48,
                      background: analyzing ? c.bg4 : c.lime,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: analyzing ? 'default' : 'pointer',
                    }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: analyzing ? c.w40 : c.ink }}>
                      {analyzing ? 'NUTRI sta analizzando...' : 'Analizza con NUTRI →'}
                    </span>
                  </motion.div>
                )}

                {result && (
                  <div>
                    <MealTypeSelector value={mealType} onChange={setMealType} />
                    <motion.div whileTap={{ scale: 0.97 }} onClick={saveMeal}
                      style={{
                        height: 48, borderRadius: 48, background: c.lime,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      }}>
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink }}>
                        ✓ Salva come {MEAL_TYPES.find(m => m.key === mealType)?.label}
                      </span>
                    </motion.div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {method === 'testo' && (
          <div>
            <textarea
              placeholder="Es. 150g petto di pollo alla griglia con riso integrale 100g e verdure..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: '100%', minHeight: 90, background: c.bg3,
                border: `1px solid ${c.w06}`, borderRadius: 12,
                padding: '12px 14px', resize: 'none' as const,
                fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w,
                outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
              }}
            />

            {result && <div style={{ marginTop: 12 }}><ResultCard result={result} /></div>}
            {error && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#ff6b6b', margin: '10px 0', textAlign: 'center' as const }}>{error}</div>}

            {!result ? (
              <div style={{ marginTop: 12 }}>
                <MealTypeSelector value={mealType} onChange={setMealType} />
                <motion.div whileTap={{ scale: 0.97 }}
                  onClick={analyzing ? undefined : (text.trim() ? analyzeText : undefined)}
                  style={{
                    height: 48, borderRadius: 48,
                    background: analyzing ? c.bg4 : text.trim() ? c.lime : c.bg4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: (analyzing || !text.trim()) ? 'default' : 'pointer',
                  }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: (analyzing || !text.trim()) ? c.w40 : c.ink }}>
                    {analyzing ? 'NUTRI sta stimando...' : text.trim() ? 'Analizza con NUTRI →' : 'Scrivi cosa hai mangiato'}
                  </span>
                </motion.div>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <MealTypeSelector value={mealType} onChange={setMealType} />
                <motion.div whileTap={{ scale: 0.97 }} onClick={saveMeal}
                  style={{
                    height: 48, borderRadius: 48, background: c.lime,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink }}>
                    ✓ Salva come {MEAL_TYPES.find(m => m.key === mealType)?.label}
                  </span>
                </motion.div>
              </div>
            )}
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
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 2 }}>Oggi loggato</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, color: c.limeInk }}>{kcalConsumate}</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>kcal su {kcalTarget.toLocaleString('it-IT')} target</div>
              </div>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeInk, marginBottom: 6 }}>
                  {pct < 50 ? 'Aggiorna il diario' : pct < 90 ? 'In linea col piano' : 'Target quasi raggiunto'}
                </div>
                <div style={{
                  background: c.limeBg, borderRadius: 20, padding: '3px 10px',
                  border: `1px solid ${c.limeBg}`, display: 'inline-block',
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.limeInk }}>{pct}%</span>
                </div>
              </div>
            </div>
            {/* Macro bar */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'P', val: todayMacros.proteine_consumed, target: todayMacros.proteine, color: c.limeInk },
                { label: 'C', val: todayMacros.carboidrati_consumed, target: todayMacros.carboidrati, color: c.gold },
                { label: 'G', val: todayMacros.grassi_consumed, target: todayMacros.grassi, color: c.terra },
              ].map(m => (
                <div key={m.label} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40 }}>{m.label}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: c.w60 }}>{m.val}/{m.target}g</span>
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
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink }}>
              Logga un pasto
            </span>
          </motion.div>
        </div>

        {/* Entries grouped by day */}
        {Object.entries(grouped).map(([label, entries]) => (
          <div key={label} style={{ padding: '0 18px' }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600,
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

    </div>
  )
}

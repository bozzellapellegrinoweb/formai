import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage } from '../lib/mock/chat'
import { useAuth, getProfile } from '../lib/auth'
import { updateMeal, updateDayMeals, updateWorkout, updateMacroTargets, updateDayNote, updateWorkoutSchedule, getState } from '../lib/appStore'
import { c } from '../design/themes'


function inlineBold(text: string, textColor: string, accentColor: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, pi) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={pi} style={{ fontWeight: 700, color: accentColor }}>{part.slice(2, -2)}</strong>
    }
    return <span key={pi} style={{ color: textColor }}>{part}</span>
  })
}

function renderMarkdown(text: string, textColor: string, accentColor: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 6 }} />)
      i++; continue
    }

    // Table: collect consecutive | lines, skip separator rows (---|)
    if (/^\s*\|/.test(line)) {
      const tableLines: string[] = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        if (!/^\s*\|[\s\-|]+\|/.test(lines[i])) tableLines.push(lines[i])
        i++
      }
      if (tableLines.length > 0) {
        const rows = tableLines.map(l =>
          l.split('|').map(c => c.trim()).filter((_, ci, arr) => ci > 0 && ci < arr.length - 1)
        )
        const isHeader = (idx: number) => idx === 0
        elements.push(
          <div key={key++} style={{ marginBottom: 6, borderRadius: 8, overflow: 'hidden', border: `1px solid ${c.w10}` }}>
            {rows.map((cells, ri) => (
              <div key={ri} style={{
                display: 'flex',
                background: isHeader(ri) ? c.limeBg2 : ri % 2 === 0 ? c.w03 : 'transparent',
              }}>
                {cells.map((cell, ci) => (
                  <div key={ci} style={{
                    flex: 1, padding: '5px 8px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: isHeader(ri) ? 9 : 11,
                    fontWeight: isHeader(ri) ? 700 : 400,
                    color: isHeader(ri) ? accentColor : textColor,
                    borderRight: ci < cells.length - 1 ? `1px solid ${c.w06}` : 'none',
                    textTransform: isHeader(ri) ? 'uppercase' as const : 'none' as const,
                    letterSpacing: isHeader(ri) ? '0.3px' : '0',
                  }}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      }
      continue
    }

    // Bullet point
    if (/^[-•]\s/.test(line)) {
      const rawContent = line.replace(/^[-•]\s/, '')
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 3 }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: accentColor, flexShrink: 0, marginTop: 5 }} />
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, lineHeight: 1.6 }}>
            {inlineBold(rawContent, textColor, accentColor)}
          </span>
        </div>
      )
      i++; continue
    }

    // Normal line
    elements.push(
      <div key={key++} style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, lineHeight: 1.6, marginBottom: 2 }}>
        {inlineBold(line, textColor, accentColor)}
      </div>
    )
    i++
  }

  return elements
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  const textColor = isUser ? c.ink : c.w
  const accentColor = isUser ? c.ink : c.limeInk
  const hasPhoto = !!msg.imageUrl

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 10,
        padding: '0 16px',
      }}
    >
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: c.lime,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
          color: c.ink, fontWeight: 700,
        }}>
          N
        </div>
      )}
      <div style={{
        maxWidth: '76%',
        background: isUser ? c.lime : c.bg3,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: hasPhoto ? 0 : '10px 14px',
        border: isUser ? 'none' : `1px solid ${c.w06}`,
        overflow: 'hidden',
      }}>
        {/* Photo thumbnail */}
        {msg.imageUrl && (
          <img
            src={msg.imageUrl}
            alt="pasto fotografato"
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* Analysis card */}
        {msg.analysis && (
          <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.18)' }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: c.ink, marginBottom: 3 }}>
              🍽 {msg.analysis.descrizione}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(10,13,0,0.55)' }}>
              {msg.analysis.kcal} kcal · P:{msg.analysis.macro.p}g · C:{msg.analysis.macro.c}g · G:{msg.analysis.macro.g}g
            </div>
          </div>
        )}
        {/* Text content — hidden for photo messages */}
        {!hasPhoto && (
          <div>
            {isUser
              ? <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, lineHeight: 1.6, color: textColor }}>{msg.content}</div>
              : renderMarkdown(msg.content, textColor, accentColor)
            }
          </div>
        )}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 14, color: isUser ? 'rgba(10,13,0,0.4)' : c.w40,
          marginTop: hasPhoto ? 0 : 4,
          padding: hasPhoto ? '4px 12px 6px' : '0',
          textAlign: 'right' as const,
          background: hasPhoto ? 'rgba(0,0,0,0.18)' : 'transparent',
        }}>
          {msg.time}
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: c.lime,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, marginRight: 8, color: c.ink, fontWeight: 700,
      }}>
        N
      </div>
      <div style={{
        background: c.bg3, borderRadius: '18px 18px 18px 4px',
        padding: '12px 16px', border: `1px solid ${c.w06}`,
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 5, height: 5, borderRadius: '50%', background: c.limeInk }}
          />
        ))}
      </div>
    </div>
  )
}

const API_URL = '/api/chat'
const CHAT_KEY = 'forma_nutri_chat'

function loadSavedMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const CHAT_MAX = 60

function saveMessages(msgs: ChatMessage[]) {
  // Keep only the most recent CHAT_MAX messages; strip imageUrl (data URLs too large)
  const slim = msgs.slice(-CHAT_MAX).map(m => m.imageUrl ? { ...m, imageUrl: undefined } : m)
  localStorage.setItem(CHAT_KEY, JSON.stringify(slim))
}

function formatDateSep(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Oggi'
  if (d.toDateString() === yesterday.toDateString()) return 'Ieri'
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
}

export default function ChatScreen() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(loadSavedMessages)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) getProfile(user.id).then(p => setProfile(p))
  }, [user])

  useEffect(() => {
    if (messages.length > 0) saveMessages(messages)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])


  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping) return
    const userMsg: ChatMessage = {
      id: Date.now().toString(), role: 'user', content: text,
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString(),
    }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    await callNutri(updatedMessages)
  }

  const callNutri = async (updatedMessages: ChatMessage[]) => {
    setIsTyping(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          profile,
          plan: (() => {
            const state = getState()
            const today = state.piano[state.todayIndex]
            return {
              oggi: {
                label: today?.sessione_label, nota: today?.note,
                kcal_target: today?.kcal_totali, macro_target: today?.macro,
                pasti: today?.pasti?.map(p => ({ tipo: p.tipo, nome: p.nome, kcal: p.kcal, macro: p.macro, completato: p.completato })),
              },
              workout: { label: today?.sessione_label, muscoli: today?.muscoli, durata: today?.durata_min },
            }
          })(),
        }),
      })
      const data = await res.json()
      if (data.actions?.length) {
        for (const action of data.actions) {
          if (action.type === 'update_meal') updateMeal(action.data.tipo, action.data)
          else if (action.type === 'replace_all_meals') { updateDayMeals(action.data.pasti); if (action.data.nota_giorno) updateDayNote(action.data.nota_giorno) }
          else if (action.type === 'update_workout') updateWorkout(action.data)
          else if (action.type === 'update_macro_targets') updateMacroTargets(action.data)
          else if (action.type === 'generate_workout_schedule') updateWorkoutSchedule(action.data)
        }
      }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: data.error ? `⚠️ ${data.error}` : data.content,
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(), role: 'assistant',
        content: '⚠️ Server non raggiungibile.',
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPhotoLoading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const base64 = dataUrl.split(',')[1]
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: file.type, profile }),
      })
      const data = await res.json()
      const r = data.result
      const analysis = r?.descrizione ? { descrizione: r.descrizione, kcal: r.kcal, macro: r.macro } : undefined
      const content = analysis
        ? `Ho fotografato un pasto: ${analysis.descrizione} (${analysis.kcal} kcal, P:${analysis.macro.p}g C:${analysis.macro.c}g G:${analysis.macro.g}g). Come si inserisce nel mio piano di oggi?`
        : 'Ho fotografato un pasto, puoi aiutarmi a stimare le calorie?'
      const userMsg: ChatMessage = {
        id: Date.now().toString(), role: 'user', content,
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
        imageUrl: dataUrl, analysis,
      }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setPhotoLoading(false)
      await callNutri(updatedMessages)
    } catch {
      const fallback: ChatMessage = {
        id: Date.now().toString(), role: 'user',
        content: 'Ho fotografato un pasto, puoi aiutarmi a stimare le calorie?',
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString(),
      }
      const updatedMessages = [...messages, fallback]
      setMessages(updatedMessages)
      setPhotoLoading(false)
      await callNutri(updatedMessages)
    }
  }

  return (
    <div style={{
      background: c.bg,
      position: 'fixed', top: 'env(safe-area-inset-top)', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px 12px', flexShrink: 0,
        background: c.bg2,
        borderBottom: `1px solid ${c.bgLine}`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: c.lime,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.ink,
        }}>
          N
        </div>
        <div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w }}>NUTRI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.limeInk }}/>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeInk }}>Online · AI nutrizionista H24</span>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'scroll', minHeight: 0, WebkitOverflowScrolling: 'touch', paddingTop: 14 }}>

        {/* Empty state */}
        {messages.length === 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '48px 32px 24px', textAlign: 'center',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: c.lime,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, boxShadow: `0 0 0 12px ${c.limeBg}`,
            }}>
              <span style={{ fontSize: 32 }}>🥗</span>
            </div>

            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 800, color: c.w, marginBottom: 8 }}>
              Ciao! Sono NUTRI
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, lineHeight: 1.6, marginBottom: 32 }}>
              Il tuo coach nutrizionale AI, disponibile 24/7.<br/>
              Chiedimi del tuo piano, dei pasti o di come ottimizzare la nutrizione.
            </div>

            {/* Suggested topics */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { emoji: '💪', text: 'Cosa mangio dopo l\'allenamento?' },
                { emoji: '🎯', text: 'Sto rispettando i miei macro oggi?' },
                { emoji: '🍽️', text: 'Puoi rivedere il mio piano alimentare?' },
              ].map((tip) => (
                <motion.div key={tip.text} whileTap={{ scale: 0.97 }}
                  onClick={() => setInput(tip.text)}
                  style={{
                    background: c.bg3, borderRadius: 14, padding: '12px 16px',
                    border: `1px solid ${c.w06}`,
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', textAlign: 'left' as const,
                  }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.emoji}</span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w60 }}>{tip.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1]
          const msgDay = msg.date ? new Date(msg.date).toDateString() : null
          const prevDay = prevMsg?.date ? new Date(prevMsg.date).toDateString() : null
          const showSep = msgDay && msgDay !== prevDay
          return (
            <div key={msg.id}>
              {showSep && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', margin: '4px 0' }}>
                  <div style={{ flex: 1, height: 1, background: c.w06 }} />
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, color: c.w40, flexShrink: 0 }}>
                    {formatDateSep(msg.date!)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: c.w06 }} />
                </div>
              )}
              <MessageBubble msg={msg} />
            </div>
          )
        })}
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={bottomRef} style={{ height: 8 }} />
      </div>

      {/* Quick suggestions */}
      <div style={{
        padding: '8px 16px 6px', flexShrink: 0,
        display: 'flex', gap: 6, overflowX: 'auto',
      }}>
        {['💪 Cosa mangio post-workout?', '📷 Scatta un pasto', '📋 Rivedi piano oggi'].map((s) => (
          <div key={s}
            onClick={() => setInput(s.slice(2).trim())}
            style={{
              background: c.bg3, borderRadius: 20, padding: '6px 12px',
              border: `0.5px solid ${c.limeInk}`, cursor: 'pointer', flexShrink: 0,
              fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeInk,
              whiteSpace: 'nowrap' as const,
            }}>
            {s}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        paddingTop: 6, paddingLeft: 14, paddingRight: 14, paddingBottom: 'var(--nav-h)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Photo button */}
        <motion.div whileTap={{ scale: 0.9 }} onClick={() => !photoLoading && fileRef.current?.click()}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: photoLoading ? c.limeBg : c.bg3,
            border: `1px solid ${photoLoading ? c.lime : c.w06}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: photoLoading ? 'default' : 'pointer', flexShrink: 0,
            transition: 'background 0.2s, border-color 0.2s',
          }}>
          {photoLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ width: 16, height: 16, border: `2px solid ${c.w20}`, borderTopColor: c.lime, borderRadius: '50%' }}
            />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="1.8" strokeLinecap="round">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          )}
        </motion.div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />

        {/* Text input */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: c.bg3, borderRadius: 22,
          border: `1px solid ${c.bgLine}`, padding: '0 14px',
          minHeight: 40,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Chiedi qualcosa a NUTRI..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w,
              padding: '10px 0',
            }}
          />
        </div>

        {/* Send button */}
        <motion.div whileTap={{ scale: 0.9 }} onClick={sendMessage}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: input.trim() ? c.lime : c.bg4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0,
            transition: 'background 0.2s',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? c.ink : c.w40} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </motion.div>
      </div>

    </div>
  )
}

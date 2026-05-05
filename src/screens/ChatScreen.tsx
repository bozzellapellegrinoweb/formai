import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBar from '../components/ui/StatusBar'
import BottomNav from '../components/ui/BottomNav'
import { mockChatMessages, type ChatMessage } from '../lib/mock/chat'
import { updateMeal, updateDayMeals, updateWorkout, updateMacroTargets, updateDayNote, updateWorkoutSchedule } from '../lib/appStore'

const c = {
  bg:     '#0e1008',
  bg2:    '#151809',
  bg3:    '#1c1f0d',
  bg4:    '#252912',
  lime:   '#EAFF55',
  limeD:  '#b8cc00',
  limeBg: 'rgba(234,255,85,0.1)',
  limeBg2:'rgba(234,255,85,0.06)',
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
      position: 'absolute',
      top: 12, left: '50%', transform: 'translateX(-50%)',
      width: 90, height: 26,
      background: '#000', borderRadius: 50, zIndex: 30,
    }}/>
  )
}

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
          <div key={key++} style={{ marginBottom: 6, borderRadius: 8, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.08)` }}>
            {rows.map((cells, ri) => (
              <div key={ri} style={{
                display: 'flex',
                background: isHeader(ri) ? 'rgba(234,255,85,0.08)' : ri % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              }}>
                {cells.map((cell, ci) => (
                  <div key={ci} style={{
                    flex: 1, padding: '5px 8px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: isHeader(ri) ? 9 : 11,
                    fontWeight: isHeader(ri) ? 700 : 400,
                    color: isHeader(ri) ? accentColor : textColor,
                    borderRight: ci < cells.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
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
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, lineHeight: 1.6 }}>
            {inlineBold(rawContent, textColor, accentColor)}
          </span>
        </div>
      )
      i++; continue
    }

    // Normal line
    elements.push(
      <div key={key++} style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, lineHeight: 1.6, marginBottom: 2 }}>
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
  const accentColor = isUser ? c.ink : c.lime

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
          fontSize: 13, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
          color: c.ink, fontWeight: 700,
        }}>
          N
        </div>
      )}
      <div style={{
        maxWidth: '76%',
        background: isUser ? c.lime : c.bg3,
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
        border: isUser ? 'none' : `1px solid ${c.w06}`,
      }}>
        <div>
          {isUser
            ? <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, lineHeight: 1.6, color: textColor }}>{msg.content}</div>
            : renderMarkdown(msg.content, textColor, accentColor)
          }
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12, color: isUser ? 'rgba(10,13,0,0.4)' : c.w40,
          marginTop: 4, textAlign: 'right' as const,
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
        fontSize: 13, marginRight: 8, color: c.ink, fontWeight: 700,
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
            style={{ width: 5, height: 5, borderRadius: '50%', background: c.lime }}
          />
        ))}
      </div>
    </div>
  )
}

const API_URL = 'http://localhost:3001/api/chat'

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()

      // Applica le azioni al piano/workout in tempo reale
      if (data.actions?.length) {
        for (const action of data.actions) {
          if (action.type === 'update_meal') {
            updateMeal(action.data.tipo, action.data)
          } else if (action.type === 'replace_all_meals') {
            updateDayMeals(action.data.pasti)
            if (action.data.nota_giorno) updateDayNote(action.data.nota_giorno)
          } else if (action.type === 'update_workout') {
            updateWorkout(action.data)
          } else if (action.type === 'update_macro_targets') {
            updateMacroTargets(action.data)
          } else if (action.type === 'generate_workout_schedule') {
            updateWorkoutSchedule(action.data)
          }
        }
      }

      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.error ? `⚠️ ${data.error}` : data.content,
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, reply])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Server non raggiungibile. Avvia il server con `npm run server`.',
        time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setIsTyping(false)
    }
  }

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

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px 12px', flexShrink: 0,
        background: 'linear-gradient(135deg, #1a2a06 0%, #0e1800 100%)',
        borderBottom: `1px solid rgba(234,255,85,0.12)`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: c.lime,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink,
        }}>
          N
        </div>
        <div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.w }}>NUTRI</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.lime }}/>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD }}>Online · AI nutrizionista H24</span>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          background: c.limeBg2, borderRadius: 20, padding: '4px 10px',
          border: `1px solid ${c.lime}`,
          borderWidth: 0.5,
        }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: c.limeD }}>claude-sonnet-4-6</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 14 }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
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
              border: `0.5px solid ${c.lime}`, cursor: 'pointer', flexShrink: 0,
              fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.lime,
              whiteSpace: 'nowrap' as const,
            }}>
            {s}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        padding: '6px 14px 20px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Photo button */}
        <motion.div whileTap={{ scale: 0.9 }}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: c.bg3, border: `1px solid ${c.w06}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.w40} strokeWidth="1.8" strokeLinecap="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </motion.div>

        {/* Text input */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: c.bg3, borderRadius: 22,
          border: `1px solid rgba(255,255,255,0.08)`, padding: '0 14px',
          minHeight: 40,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Chiedi qualcosa a NUTRI..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w,
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

      <BottomNav />
    </div>
  )
}

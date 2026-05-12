import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, Plus, MoreHorizontal, Globe } from 'lucide-react'

const c = {
  bg:    '#0e1008',
  bg3:   '#1c1f0d',
  bg4:   '#252912',
  lime:  '#EAFF55',
  w:     '#ffffff',
  w80:   'rgba(255,255,255,0.80)',
  w60:   'rgba(255,255,255,0.60)',
  w40:   'rgba(255,255,255,0.40)',
  w10:   'rgba(255,255,255,0.10)',
  ink:   '#0a0d00',
}

function detectPlatform(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/android/i.test(ua)) return 'android'
  return 'other'
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: c.lime, color: c.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1,
        fontFamily: "'Poppins', sans-serif",
      }}>
        {n}
      </div>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w80, lineHeight: 1.5 }}>
        {text}
      </span>
    </div>
  )
}

function IOSInstructions() {
  return (
    <div>
      <Step n={1} text={
        <>Tocca l&apos;icona <strong style={{ color: c.lime }}>Condividi</strong> <Share size={13} style={{ display:'inline', verticalAlign:'middle' }}/> in basso al Safari</>
      } />
      <Step n={2} text={
        <>Scorri e tocca <strong style={{ color: c.lime }}>&ldquo;Aggiungi a schermata Home&rdquo;</strong> <Plus size={13} style={{ display:'inline', verticalAlign:'middle' }}/></>
      } />
      <Step n={3} text="Premi Aggiungi in alto a destra — l'app apparirà nella schermata Home come un'app nativa." />
    </div>
  )
}

function AndroidInstructions() {
  return (
    <div>
      <Step n={1} text={
        <>Tocca il menu <strong style={{ color: c.lime }}>⋮</strong> <MoreHorizontal size={13} style={{ display:'inline', verticalAlign:'middle' }}/> in alto a destra in Chrome</>
      } />
      <Step n={2} text={
        <>Seleziona <strong style={{ color: c.lime }}>&ldquo;Aggiungi alla schermata Home&rdquo;</strong> o &ldquo;Installa app&rdquo;</>
      } />
      <Step n={3} text="Conferma toccando Aggiungi — l'app si installerà e sarà accessibile come app nativa." />
    </div>
  )
}

function OtherInstructions() {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(234,255,85,0.08)', borderRadius: 10,
        padding: '12px 14px', marginBottom: 14,
      }}>
        <Globe size={18} color={c.lime} />
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w80 }}>
          Apri forma.ai su iPhone o Android per installare l&apos;app con un tap.
        </span>
      </div>
    </div>
  )
}

interface Props {
  onDismiss: () => void
}

export default function InstallPrompt({ onDismiss }: Props) {
  const platform = detectPlatform()
  const [visible, setVisible] = useState(true)

  const dismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 350)
  }

  const title = platform === 'ios'
    ? 'Installa su iPhone'
    : platform === 'android'
    ? 'Installa su Android'
    : 'Installa forma.ai'

  const subtitle = platform === 'other'
    ? 'Per la migliore esperienza, aprila da mobile'
    : 'Aggiungi alla schermata Home per usarla come app nativa — zero browser, massima velocità.'

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.72)',
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed', bottom: 'var(--nav-h)', left: 0, right: 0,
              margin: '0 auto',
              width: '100%', maxWidth: 390,
              background: c.bg3,
              borderRadius: '20px 20px 0 0',
              padding: '0 0 20px',
              zIndex: 101,
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: c.w10, margin: '12px auto 0',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: '20px 20px 0',
            }}>
              <div>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 11, fontWeight: 700,
                  color: c.lime, letterSpacing: '0.8px',
                  textTransform: 'uppercase', marginBottom: 4,
                }}>
                  forma<span style={{ color: c.w40 }}>.ai</span>
                </div>
                <div style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 20, fontWeight: 800, color: c.w, lineHeight: 1.2,
                }}>
                  {title}
                </div>
              </div>
              <button
                onClick={dismiss}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none',
                  borderRadius: '50%', width: 32, height: 32,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0, marginTop: 4,
                }}
              >
                <X size={16} color={c.w60} />
              </button>
            </div>

            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: 12, color: c.w60,
              padding: '6px 20px 20px', lineHeight: 1.5,
            }}>
              {subtitle}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: c.w10, margin: '0 20px 20px' }} />

            {/* Instructions */}
            <div style={{ padding: '0 20px' }}>
              {platform === 'ios' && <IOSInstructions />}
              {platform === 'android' && <AndroidInstructions />}
              {platform === 'other' && <OtherInstructions />}
            </div>

            {/* CTA */}
            <div style={{ padding: '8px 20px 0' }}>
              <button
                onClick={dismiss}
                style={{
                  width: '100%', height: 46,
                  background: c.lime, border: 'none',
                  borderRadius: 50, cursor: 'pointer',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 14, fontWeight: 700, color: c.ink,
                }}
              >
                {platform === 'other' ? 'Capito' : 'Ho capito, lo faccio adesso'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

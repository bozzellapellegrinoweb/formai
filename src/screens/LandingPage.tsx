import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Activity, Dumbbell, TrendingUp, Target, Smartphone, Sparkles, Home, Calendar, User, Settings } from 'lucide-react'

const c = {
  bg:     '#080a02',
  bg2:    '#0e1008',
  bg3:    '#161a06',
  bg4:    '#1e2209',
  lime:   '#EAFF55',
  limeD:  '#b8cc00',
  limeBg: 'rgba(234,255,85,0.08)',
  w:      '#ffffff',
  w80:    'rgba(255,255,255,0.80)',
  w60:    'rgba(255,255,255,0.60)',
  w40:    'rgba(255,255,255,0.40)',
  w20:    'rgba(255,255,255,0.20)',
  w10:    'rgba(255,255,255,0.10)',
  w06:    'rgba(255,255,255,0.06)',
  ink:    '#0a0d00',
}

const FEATURES: { Icon: React.FC<{ size: number; strokeWidth: number; color: string }>; title: string; desc: string; color: string }[] = [
  {
    Icon: Bot,
    title: 'NUTRI — Il tuo coach AI',
    desc: 'Un agente nutrizionale personalizzato basato su Claude. Ti guida ogni giorno: macros, pasti, adattamenti in tempo reale in base al tuo workout.',
    color: '#EAFF55',
  },
  {
    Icon: Activity,
    title: 'Dashboard intelligente',
    desc: 'Macro ring, tracking calorie, calendario allenamenti. Tutto in una schermata. Sai sempre dove sei rispetto al tuo obiettivo.',
    color: '#61DAFB',
  },
  {
    Icon: Dumbbell,
    title: 'Piano workout personalizzato',
    desc: 'Programma Push/Pull/Legs generato su misura. Esercizi con video demo animati, serie, reps e note tecniche.',
    color: '#C4714A',
  },
  {
    Icon: TrendingUp,
    title: 'Tracking del corpo',
    desc: 'Peso, BMI, misure corpo, storico grafico. Vedi la progressione settimana per settimana con dati reali.',
    color: '#3ECF8E',
  },
  {
    Icon: Target,
    title: 'Onboarding su misura',
    desc: 'In 6 step raccogli obiettivi, dati fisici, preferenze alimentari e livello di attività. NUTRI costruisce il piano perfetto per te.',
    color: '#C9A84C',
  },
  {
    Icon: Smartphone,
    title: 'Installabile come app',
    desc: 'PWA nativa: aggiungila alla schermata Home su iPhone o Android. Zero browser, esperienza app al 100%.',
    color: '#BB4EFF',
  },
]

const SCREENS: { label: string; Icon: React.FC<{ size: number; strokeWidth: number }> }[] = [
  { label: 'Splash', Icon: Sparkles },
  { label: 'Home', Icon: Home },
  { label: 'Piano', Icon: Calendar },
  { label: 'NUTRI', Icon: Bot },
  { label: 'Profilo', Icon: User },
  { label: 'Admin', Icon: Settings },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function NavBar({ onCTA }: { onCTA: () => void }) {
  const isMobile = useIsMobile()
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: `${c.bg}cc`, backdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${c.w06}`,
      padding: '0 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60,
    }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 800, color: c.w }}>
        forma<span style={{ color: c.lime }}>.ai</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {!isMobile && (
          <>
            <a href="#features" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60, textDecoration: 'none', fontWeight: 500 }}>Features</a>
            <a href="#screens" style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60, textDecoration: 'none', fontWeight: 500 }}>App</a>
          </>
        )}
        <button
          onClick={onCTA}
          style={{
            background: c.lime, border: 'none', borderRadius: 50,
            padding: isMobile ? '8px 14px' : '8px 20px',
            cursor: 'pointer',
            fontFamily: "'Poppins', sans-serif",
            fontSize: isMobile ? 12 : 13,
            fontWeight: 700, color: c.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {isMobile ? 'Inizia →' : "Apri l'app →"}
        </button>
      </div>
    </nav>
  )
}

function Hero({ onCTA }: { onCTA: () => void }) {
  const isMobile = useIsMobile()
  return (
    <section style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: isMobile ? '100px 20px 60px' : '120px 24px 80px',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(234,255,85,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(234,255,85,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}/>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: isMobile ? 300 : 600, height: isMobile ? 250 : 400,
        background: 'radial-gradient(ellipse, rgba(234,255,85,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ position: 'relative', maxWidth: 780 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: c.limeBg, border: `1px solid rgba(234,255,85,0.2)`,
          borderRadius: 50, padding: '6px 16px', marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.lime, display: 'inline-block' }}/>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.lime, letterSpacing: '0.5px' }}>
            Fitness AI · MVP in sviluppo
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: isMobile ? '42px' : 'clamp(40px, 7vw, 80px)',
          fontWeight: 900, lineHeight: 1.05,
          color: c.w, margin: '0 0 20px',
          letterSpacing: '-2px',
        }}>
          Il tuo coach personale.<br/>
          <span style={{ color: c.lime }}>Alimentato dall'AI.</span>
        </h1>

        <p style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: isMobile ? 15 : 'clamp(16px, 2vw, 20px)',
          color: c.w60, lineHeight: 1.6,
          maxWidth: 580, margin: '0 auto 36px',
        }}>
          forma.ai combina nutrizione personalizzata, piani di allenamento intelligenti e un agente AI sempre disponibile per guidarti verso il tuo obiettivo.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCTA}
            style={{
              height: 52, padding: '0 28px',
              background: c.lime, border: 'none', borderRadius: 50,
              fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 800,
              color: c.ink, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              whiteSpace: 'nowrap',
            }}
          >
            🚀 Inizia ora — è gratis
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="#features"
            style={{
              height: 52, padding: '0 28px',
              background: 'transparent', border: `1px solid ${c.w20}`, borderRadius: 50,
              fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600,
              color: c.w80, cursor: 'pointer', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              whiteSpace: 'nowrap',
            }}
          >
            Scopri le features ↓
          </motion.a>
        </div>

        <div style={{
          display: 'flex', gap: isMobile ? 28 : 48, justifyContent: 'center',
          marginTop: isMobile ? 48 : 72, paddingTop: isMobile ? 32 : 48,
          borderTop: `1px solid ${c.w10}`,
          flexWrap: 'wrap',
        }}>
          {[
            { n: '6', label: 'Schermate native' },
            { n: 'AI', label: 'Coach nutrizionale' },
            { n: '100%', label: 'Gratis in beta' },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? 28 : 36, fontWeight: 900, color: c.lime, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FeatureCard({ Icon, title, desc, color, index }: {
  Icon: React.FC<{ size: number; strokeWidth: number; color: string }>
  title: string; desc: string; color: string; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
      style={{
        background: c.bg3,
        border: `1px solid ${c.w06}`,
        borderRadius: 20, padding: '24px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon size={22} strokeWidth={1.8} color={color} />
      </div>
      <div style={{
        fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700,
        color: c.w, marginBottom: 8, lineHeight: 1.3,
      }}>
        {title}
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60, lineHeight: 1.65 }}>
        {desc}
      </div>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 60, height: 60,
        background: `radial-gradient(circle at top right, ${color}14, transparent 70%)`,
      }}/>
    </motion.div>
  )
}

function Features() {
  const isMobile = useIsMobile()
  return (
    <section id="features" style={{ padding: isMobile ? '60px 16px' : '100px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 56 }}
      >
        <div style={{
          display: 'inline-block',
          fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 700,
          color: c.lime, letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Features
        </div>
        <h2 style={{
          fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 48px)',
          fontWeight: 800, color: c.w, lineHeight: 1.2,
          letterSpacing: '-1px', margin: 0,
        }}>
          Tutto quello che ti serve.<br/>
          <span style={{ color: c.lime }}>In un'unica app.</span>
        </h2>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: isMobile ? 12 : 20,
      }}>
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} Icon={f.Icon} title={f.title} desc={f.desc} color={f.color} index={i} />
        ))}
      </div>
    </section>
  )
}

function Screens({ onCTA }: { onCTA: () => void }) {
  const isMobile = useIsMobile()
  return (
    <section id="screens" style={{
      padding: isMobile ? '60px 16px' : '100px 32px',
      background: `linear-gradient(180deg, ${c.bg} 0%, ${c.bg3} 50%, ${c.bg} 100%)`,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 56 }}
        >
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 11, fontWeight: 700, color: c.lime, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>
            L'app
          </div>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? '28px' : 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: c.w, lineHeight: 1.2, letterSpacing: '-1px', margin: 0 }}>
            6 schermate native.<br/>
            <span style={{ color: c.lime }}>Un'esperienza fluida.</span>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
          {SCREENS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              style={{
                background: c.bg4,
                border: `1px solid ${c.w10}`,
                borderRadius: 12, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <s.Icon size={16} strokeWidth={1.8} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w80 }}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: c.bg4,
            border: `1px solid ${c.w10}`,
            borderRadius: 24, padding: isMobile ? '36px 20px' : '48px 32px',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(234,255,85,0.02) 20px, rgba(234,255,85,0.02) 21px)',
          }}/>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: c.limeBg, border: `1px solid rgba(234,255,85,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={28} strokeWidth={1.6} color={c.lime} />
              </div>
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? 18 : 22, fontWeight: 700, color: c.w, marginBottom: 10 }}>
              Provala adesso sul tuo telefono
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60, marginBottom: 24, maxWidth: 420, margin: '0 auto 24px' }}>
              Apri <strong style={{ color: c.lime }}>forma-ai-e33e5.web.app</strong> da Safari (iPhone) o Chrome (Android) e aggiungila alla schermata Home.
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCTA}
              style={{
                height: 46, padding: '0 24px',
                background: c.lime, border: 'none', borderRadius: 50,
                fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
                color: c.ink, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Apri l'app →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CTA({ onCTA }: { onCTA: () => void }) {
  const isMobile = useIsMobile()
  return (
    <section style={{ padding: isMobile ? '48px 16px 80px' : '80px 32px 120px', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          maxWidth: 680, margin: '0 auto',
          background: c.bg3, border: `1px solid ${c.w10}`,
          borderRadius: 28, padding: isMobile ? '40px 24px' : '64px 48px',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 300,
          background: 'radial-gradient(ellipse, rgba(234,255,85,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? '28px' : 'clamp(28px, 5vw, 52px)', fontWeight: 900, color: c.w, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
            Inizia il tuo percorso<br/>
            <span style={{ color: c.lime }}>oggi stesso.</span>
          </div>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? 14 : 16, color: c.w60, lineHeight: 1.6, marginBottom: 28 }}>
            Registrati gratis, completa l'onboarding in 2 minuti e lascia che NUTRI costruisca il tuo piano personalizzato.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onCTA}
            style={{
              padding: isMobile ? '14px 24px' : '0 40px',
              height: isMobile ? 'auto' : 56,
              background: c.lime, border: 'none', borderRadius: 50,
              fontFamily: "'Poppins', sans-serif", fontSize: isMobile ? 15 : 16, fontWeight: 800,
              color: c.ink, cursor: 'pointer',
              display: 'block', width: isMobile ? '100%' : 'auto',
            }}
          >
            🚀 Crea il tuo account — è gratis
          </motion.button>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 14 }}>
            Nessuna carta di credito · Beta gratuita
          </div>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${c.w06}`,
      padding: '28px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, color: c.w }}>
        forma<span style={{ color: c.lime }}>.ai</span>
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
        © 2026 forma.ai — Tutti i diritti riservati
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
        Powered by <span style={{ color: c.lime }}>Claude AI</span> · Firebase · Supabase
      </div>
    </footer>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const handleCTA = () => navigate('/login')

  return (
    <div style={{
      background: c.bg, color: c.w,
      height: '100%',
      overflowY: 'scroll',
      WebkitOverflowScrolling: 'touch',
    }}>
      <NavBar onCTA={handleCTA} />
      <Hero onCTA={handleCTA} />
      <Features />
      <Screens onCTA={handleCTA} />
      <CTA onCTA={handleCTA} />
      <Footer />
    </div>
  )
}

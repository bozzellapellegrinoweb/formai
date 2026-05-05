import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/ui/StatusBar'

const c = {
  bg:      '#0e1008',
  lime:    '#EAFF55',
  limeBg:  'rgba(234,255,85,0.10)',
  w:       '#ffffff',
  w40:     'rgba(255,255,255,0.40)',
  ink:     '#0a0d00',
}

function DynamicIsland() {
  return (
    <div style={{
      position: 'absolute',
      top: 12, left: '50%', transform: 'translateX(-50%)',
      width: 90, height: 26,
      background: '#000',
      borderRadius: 50,
      zIndex: 30,
    }}/>
  )
}

export default function SplashScreen() {
  const navigate = useNavigate()

  return (
    <div style={{
      background: c.bg,
      height: '100svh',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 390,
      margin: '0 auto',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <DynamicIsland />
      <StatusBar />

      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(150deg, #1e2a00 0%, #141a00 40%, #0d1000 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}>

        {/* Diagonal stripes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(-45deg, transparent, transparent 24px, rgba(122,158,126,0.06) 24px, rgba(122,158,126,0.06) 25px)',
        }}/>

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 220, height: 340,
          background: 'radial-gradient(ellipse, rgba(234,255,85,0.15) 0%, transparent 65%)',
        }}/>

        {/* Figure silhouette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.75, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{
            position: 'absolute',
            bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 170, height: 320,
            background: 'linear-gradient(180deg, rgba(234,255,85,0.25) 0%, rgba(74,107,78,0.18) 60%, transparent 100%)',
            borderRadius: '85px 85px 0 0',
          }}
        />

        {/* Bottom overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(14,16,8,0.96) 60%, #0e1008 100%)',
        }}/>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.35 }}
          >
            {/* Logo */}
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: c.w, marginBottom: 10, letterSpacing: '-0.3px' }}>
              forma<span style={{ color: c.lime }}>.ai</span>
            </div>

            {/* Title */}
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 600, color: c.w, marginBottom: 2 }}>
              Il tuo percorso verso il
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 30, fontWeight: 800, color: c.lime, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
              Successo
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 600, color: c.w, marginBottom: 6 }}>
              inizia con il<br/>tracking quotidiano
            </div>

            {/* Tagline / sottotitolo */}
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 28 }}>
              Allena il corpo. Traccia i progressi. Raggiungi i tuoi obiettivi.
            </div>

            {/* Loader indicator */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 20 }}>
              <div style={{ width: 20, height: 3, borderRadius: 3, background: c.lime }} />
              <div style={{ width: 6, height: 3, borderRadius: 3, background: 'rgba(234,255,85,0.3)' }} />
              <div style={{ width: 6, height: 3, borderRadius: 3, background: 'rgba(234,255,85,0.3)' }} />
            </div>

            {/* CTA pill */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              style={{
                width: '100%', height: 52,
                background: c.lime,
                borderRadius: 50,
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 6px 0 8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38,
                  background: 'rgba(0,0,0,0.22)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={c.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, color: c.ink }}>
                  Inizia ora
                </span>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.18)',
                borderRadius: 50,
                padding: '8px 14px',
                fontSize: 15,
                color: `rgba(10,13,0,0.55)`,
                letterSpacing: '-2px',
              }}>
                &#8250;&#8250;
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

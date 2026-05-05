import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import StatusBar from '../components/ui/StatusBar'
import { Target, Ruler, Dumbbell, Utensils, Check, Flame, HeartPulse, Leaf, Wheat, Milk, Activity, Home as HomeIcon, FlaskConical, Upload, AlertCircle } from 'lucide-react'

const c = {
  bg:      '#0e1008',
  bg3:     '#1c1f0d',
  bg4:     '#252912',
  lime:    '#EAFF55',
  limeD:   '#b8cc00',
  limeBg:  'rgba(234,255,85,0.10)',
  limeBg2: 'rgba(234,255,85,0.06)',
  w:       '#ffffff',
  w80:     'rgba(255,255,255,0.80)',
  w60:     'rgba(255,255,255,0.60)',
  w40:     'rgba(255,255,255,0.40)',
  w20:     'rgba(255,255,255,0.20)',
  w10:     'rgba(255,255,255,0.10)',
  w06:     'rgba(255,255,255,0.06)',
  ink:     '#0a0d00',
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

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '0 24px', marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 3,
          background: i < step ? c.lime : c.w10,
          transition: 'background 0.3s',
        }}/>
      ))}
    </div>
  )
}

function IconBox({ icon }: { icon: React.ReactNode }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: 13,
      background: c.limeBg2,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 10,
    }}>
      {icon}
    </div>
  )
}

function OptionCard({
  selected, onClick, icon, title, desc,
}: {
  selected: boolean; onClick: () => void;
  icon: React.ReactNode; title: string; desc?: string;
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', borderRadius: 14,
        background: selected ? c.limeBg : c.bg3,
        border: `1px solid ${selected ? c.lime : c.w06}`,
        cursor: 'pointer', marginBottom: 8,
      }}>
      <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: c.w }}>{title}</div>
        {desc && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${selected ? c.lime : c.w20}`,
        background: selected ? c.lime : 'transparent',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.ink} strokeWidth="3" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        )}
      </div>
    </motion.div>
  )
}

function CTAButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.div whileTap={{ scale: disabled ? 1 : 0.97 }} onClick={disabled ? undefined : onClick}
      style={{
        height: 52, borderRadius: 52,
        background: disabled ? c.bg4 : c.lime,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        marginTop: 8,
      }}>
      <span style={{
        fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700,
        color: disabled ? c.w40 : c.ink,
      }}>
        {label}
      </span>
    </motion.div>
  )
}

// Step 1: Obiettivo
function StepObiettivo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { key: 'dimagrimento', Icon: Flame, title: 'Dimagrimento', desc: 'Perdere peso e ridurre il grasso corporeo' },
    { key: 'massa', Icon: Dumbbell, title: 'Massa muscolare', desc: 'Aumentare la muscolatura e la forza' },
    { key: 'mantenimento', Icon: HeartPulse, title: 'Mantenimento', desc: 'Stare in forma senza cambiamenti drastici' },
  ]
  return (
    <div>
      <IconBox icon={<Target size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Qual è il tuo obiettivo?
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 24 }}>
        NUTRI creerà un piano su misura per te
      </div>
      {options.map((o) => (
        <OptionCard key={o.key} selected={value === o.key} onClick={() => onChange(o.key)}
          icon={<o.Icon size={18} color={value === o.key ? c.lime : c.w60} strokeWidth={1.6} />}
          title={o.title} desc={o.desc} />
      ))}
    </div>
  )
}

// Step 2: Dati fisici
function StepDatiFisici({
  values, onChange,
}: {
  values: { peso: string; altezza: string; eta: string };
  onChange: (k: string, v: string) => void;
}) {
  const fields = [
    { key: 'peso', label: 'Peso attuale', unit: 'kg', placeholder: 'es. 78' },
    { key: 'altezza', label: 'Altezza', unit: 'cm', placeholder: 'es. 175' },
    { key: 'eta', label: 'Età', unit: 'anni', placeholder: 'es. 28' },
  ]
  return (
    <div>
      <IconBox icon={<Ruler size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        I tuoi dati fisici
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 24 }}>
        Servono per calcolare il tuo fabbisogno calorico esatto
      </div>
      {fields.map((f) => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 5 }}>{f.label}</div>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: c.bg4, borderRadius: 12, border: `1px solid ${c.w06}`,
            overflow: 'hidden',
          }}>
            <input
              type="number"
              placeholder={f.placeholder}
              value={values[f.key as keyof typeof values]}
              onChange={(e) => onChange(f.key, e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500,
                color: c.w, padding: '12px 14px',
              }}
            />
            <span style={{
              fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40,
              paddingRight: 14, flexShrink: 0,
            }}>{f.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Split recommendation engine
function getSplit(freq: number, livello: string): { nome: string; tag: string; desc: string; giorni: string[] } {
  if (freq <= 2) return {
    nome: 'Full Body', tag: 'Consigliato per 2x/sett.',
    desc: 'Ogni sessione allena tutti i gruppi muscolari. Massima frequenza per gruppo (2x/sett.), ideale per principianti e chi ha poco tempo.',
    giorni: freq === 1 ? ['FB'] : ['FB', 'FB'],
  }
  if (freq === 3) return {
    nome: livello === 'avanzato' ? 'Push / Pull / Legs' : 'Full Body',
    tag: livello === 'avanzato' ? 'Ottimo per avanzati 3x' : 'Classico 3x/sett.',
    desc: livello === 'avanzato'
      ? 'Con 3x e alto volume, PPL distribuisce push (petto/spalle/tricipiti), pull (schiena/bicipiti) e gambe in sessioni dedicate.'
      : 'Full Body 3x è la scelta scientificamente più efficace per principianti e intermedi — alta frequenza per gruppo muscolare.',
    giorni: livello === 'avanzato' ? ['Push', 'Pull', 'Legs'] : ['FB', 'FB', 'FB'],
  }
  if (freq === 4) return {
    nome: 'Upper / Lower Split',
    tag: 'Ideale per 4x/sett.',
    desc: 'Lunedì/Giovedì Upper body (petto, schiena, spalle, braccia), Martedì/Venerdì Lower body (gambe, glutei). 2 stimoli/sett. per gruppo.',
    giorni: ['Upper', 'Lower', 'Upper', 'Lower'],
  }
  if (freq === 5) return {
    nome: 'Push / Pull / Legs (PPL)',
    tag: 'Il più efficace per 5x',
    desc: 'Push (petto/spalle/tricipiti), Pull (schiena/bicipiti), Legs + un giorno Upper o Full Body extra. ~2 stimoli/sett. per gruppo.',
    giorni: ['Push', 'Pull', 'Legs', 'Upper', 'Rest'],
  }
  if (freq === 6) return {
    nome: 'PPL × 2 (Arnold Split)',
    tag: 'Alta frequenza 6x',
    desc: 'Push/Pull/Legs ripetuti due volte a settimana. Ogni gruppo muscolare colpito 2x con alto volume totale. Per atleti intermedi/avanzati.',
    giorni: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'],
  }
  return {
    nome: 'PPL × 2 + Full Body',
    tag: 'Elite 7x/sett.',
    desc: 'PPL doppio + un Full Body di recupero attivo. Volume massimo — richiede recupero ottimale, sonno 8h+, nutrition precisa.',
    giorni: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'FB'],
  }
}

// Step 3: Allenamento
function StepAllenamento({
  luogo, frequenza, livello, obiettivoWo,
  onChangeLuogo, onChangeFreq, onChangeLivello, onChangeObiettivoWo,
}: {
  luogo: string; frequenza: number; livello: string; obiettivoWo: string;
  onChangeLuogo: (v: string) => void; onChangeFreq: (v: number) => void;
  onChangeLivello: (v: string) => void; onChangeObiettivoWo: (v: string) => void;
}) {
  const luoghi = [
    { key: 'palestra', Icon: Dumbbell, title: 'Palestra completa', desc: 'Bilanciere, macchine, cavi' },
    { key: 'casa', Icon: HomeIcon, title: 'Home gym', desc: 'Manubri, bilanciere o attrezzatura base' },
    { key: 'bodyweight', Icon: Activity, title: 'Corpo libero', desc: 'Nessuna attrezzatura' },
    { key: 'misto', Icon: Activity, title: 'Misto', desc: 'Palestra + cardio outdoor' },
  ]
  const livelli = [
    { key: 'principiante', label: 'Principiante', sub: '< 6 mesi' },
    { key: 'intermedio', label: 'Intermedio', sub: '1–3 anni' },
    { key: 'avanzato', label: 'Avanzato', sub: '3+ anni' },
  ]
  const obiettivi = [
    { key: 'ipertrofia', label: 'Ipertrofia', sub: 'Massa e volume' },
    { key: 'forza', label: 'Forza', sub: 'Carichi massimali' },
    { key: 'resistenza', label: 'Resistenza', sub: 'Alto rep, circuit' },
    { key: 'dimagrimento', label: 'Definizione', sub: 'Fat loss + tono' },
  ]

  const split = getSplit(frequenza, livello)

  return (
    <div>
      <IconBox icon={<Dumbbell size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 4 }}>
        Il tuo allenamento
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 20 }}>
        NUTRI costruirà il piano giusto per te
      </div>

      {/* Dove ti alleni */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w40, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Dove ti alleni
      </div>
      {luoghi.map((l) => (
        <OptionCard key={l.key} selected={luogo === l.key} onClick={() => onChangeLuogo(l.key)}
          icon={<l.Icon size={18} color={luogo === l.key ? c.lime : c.w60} strokeWidth={1.6} />}
          title={l.title} desc={l.desc} />
      ))}

      {/* Livello */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w40, marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Esperienza in palestra
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {livelli.map((l) => (
          <motion.div key={l.key} whileTap={{ scale: 0.96 }} onClick={() => onChangeLivello(l.key)}
            style={{
              flex: 1, borderRadius: 14, padding: '12px 8px',
              background: livello === l.key ? c.limeBg : c.bg3,
              border: `1px solid ${livello === l.key ? c.lime : c.w06}`,
              cursor: 'pointer', textAlign: 'center' as const,
            }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: livello === l.key ? c.lime : c.w60 }}>{l.label}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 3 }}>{l.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Frequenza */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w40, marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Sessioni a settimana: <span style={{ color: c.limeD }}>{frequenza}×</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[2, 3, 4, 5, 6, 7].map((n) => (
          <motion.div key={n} whileTap={{ scale: 0.9 }} onClick={() => onChangeFreq(n)}
            style={{
              flex: 1, height: 38, borderRadius: 10,
              background: frequenza === n ? c.lime : c.bg4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700,
              color: frequenza === n ? c.ink : c.w40,
            }}>
            {n}
          </motion.div>
        ))}
      </div>

      {/* Obiettivo workout */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w40, marginTop: 16, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Obiettivo in sala pesi
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
        {obiettivi.map((o) => (
          <motion.div key={o.key} whileTap={{ scale: 0.96 }} onClick={() => onChangeObiettivoWo(o.key)}
            style={{
              width: 'calc(50% - 4px)', borderRadius: 12, padding: '10px 12px',
              background: obiettivoWo === o.key ? c.limeBg : c.bg3,
              border: `1px solid ${obiettivoWo === o.key ? c.lime : c.w06}`,
              cursor: 'pointer',
            }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: obiettivoWo === o.key ? c.lime : c.w }}>{o.label}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 2 }}>{o.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Split card — auto-calcolato */}
      {livello && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${frequenza}-${livello}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              marginTop: 18, borderRadius: 16, padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(234,255,85,0.10) 0%, rgba(234,255,85,0.04) 100%)',
              border: '1px solid rgba(234,255,85,0.22)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 800, color: c.lime }}>
                {split.nome}
              </div>
              <div style={{
                background: 'rgba(234,255,85,0.12)', borderRadius: 20, padding: '3px 8px',
                fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, fontWeight: 600,
              }}>
                {split.tag}
              </div>
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.60)', lineHeight: 1.6, marginBottom: 10 }}>
              {split.desc}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
              {split.giorni.map((g, i) => (
                <div key={i} style={{
                  borderRadius: 8, padding: '4px 8px',
                  background: g === 'Rest' ? c.bg4 : 'rgba(234,255,85,0.12)',
                  border: `1px solid ${g === 'Rest' ? c.w06 : 'rgba(234,255,85,0.2)'}`,
                  fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600,
                  color: g === 'Rest' ? c.w40 : c.lime,
                }}>
                  {g === 'Rest' ? '— rest' : g}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

// Step 4: Preferenze alimentari
function StepPreferenze({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const preferenze = [
    { key: 'vegetariano', Icon: Leaf, title: 'Vegetariano' },
    { key: 'vegano', Icon: Leaf, title: 'Vegano' },
    { key: 'glutine', Icon: Wheat, title: 'Senza glutine' },
    { key: 'lattosio', Icon: Milk, title: 'Senza lattosio' },
    { key: 'nessuna', Icon: Check, title: 'Nessuna preferenza specifica' },
  ]
  const toggle = (key: string) => {
    if (key === 'nessuna') { onChange(['nessuna']); return }
    const filtered = values.filter((v) => v !== 'nessuna')
    if (filtered.includes(key)) onChange(filtered.filter((v) => v !== key))
    else onChange([...filtered, key])
  }
  return (
    <div>
      <IconBox icon={<Utensils size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Preferenze alimentari
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 24 }}>
        Scegli tutte le opzioni che ti riguardano
      </div>
      {preferenze.map((p) => (
        <OptionCard key={p.key} selected={values.includes(p.key)} onClick={() => toggle(p.key)}
          icon={<p.Icon size={18} color={values.includes(p.key) ? c.lime : c.w60} strokeWidth={1.6} />}
          title={p.title} />
      ))}
    </div>
  )
}

// Step 5: Analisi del sangue
function StepAnalisiSangue({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const markers = [
    'Glicemia a digiuno', 'Colesterolo totale / HDL / LDL',
    'Trigliceridi', 'Ferritina', 'Vitamina D (25-OH)',
    'Vitamina B12', 'TSH', 'PCR (infiammazione)',
  ]

  return (
    <div>
      <IconBox icon={<FlaskConical size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Analisi del sangue
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 16 }}>
        NUTRI leggerà i tuoi valori e adatterà la dieta ai tuoi bisogni reali
      </div>

      {/* Disclaimer medico */}
      <div style={{
        background: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: '12px 14px',
        border: '1px solid rgba(201,168,76,0.2)', marginBottom: 16,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <AlertCircle size={14} color="#C9A84C" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: '#C9A84C', marginBottom: 4 }}>
            NOTA IMPORTANTE
          </div>
          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            forma.ai <strong style={{ color: 'rgba(255,255,255,0.75)' }}>non è un servizio medico</strong> e non fornisce diagnosi.
            Le raccomandazioni nutrizionali si basano su fonti scientifiche pubbliche:
            <strong style={{ color: 'rgba(255,255,255,0.65)' }}> LARN 2014 (SINU)</strong>,{' '}
            <strong style={{ color: 'rgba(255,255,255,0.65)' }}>CREA Linee Guida 2018</strong>,{' '}
            <strong style={{ color: 'rgba(255,255,255,0.65)' }}>ISSN Position Stands 2017</strong>.
            Consulta sempre il tuo medico per valutazioni cliniche.
          </div>
        </div>
      </div>

      {/* Valori che NUTRI analizza */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Valori che NUTRI interpreta
      </div>
      <div style={{
        background: c.bg3, borderRadius: 12, padding: '12px 14px',
        border: `1px solid ${c.w06}`, marginBottom: 16,
        display: 'flex', flexWrap: 'wrap', gap: 6,
      }}>
        {markers.map((m) => (
          <div key={m} style={{
            background: c.limeBg2, borderRadius: 20, padding: '4px 10px',
            border: '1px solid rgba(234,255,85,0.12)',
          }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD }}>{m}</span>
          </div>
        ))}
      </div>

      {/* Upload area */}
      <label style={{ display: 'block', cursor: 'pointer' }}>
        <input
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <div style={{
          borderRadius: 14, padding: '20px 16px',
          border: `2px dashed ${file ? c.lime : 'rgba(255,255,255,0.14)'}`,
          background: file ? c.limeBg2 : 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          transition: 'all 0.2s',
        }}>
          {file ? (
            <>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={18} color={c.ink} strokeWidth={2.5} />
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.lime }}>
                {file.name}
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
                Tocca per cambiare file
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={16} color={c.w40} strokeWidth={1.8} />
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 600, color: c.w60 }}>
                Carica le tue analisi
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, textAlign: 'center' as const }}>
                JPG, PNG o PDF · Max 10 MB
              </div>
            </>
          )}
        </div>
      </label>
    </div>
  )
}

// Step 6: Piano generato
function StepPianoGenerato() {
  const stats = [
    { label: 'Calorie target', val: '1.840', unit: 'kcal/giorno' },
    { label: 'Proteine', val: '185', unit: 'g/giorno' },
    { label: 'Carboidrati', val: '220', unit: 'g/giorno' },
    { label: 'Grassi', val: '62', unit: 'g/giorno' },
  ]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: c.lime,
            border: `2px solid ${c.lime}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <Check size={28} color={c.ink} strokeWidth={2.2} />
        </motion.div>
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 4, textAlign: 'center' }}>
        Il tuo piano è pronto!
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginBottom: 24, textAlign: 'center' }}>
        NUTRI ha calcolato i tuoi macros personalizzati
      </div>

      <div style={{
        background: c.bg3, borderRadius: 16, padding: '14px 16px',
        border: `1px solid ${c.w06}`, marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.lime }}/>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, fontWeight: 600 }}>
            PIANO PERSONALIZZATO — MASSA MUSCOLARE
          </span>
        </div>
        {stats.map((s) => (
          <div key={s.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingBottom: 8, marginBottom: 8,
            borderBottom: `1px solid ${c.w06}`,
          }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w60 }}>{s.label}</span>
            <div style={{ textAlign: 'right' as const }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: c.w }}>{s.val} </span>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: c.limeBg2, borderRadius: 12, padding: '10px 14px',
        border: `1px solid rgba(234,255,85,0.11)`,
      }}>
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD }}>
          NUTRI adatterà i tuoi macros ogni giorno in base al workout — nei giorni di riposo consumerai ~1.640 kcal.
        </span>
      </div>
    </div>
  )
}

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const totalSteps = 6

  const [obiettivo, setObiettivo] = useState('')
  const [datiFisici, setDatiFisici] = useState({ peso: '', altezza: '', eta: '' })
  const [luogo, setLuogo] = useState('')
  const [livello, setLivello] = useState('')
  const [frequenza, setFrequenza] = useState(4)
  const [obiettivoWo, setObiettivoWo] = useState('')
  const [preferenze, setPreferenze] = useState<string[]>([])
  const [analisiFile, setAnalisiFile] = useState<File | null>(null)

  const canProceed = () => {
    if (step === 1) return obiettivo !== ''
    if (step === 2) return datiFisici.peso !== '' && datiFisici.altezza !== '' && datiFisici.eta !== ''
    if (step === 3) return luogo !== '' && livello !== '' && obiettivoWo !== ''
    if (step === 4) return preferenze.length > 0
    return true
  }

  const handleNext = () => {
    if (!canProceed()) return
    if (step < totalSteps) setStep(step + 1)
    else navigate('/home')
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else navigate('/login')
  }

  const ctaLabel = step === 5
    ? (analisiFile ? 'Continua con analisi' : 'Salta per ora')
    : step === totalSteps ? 'Inizia il percorso →' : 'Continua'

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

      {/* Back button */}
      <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={handleBack}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `1.5px solid ${c.w20}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.w60} strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </motion.div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 0 0', flexShrink: 0 }}>
          <ProgressBar step={step} total={totalSteps} />
        </div>

        <div style={{ flex: 1, padding: '0 24px 24px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <StepObiettivo value={obiettivo} onChange={setObiettivo} />}
              {step === 2 && (
                <StepDatiFisici
                  values={datiFisici}
                  onChange={(k, v) => setDatiFisici((prev) => ({ ...prev, [k]: v }))}
                />
              )}
              {step === 3 && (
                <StepAllenamento
                  luogo={luogo} frequenza={frequenza} livello={livello} obiettivoWo={obiettivoWo}
                  onChangeLuogo={setLuogo} onChangeFreq={setFrequenza}
                  onChangeLivello={setLivello} onChangeObiettivoWo={setObiettivoWo}
                />
              )}
              {step === 4 && <StepPreferenze values={preferenze} onChange={setPreferenze} />}
              {step === 5 && <StepAnalisiSangue file={analisiFile} onChange={setAnalisiFile} />}
              {step === 6 && <StepPianoGenerato />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ padding: '0 24px 32px', flexShrink: 0 }}>
          <CTAButton label={ctaLabel} onClick={handleNext} disabled={!canProceed()} />
          {step === 5 && analisiFile && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={handleNext}
              style={{
                marginTop: 12, textAlign: 'center' as const, cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40,
                textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)',
              }}
            >
              Salta — lo farò in seguito
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

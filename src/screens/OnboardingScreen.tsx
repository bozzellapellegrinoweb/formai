import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Target, Ruler, Dumbbell, Utensils, Check, Flame, HeartPulse, Leaf, Wheat, Milk, Activity, Home as HomeIcon, FlaskConical, Upload, AlertCircle, XCircle, Sparkles, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth, saveOnboarding, savePianoAI, getProfile } from '../lib/auth'
import { setUserFrequenza, saveAIPlan } from '../lib/appStore'
import type { GiornoPiano } from '../lib/mock/plan'
import { c } from '../design/themes'

const TOTAL_STEPS = 9

// ── Shared UI components ─────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '0 24px', marginBottom: 28 }}>
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

function OptionCard({ selected, onClick, icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc?: string;
}) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} onClick={onClick} style={{
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
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 600, color: c.w }}>{title}</div>
        {desc && <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${selected ? c.lime : c.w20}`,
        background: selected ? c.lime : 'transparent',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c.ink} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
      </div>
    </motion.div>
  )
}

function CTAButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.div whileTap={{ scale: disabled ? 1 : 0.97 }} onClick={disabled ? undefined : onClick} style={{
      height: 52, borderRadius: 52,
      background: disabled ? c.bg4 : c.lime,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'default' : 'pointer', marginTop: 8,
    }}>
      <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: disabled ? c.w40 : c.ink }}>
        {label}
      </span>
    </motion.div>
  )
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, color: c.w40, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.6px', ...style }}>
      {children}
    </div>
  )
}

function NumberInput({ label, unit, placeholder, value, onChange }: {
  label: string; unit: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40, marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', background: c.bg4, borderRadius: 12, border: `1px solid ${c.w06}`, overflow: 'hidden' }}>
        <input
          type="number" inputMode="decimal" placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color: c.w, padding: '12px 14px' }}
        />
        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40, paddingRight: 14, flexShrink: 0 }}>{unit}</span>
      </div>
    </div>
  )
}

// ── STEP 1: Obiettivo ────────────────────────────────────────────────────────
function StepObiettivo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const options = [
    { key: 'dimagrimento', Icon: Flame, title: 'Dimagrimento', desc: 'Perdere grasso e migliorare la composizione corporea' },
    { key: 'massa', Icon: Dumbbell, title: 'Massa muscolare', desc: 'Aumentare muscolatura e forza' },
    { key: 'mantenimento', Icon: HeartPulse, title: 'Mantenimento', desc: 'Stare in forma senza cambiamenti drastici' },
    { key: 'benessere', Icon: Leaf, title: 'Benessere generale', desc: 'Energia, salute e qualità della vita' },
  ]
  return (
    <div>
      <IconBox icon={<Target size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Qual è il tuo obiettivo?
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 24 }}>
        NUTRI costruirà tutto intorno a questo
      </div>
      {options.map(o => (
        <OptionCard key={o.key} selected={value === o.key} onClick={() => onChange(o.key)}
          icon={<o.Icon size={18} color={value === o.key ? c.lime : c.w60} strokeWidth={1.6} />}
          title={o.title} desc={o.desc} />
      ))}
    </div>
  )
}

// ── STEP 2: Sesso & Dati fisici ──────────────────────────────────────────────
function StepSessoDati({
  sesso, peso, altezza, eta, pesoTarget,
  onSesso, onPeso, onAltezza, onEta, onPesoTarget,
}: {
  sesso: string; peso: string; altezza: string; eta: string; pesoTarget: string;
  onSesso: (v: string) => void; onPeso: (v: string) => void;
  onAltezza: (v: string) => void; onEta: (v: string) => void; onPesoTarget: (v: string) => void;
}) {
  return (
    <div>
      <IconBox icon={<Ruler size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Sesso e dati fisici
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20 }}>
        Fondamentali per calcolare il fabbisogno calorico esatto
      </div>

      <SectionLabel>Sesso biologico</SectionLabel>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          { key: 'uomo', label: '♂ Uomo' },
          { key: 'donna', label: '♀ Donna' },
        ].map(s => (
          <motion.div key={s.key} whileTap={{ scale: 0.96 }} onClick={() => onSesso(s.key)}
            style={{
              flex: 1, padding: '14px', borderRadius: 14, textAlign: 'center' as const,
              background: sesso === s.key ? c.limeBg : c.bg3,
              border: `1.5px solid ${sesso === s.key ? c.lime : c.w06}`,
              cursor: 'pointer',
            }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: sesso === s.key ? c.lime : c.w60 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <SectionLabel>Misure attuali</SectionLabel>
      <NumberInput label="Peso attuale" unit="kg" placeholder="es. 78" value={peso} onChange={onPeso} />
      <NumberInput label="Altezza" unit="cm" placeholder="es. 175" value={altezza} onChange={onAltezza} />
      <NumberInput label="Età" unit="anni" placeholder="es. 28" value={eta} onChange={onEta} />

      <SectionLabel>Peso target (opzionale)</SectionLabel>
      <NumberInput label="Peso che vuoi raggiungere" unit="kg" placeholder="es. 72" value={pesoTarget} onChange={onPesoTarget} />
    </div>
  )
}

// ── STEP 3: Stile di vita ────────────────────────────────────────────────────
function StepStileVita({ attivita, pasti, sonno, stress, onAttivita, onPasti, onSonno, onStress }: {
  attivita: string; pasti: number; sonno: number; stress: string;
  onAttivita: (v: string) => void; onPasti: (v: number) => void;
  onSonno: (v: number) => void; onStress: (v: string) => void;
}) {
  const attivitaOptions = [
    { key: 'sedentario', title: 'Sedentario', desc: 'Lavoro d\'ufficio, poca mobilità' },
    { key: 'leggero', title: 'Leggero', desc: 'Qualche passeggiata, poca attività' },
    { key: 'moderato', title: 'Moderato', desc: 'In piedi spesso, sali scale, cammini' },
    { key: 'attivo', title: 'Attivo', desc: 'Lavoro fisico o molto movimento' },
  ]
  const stressOptions = [
    { key: 'basso', label: 'Basso 😌' },
    { key: 'medio', label: 'Medio 😐' },
    { key: 'alto', label: 'Alto 😰' },
  ]
  return (
    <div>
      <IconBox icon={<Activity size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Il tuo stile di vita
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20 }}>
        Influenza il calcolo delle calorie fuori dalla palestra
      </div>

      <SectionLabel>Attività quotidiana (fuori palestra)</SectionLabel>
      {attivitaOptions.map(a => (
        <OptionCard key={a.key} selected={attivita === a.key} onClick={() => onAttivita(a.key)}
          icon={<Activity size={16} color={attivita === a.key ? c.lime : c.w60} strokeWidth={1.6} />}
          title={a.title} desc={a.desc} />
      ))}

      <SectionLabel style={{ marginTop: 16 }}>Pasti al giorno: <span style={{ color: c.limeD }}>{pasti}</span></SectionLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[3, 4, 5, 6].map(n => (
          <motion.div key={n} whileTap={{ scale: 0.9 }} onClick={() => onPasti(n)}
            style={{
              flex: 1, height: 42, borderRadius: 10,
              background: pasti === n ? c.lime : c.bg4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700,
              color: pasti === n ? c.ink : c.w40,
            }}>
            {n}
          </motion.div>
        ))}
      </div>

      <SectionLabel>Ore di sonno: <span style={{ color: c.limeD }}>{sonno}h</span></SectionLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[5, 6, 7, 8, 9].map(n => (
          <motion.div key={n} whileTap={{ scale: 0.9 }} onClick={() => onSonno(n)}
            style={{
              flex: 1, height: 42, borderRadius: 10,
              background: sonno === n ? c.lime : c.bg4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700,
              color: sonno === n ? c.ink : c.w40,
            }}>
            {n}
          </motion.div>
        ))}
      </div>

      <SectionLabel>Livello di stress</SectionLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {stressOptions.map(s => (
          <motion.div key={s.key} whileTap={{ scale: 0.96 }} onClick={() => onStress(s.key)}
            style={{
              flex: 1, padding: '12px 8px', borderRadius: 14, textAlign: 'center' as const,
              background: stress === s.key ? c.limeBg : c.bg3,
              border: `1px solid ${stress === s.key ? c.lime : c.w06}`,
              cursor: 'pointer',
            }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: stress === s.key ? c.lime : c.w60 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── STEP 4: Allenamento ──────────────────────────────────────────────────────
function getSplit(freq: number, livello: string): { nome: string; tag: string; desc: string; giorni: string[] } {
  if (freq <= 2) return { nome: 'Full Body', tag: `Consigliato per ${freq}x/sett.`, desc: 'Ogni sessione allena tutti i gruppi muscolari. Alta frequenza per gruppo, ideale per principianti.', giorni: freq === 1 ? ['FB'] : ['FB', 'FB'] }
  if (freq === 3) return { nome: livello === 'avanzato' ? 'Push / Pull / Legs' : 'Full Body', tag: livello === 'avanzato' ? 'Ottimo per avanzati 3x' : 'Classico 3x/sett.', desc: livello === 'avanzato' ? 'PPL: Push (petto/spalle/tricipiti), Pull (schiena/bicipiti), Legs in sessioni dedicate.' : 'Full Body 3x è la scelta più efficace per principianti e intermedi.', giorni: livello === 'avanzato' ? ['Push', 'Pull', 'Legs'] : ['FB', 'FB', 'FB'] }
  if (freq === 4) return { nome: 'Upper / Lower Split', tag: 'Ideale per 4x/sett.', desc: 'Upper body (petto, schiena, spalle, braccia) + Lower body (gambe, glutei). 2 stimoli/sett. per gruppo.', giorni: ['Upper', 'Lower', 'Upper', 'Lower'] }
  if (freq === 5) return { nome: 'Push / Pull / Legs (PPL)', tag: 'Il più efficace per 5x', desc: 'Push + Pull + Legs + un giorno Upper o Full Body. ~2 stimoli/sett. per gruppo.', giorni: ['Push', 'Pull', 'Legs', 'Upper', 'Rest'] }
  if (freq === 6) return { nome: 'PPL × 2 (Arnold Split)', tag: 'Alta frequenza 6x', desc: 'Push/Pull/Legs ripetuti due volte a settimana. Ogni gruppo colpito 2x con alto volume.', giorni: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'] }
  return { nome: 'PPL × 2 + Full Body', tag: 'Elite 7x/sett.', desc: 'Volume massimo — richiede recupero ottimale, sonno 8h+, nutrition precisa.', giorni: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'FB'] }
}

function StepAllenamento({ luogo, frequenza, livello, obiettivoWo, onChangeLuogo, onChangeFreq, onChangeLivello, onChangeObiettivoWo }: {
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
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 4 }}>Il tuo allenamento</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20 }}>Scheda costruita su misura in base alle tue risposte</div>

      <SectionLabel>Dove ti alleni</SectionLabel>
      {luoghi.map(l => (
        <OptionCard key={l.key} selected={luogo === l.key} onClick={() => onChangeLuogo(l.key)}
          icon={<l.Icon size={18} color={luogo === l.key ? c.lime : c.w60} strokeWidth={1.6} />}
          title={l.title} desc={l.desc} />
      ))}

      <SectionLabel style={{ marginTop: 14 }}>Esperienza</SectionLabel>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {livelli.map(l => (
          <motion.div key={l.key} whileTap={{ scale: 0.96 }} onClick={() => onChangeLivello(l.key)}
            style={{ flex: 1, borderRadius: 14, padding: '12px 8px', background: livello === l.key ? c.limeBg : c.bg3, border: `1px solid ${livello === l.key ? c.lime : c.w06}`, cursor: 'pointer', textAlign: 'center' as const }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: livello === l.key ? c.lime : c.w60 }}>{l.label}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 3 }}>{l.sub}</div>
          </motion.div>
        ))}
      </div>

      <SectionLabel>Sessioni a settimana: <span style={{ color: c.limeD }}>{frequenza}×</span></SectionLabel>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[2, 3, 4, 5, 6, 7].map(n => (
          <motion.div key={n} whileTap={{ scale: 0.9 }} onClick={() => onChangeFreq(n)}
            style={{ flex: 1, height: 38, borderRadius: 10, background: frequenza === n ? c.lime : c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 700, color: frequenza === n ? c.ink : c.w40 }}>
            {n}
          </motion.div>
        ))}
      </div>

      <SectionLabel>Focus allenamento</SectionLabel>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
        {obiettivi.map(o => (
          <motion.div key={o.key} whileTap={{ scale: 0.96 }} onClick={() => onChangeObiettivoWo(o.key)}
            style={{ width: 'calc(50% - 4px)', borderRadius: 12, padding: '10px 12px', background: obiettivoWo === o.key ? c.limeBg : c.bg3, border: `1px solid ${obiettivoWo === o.key ? c.lime : c.w06}`, cursor: 'pointer' }}>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: obiettivoWo === o.key ? c.lime : c.w }}>{o.label}</div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40, marginTop: 2 }}>{o.sub}</div>
          </motion.div>
        ))}
      </div>

      {livello && (
        <AnimatePresence mode="wait">
          <motion.div key={`${frequenza}-${livello}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ marginTop: 18, borderRadius: 16, padding: '14px 16px', background: 'linear-gradient(135deg, rgba(234,255,85,0.10) 0%, rgba(234,255,85,0.04) 100%)', border: '1px solid rgba(234,255,85,0.22)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 800, color: c.lime }}>{split.nome}</div>
              <div style={{ background: 'rgba(234,255,85,0.12)', borderRadius: 20, padding: '3px 8px', fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, fontWeight: 600 }}>{split.tag}</div>
            </div>
            <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 10 }}>{split.desc}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
              {split.giorni.map((g, i) => (
                <div key={i} style={{ borderRadius: 8, padding: '4px 8px', background: g === 'Rest' ? c.bg4 : 'rgba(234,255,85,0.12)', border: `1px solid ${g === 'Rest' ? c.w06 : 'rgba(234,255,85,0.2)'}`, fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: g === 'Rest' ? c.w40 : c.lime }}>
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

// ── STEP 5: Alimentazione & Intolleranze ────────────────────────────────────
function StepAlimentazione({ preferenze, intolleranze, onPreferenze, onIntolleranze }: {
  preferenze: string[]; intolleranze: string[];
  onPreferenze: (v: string[]) => void; onIntolleranze: (v: string[]) => void;
}) {
  const prefOptions = [
    { key: 'nessuna', Icon: Check, title: 'Onnivoro (nessuna restrizione)' },
    { key: 'vegetariano', Icon: Leaf, title: 'Vegetariano' },
    { key: 'vegano', Icon: Leaf, title: 'Vegano' },
    { key: 'pescetariano', Icon: Leaf, title: 'Pescetariano' },
    { key: 'mediterranea', Icon: Utensils, title: 'Dieta mediterranea' },
  ]
  const intoOptions = [
    { key: 'glutine', Icon: Wheat, title: 'Intolleranza al glutine / Celiachia' },
    { key: 'lattosio', Icon: Milk, title: 'Intolleranza al lattosio' },
    { key: 'frutta_secca', Icon: AlertCircle, title: 'Allergia frutta a guscio' },
    { key: 'uova', Icon: AlertCircle, title: 'Allergia uova' },
    { key: 'soia', Icon: AlertCircle, title: 'Allergia soia' },
    { key: 'frutti_mare', Icon: AlertCircle, title: 'Allergia frutti di mare' },
  ]

  const togglePref = (key: string) => {
    if (key === 'nessuna') { onPreferenze(['nessuna']); return }
    const filtered = preferenze.filter(v => v !== 'nessuna')
    onPreferenze(filtered.includes(key) ? filtered.filter(v => v !== key) : [...filtered, key])
  }
  const toggleInto = (key: string) => {
    onIntolleranze(intolleranze.includes(key) ? intolleranze.filter(v => v !== key) : [...intolleranze, key])
  }

  return (
    <div>
      <IconBox icon={<Utensils size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>Alimentazione</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20 }}>Preferenze e allergie che NUTRI rispetterà sempre</div>

      <SectionLabel>Stile alimentare</SectionLabel>
      {prefOptions.map(p => (
        <OptionCard key={p.key} selected={preferenze.includes(p.key)} onClick={() => togglePref(p.key)}
          icon={<p.Icon size={18} color={preferenze.includes(p.key) ? c.lime : c.w60} strokeWidth={1.6} />}
          title={p.title} />
      ))}

      <SectionLabel style={{ marginTop: 16 }}>Allergie / Intolleranze</SectionLabel>
      {intoOptions.map(i => (
        <OptionCard key={i.key} selected={intolleranze.includes(i.key)} onClick={() => toggleInto(i.key)}
          icon={<i.Icon size={18} color={intolleranze.includes(i.key) ? c.lime : c.w60} strokeWidth={1.6} />}
          title={i.title} />
      ))}
    </div>
  )
}

// ── STEP 6: Cibi non graditi ─────────────────────────────────────────────────
const CIBI_COMUNI = [
  'Funghi', 'Rucola', 'Radicchio', 'Cime di rapa', 'Finocchio',
  'Pesce azzurro', 'Sardine', 'Sgombro', 'Fegato', 'Frattaglie',
  'Uova', 'Cavolfiore', 'Broccoli', 'Zucchine', 'Melanzane',
  'Tofu', 'Tempeh', 'Seitan', 'Ceci', 'Lenticchie',
  'Ricotta', 'Cottage cheese', 'Maionese', 'Senape', 'Cipolla',
]

function StepCibiNonGraditi({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [inputText, setInputText] = useState(value)

  const tags = value.split(',').map(t => t.trim()).filter(Boolean)

  const addTag = (tag: string) => {
    const existing = value.split(',').map(t => t.trim()).filter(Boolean)
    if (!existing.includes(tag)) {
      const newVal = [...existing, tag].join(', ')
      onChange(newVal)
      setInputText(newVal)
    }
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag)
    const newVal = newTags.join(', ')
    onChange(newVal)
    setInputText(newVal)
  }

  return (
    <div>
      <IconBox icon={<XCircle size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Cosa NON ti piace?
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20 }}>
        NUTRI escluderà sempre questi alimenti dal piano
      </div>

      {/* Input libero */}
      <div style={{ marginBottom: 16 }}>
        <textarea
          placeholder="es. funghi, rucola, pesce azzurro, cozze..."
          value={inputText}
          onChange={e => { setInputText(e.target.value); onChange(e.target.value) }}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box' as const,
            background: c.bg4, border: `1px solid ${c.w10}`, borderRadius: 12,
            padding: '12px 14px', outline: 'none', resize: 'none',
            fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w80,
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Chip selezionabili rapidi */}
      <SectionLabel>Tocca per aggiungere rapidamente</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
        {CIBI_COMUNI.map(cibo => {
          const isSelected = tags.some(t => t.toLowerCase() === cibo.toLowerCase())
          return (
            <motion.div key={cibo} whileTap={{ scale: 0.94 }}
              onClick={() => isSelected ? removeTag(cibo) : addTag(cibo)}
              style={{
                borderRadius: 20, padding: '6px 12px',
                background: isSelected ? c.limeBg : c.bg3,
                border: `1px solid ${isSelected ? c.lime : c.w10}`,
                cursor: 'pointer',
                fontFamily: "'Poppins', sans-serif", fontSize: 13,
                color: isSelected ? c.lime : c.w60,
                fontWeight: isSelected ? 600 : 400,
              }}>
              {isSelected && '✓ '}{cibo}
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, background: c.limeBg2, borderRadius: 10, padding: '10px 14px', border: `1px solid rgba(234,255,85,0.12)` }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.limeD }}>
          💡 Più dettagli dai, più il piano sarà su misura per te
        </div>
      </div>
    </div>
  )
}

// ── STEP 7: Analisi del sangue ───────────────────────────────────────────────
function StepAnalisiSangue({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) {
  const markers = ['Glicemia a digiuno', 'Colesterolo totale / HDL / LDL', 'Trigliceridi', 'Ferritina', 'Vitamina D (25-OH)', 'Vitamina B12', 'TSH', 'PCR (infiammazione)']
  return (
    <div>
      <IconBox icon={<FlaskConical size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>Analisi del sangue</div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 16 }}>Opzionale — NUTRI le leggerà per affinare il piano</div>

      <div style={{ background: 'rgba(201,168,76,0.08)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(201,168,76,0.2)', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <AlertCircle size={14} color="#C9A84C" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
          forma.ai <strong style={{ color: 'rgba(255,255,255,0.75)' }}>non è un servizio medico</strong>. Le raccomandazioni si basano su LARN 2014 (SINU), CREA 2018, ISSN 2017. Consulta il tuo medico per valutazioni cliniche.
        </div>
      </div>

      <div style={{ background: c.bg3, borderRadius: 12, padding: '12px 14px', border: `1px solid ${c.w06}`, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {markers.map(m => (
          <div key={m} style={{ background: c.limeBg2, borderRadius: 20, padding: '4px 10px', border: '1px solid rgba(234,255,85,0.12)' }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD }}>{m}</span>
          </div>
        ))}
      </div>

      <label style={{ display: 'block', cursor: 'pointer' }}>
        <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => onChange(e.target.files?.[0] ?? null)} />
        <div style={{ borderRadius: 14, padding: '20px 16px', border: `2px dashed ${file ? c.lime : 'rgba(255,255,255,0.14)'}`, background: file ? c.limeBg2 : 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
          {file ? (
            <>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={18} color={c.ink} strokeWidth={2.5} /></div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.lime }}>{file.name}</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>Tocca per cambiare</div>
            </>
          ) : (
            <>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Upload size={16} color={c.w40} strokeWidth={1.8} /></div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w60 }}>Carica le tue analisi</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>JPG, PNG o PDF · Max 10 MB</div>
            </>
          )}
        </div>
      </label>
    </div>
  )
}

// ── STEP 8: Vecchia dieta ─────────────────────────────────────────────────────
type DietAnalisi = {
  titolo: string
  consulenza: string
  punti_critici: string[]
  punti_positivi: string[]
  macro_stimati: { kcal: number; proteine_g: number; carboidrati_g: number; grassi_g: number }
}

function StepVecchiaDieta({
  file, onChange, analisi, isAnalyzing, onAnalyze, error,
}: {
  file: File | null
  onChange: (f: File | null) => void
  analisi: DietAnalisi | null
  isAnalyzing: boolean
  onAnalyze: () => void
  error: string | null
}) {
  return (
    <div>
      <IconBox icon={<Sparkles size={20} color={c.lime} strokeWidth={1.6} />} />
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: c.w, marginBottom: 6 }}>
        Hai già una dieta?
      </div>
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 20, lineHeight: 1.6 }}>
        Opzionale — carica il tuo piano alimentare attuale e NUTRI lo analizzerà per costruire qualcosa di meglio, su misura per te.
      </div>

      {/* Upload area */}
      {!analisi && (
        <label style={{ display: 'block', cursor: 'pointer', marginBottom: 16 }}>
          <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
            onChange={e => onChange(e.target.files?.[0] ?? null)} />
          <div style={{
            borderRadius: 14, padding: '20px 16px',
            border: `2px dashed ${file ? c.lime : 'rgba(255,255,255,0.14)'}`,
            background: file ? c.limeBg2 : 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.2s',
          }}>
            {file ? (
              <>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={18} color={c.ink} strokeWidth={2.5} />
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.limeInk }}>{file.name}</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>Tocca per cambiare</div>
              </>
            ) : (
              <>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={16} color={c.w40} strokeWidth={1.8} />
                </div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w60 }}>Foto o PDF della tua dieta</div>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>JPG, PNG o PDF · Max 10 MB</div>
              </>
            )}
          </div>
        </label>
      )}

      {/* Analyze button — visible after upload, before analysis */}
      {file && !analisi && (
        <motion.div whileTap={{ scale: 0.97 }} onClick={onAnalyze}
          style={{
            height: 52, borderRadius: 52,
            background: isAnalyzing ? c.bg3 : c.lime,
            border: isAnalyzing ? `1px solid ${c.bgLine}` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, cursor: isAnalyzing ? 'default' : 'pointer',
            marginBottom: 8,
          }}>
          {isAnalyzing ? (
            <>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `2px solid ${c.w20}`, borderTopColor: c.lime,
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: c.w40 }}>
                NUTRI sta analizzando...
              </span>
            </>
          ) : (
            <>
              <Sparkles size={16} color={c.ink} strokeWidth={2} />
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 700, color: c.ink }}>
                Analizza la mia dieta
              </span>
            </>
          )}
        </motion.div>
      )}

      {error && (
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: '#ff6b6b', marginTop: 8 }}>{error}</div>
      )}

      {/* Consultation result */}
      {analisi && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div style={{
            background: c.limeBg2, border: `1px solid ${c.limeBg}`,
            borderRadius: '14px 14px 0 0', padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Sparkles size={14} color={c.limeInk} strokeWidth={2} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: c.limeInk }}>
              {analisi.titolo}
            </span>
          </div>

          {/* Consulenza text */}
          <div style={{
            background: c.bg2, border: `1px solid ${c.bgLine}`, borderTop: 'none',
            padding: '14px',
          }}>
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w70, lineHeight: 1.7, margin: 0, marginBottom: 14 }}>
              {analisi.consulenza}
            </p>

            {/* Macro estratti */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { l: 'KCAL', v: analisi.macro_stimati.kcal, u: '' },
                { l: 'PROT', v: analisi.macro_stimati.proteine_g, u: 'g' },
                { l: 'CARB', v: analisi.macro_stimati.carboidrati_g, u: 'g' },
                { l: 'GRASSI', v: analisi.macro_stimati.grassi_g, u: 'g' },
              ].map(m => (
                <div key={m.l} style={{
                  flex: 1, background: c.bg3, borderRadius: 10, padding: '8px 4px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  border: `1px solid ${c.bgLine}`,
                }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 700, color: c.w }}>{m.v}<span style={{ fontSize: 9, color: c.w40 }}>{m.u}</span></span>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 9, color: c.w40, letterSpacing: '0.06em' }}>{m.l}</span>
                </div>
              ))}
            </div>

            {/* Punti critici */}
            {analisi.punti_critici.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                {analisi.punti_critici.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <TrendingDown size={13} color="#fb923c" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w60, lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Punti positivi */}
            {analisi.punti_positivi.length > 0 && (
              <div>
                {analisi.punti_positivi.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <TrendingUp size={13} color={c.limeInk} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w60, lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            background: c.bg3, border: `1px solid ${c.bgLine}`, borderTop: 'none',
            borderRadius: '0 0 14px 14px', padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Check size={12} color={c.limeInk} strokeWidth={2.5} />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>
              Questa analisi verrà integrata nel tuo piano personalizzato
            </span>
          </div>

          {/* Reset */}
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => { onChange(null) }}
            style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer' }}>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40 }}>Carica un'altra dieta</span>
          </motion.div>
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── STEP 9: Generazione piano ─────────────────────────────────────────────────
const GENERATION_PHASES_BASE = [
  { label: 'Analizzo il tuo profilo completo...', duration: 4000 },
  { label: 'Calcolo il fabbisogno calorico (Mifflin-St Jeor)...', duration: 6000 },
  { label: 'Genero il piano alimentare settimanale...', duration: 25000 },
  { label: 'Creo la scheda di allenamento su misura...', duration: 25000 },
  { label: 'Verifico macros e bilanciamento nutrizionale...', duration: 18000 },
  { label: 'Ottimizzazione finale...', duration: 12000 },
]
const GENERATION_PHASES_WITH_DIETA = [
  { label: 'Integro l\'analisi della tua vecchia dieta...', duration: 5000 },
  ...GENERATION_PHASES_BASE,
]

function StepGenerazione({
  isGenerating, isDone, error, generatedData, onGenerate, hasDietaAnalisi,
}: {
  isGenerating: boolean
  isDone: boolean
  error: string | null
  generatedData: { piano: GiornoPiano[]; macros_target: Record<string, number> } | null
  onGenerate: () => void
  hasDietaAnalisi?: boolean
}) {
  const GENERATION_PHASES = hasDietaAnalisi ? GENERATION_PHASES_WITH_DIETA : GENERATION_PHASES_BASE
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isGenerating) return
    setPhaseIdx(0)
    setProgress(0)

    let phase = 0
    let phaseProgress = 0
    const totalDuration = GENERATION_PHASES.reduce((a, p) => a + p.duration, 0)
    let elapsed = 0

    timerRef.current = setInterval(() => {
      elapsed += 80
      phaseProgress += 80

      const currentPhaseDuration = GENERATION_PHASES[phase]?.duration ?? 3000
      if (phaseProgress >= currentPhaseDuration && phase < GENERATION_PHASES.length - 1) {
        phase++
        phaseProgress = 0
        setPhaseIdx(phase)
      }

      const prog = Math.min(92, (elapsed / totalDuration) * 100)
      setProgress(prog)
    }, 80)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isGenerating])

  useEffect(() => {
    if (isDone) {
      if (timerRef.current) clearInterval(timerRef.current)
      setProgress(100)
      setPhaseIdx(GENERATION_PHASES.length - 1)
    }
  }, [isDone])

  if (isDone && generatedData) {
    const mt = generatedData.macros_target
    const stats = [
      { label: 'Calorie giorno attivo', val: mt.kcal_allenamento, unit: 'kcal' },
      { label: 'Calorie giorno riposo', val: mt.kcal_riposo, unit: 'kcal' },
      { label: 'Proteine', val: mt.proteine_g, unit: 'g/giorno' },
      { label: 'Carboidrati (attivo)', val: mt.carboidrati_allenamento_g, unit: 'g' },
      { label: 'Grassi', val: mt.grassi_g, unit: 'g/giorno' },
    ]
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            style={{ width: 64, height: 64, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={28} color={c.ink} strokeWidth={2.2} />
          </motion.div>
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: c.w, marginBottom: 4, textAlign: 'center' }}>Piano generato! 🎉</div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, marginBottom: 24, textAlign: 'center' }}>
          NUTRI ha creato il tuo piano personalizzato al 100%
        </div>
        <div style={{ background: c.bg3, borderRadius: 16, padding: '14px 16px', border: `1px solid ${c.w06}`, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.lime }}/>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.limeD, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              I TUOI MACROS PERSONALIZZATI
            </span>
          </div>
          {stats.map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${c.w06}` }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w60 }}>{s.label}</span>
              <div style={{ textAlign: 'right' as const }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, fontWeight: 600, color: c.lime }}>{s.val} </span>
                <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: c.w40 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: c.limeBg2, borderRadius: 12, padding: '10px 14px', border: `1px solid rgba(234,255,85,0.11)` }}>
          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.limeD }}>
            ✓ Piano pasti 7 giorni · ✓ Scheda allenamento · ✓ Macros ciclici
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, color: '#ff6b6b', marginBottom: 8 }}>Errore nella generazione</div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: c.w40, marginBottom: 20 }}>{error}</div>
        <CTAButton label="Riprova" onClick={onGenerate} />
      </div>
    )
  }

  if (!isGenerating && !isDone) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: c.limeBg, border: `2px solid rgba(234,255,85,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32 }}>🤖</span>
          </div>
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: c.w, textAlign: 'center', marginBottom: 8 }}>
          Tutto pronto!
        </div>
        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w40, textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>
          NUTRI analizzerà il tuo profilo e genererà un piano alimentare e fitness completamente personalizzato in 15–30 secondi.
        </div>
        <div style={{ background: c.bg3, borderRadius: 14, padding: '14px 16px', border: `1px solid ${c.w06}`, marginBottom: 20 }}>
          {['Piano pasti 7 giorni con ricette e grammature', 'Scheda allenamento su misura', 'Macros personalizzati calcolati scientificamente', 'Piano adattato ai tuoi gusti e intolleranze'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < 3 ? 10 : 0, marginBottom: i < 3 ? 10 : 0, borderBottom: i < 3 ? `1px solid ${c.w06}` : 'none' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} color={c.ink} strokeWidth={3} />
              </div>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.w80 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Loading state
  const currentPhase = GENERATION_PHASES[phaseIdx]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 80, height: 80 }}>
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(234,255,85,0.12)" strokeWidth="4"/>
            <motion.circle
              cx="40" cy="40" r="36" fill="none" stroke={c.lime} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
              style={{ transformOrigin: '40px 40px', rotate: -90 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 36 * (1 - progress / 100) }}
              transition={{ duration: 0.3 }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 700, color: c.lime }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, fontWeight: 700, color: c.w, textAlign: 'center', marginBottom: 8 }}>
        Generazione in corso...
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phaseIdx}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          style={{ fontFamily: "'Poppins', sans-serif", fontSize: 14, color: c.limeD, textAlign: 'center', marginBottom: 32 }}
        >
          {currentPhase?.label}
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GENERATION_PHASES.slice(0, phaseIdx + 1).map((phase, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: i < phaseIdx ? c.lime : 'rgba(234,255,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i < phaseIdx ? <Check size={10} color={c.ink} strokeWidth={3} /> : <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.lime }} />}
            </div>
            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, color: i < phaseIdx ? c.w40 : c.w60 }}>{phase.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── Main OnboardingScreen ────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [generatedData, setGeneratedData] = useState<{ piano: GiornoPiano[]; macros_target: Record<string, number> } | null>(null)

  // Form state
  const [obiettivo, setObiettivo] = useState('')
  const [sesso, setSesso] = useState('')
  const [peso, setPeso] = useState('')
  const [altezza, setAltezza] = useState('')
  const [eta, setEta] = useState('')
  const [pesoTarget, setPesoTarget] = useState('')
  const [attivitaExtra, setAttivitaExtra] = useState('')
  const [pastiGiorno, setPastiGiorno] = useState(4)
  const [oreSonno, setOreSonno] = useState(7)
  const [livelloStress, setLivelloStress] = useState('')
  const [luogo, setLuogo] = useState('')
  const [livello, setLivello] = useState('')
  const [frequenza, setFrequenza] = useState(4)
  const [obiettivoWo, setObiettivoWo] = useState('')
  const [preferenze, setPreferenze] = useState<string[]>([])
  const [intolleranze, setIntolleranze] = useState<string[]>([])
  const [cibiNonGraditi, setCibiNonGraditi] = useState('')
  const [analisiFile, setAnalisiFile] = useState<File | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [dietaFile, setDietaFile] = useState<File | null>(null)
  const [dietaAnalisi, setDietaAnalisi] = useState<DietAnalisi | null>(null)
  const [isAnalyzingDieta, setIsAnalyzingDieta] = useState(false)
  const [dietaAnalisiError, setDietaAnalisiError] = useState<string | null>(null)

  // Pre-fill form from existing Supabase profile (rigenera flow)
  useEffect(() => {
    if (!user || profileLoaded) return
    getProfile(user.id).then(p => {
      if (!p) return
      setProfileLoaded(true)
      if (p.obiettivo) setObiettivo(p.obiettivo)
      if (p.sesso) setSesso(p.sesso)
      if (p.peso_kg) setPeso(String(p.peso_kg))
      if (p.altezza_cm) setAltezza(String(p.altezza_cm))
      if (p.eta) setEta(String(p.eta))
      if (p.peso_target_kg) setPesoTarget(String(p.peso_target_kg))
      // attivitaExtra (sedentario/leggero/moderato/attivo) non è salvata nel DB — l'utente la riselezionerà
      if (p.pasti_al_giorno) setPastiGiorno(p.pasti_al_giorno)
      if (p.ore_sonno) setOreSonno(p.ore_sonno)
      if (p.livello_stress) setLivelloStress(p.livello_stress)
      if (p.luogo_allenamento) setLuogo(p.luogo_allenamento)
      if (p.livello_attivita) setLivello(p.livello_attivita) // training level: principiante/intermedio/avanzato
      if (p.frequenza_allenamento) setFrequenza(p.frequenza_allenamento)
      if (p.obiettivo_workout) setObiettivoWo(p.obiettivo_workout)
      if (p.preferenze_alimentari?.length) setPreferenze(p.preferenze_alimentari)
      if (p.intolleranze?.length) setIntolleranze(p.intolleranze)
      if (p.cibi_non_graditi) setCibiNonGraditi(p.cibi_non_graditi)
    })
  }, [user, profileLoaded])

  const analyzeDieta = async () => {
    if (!dietaFile || isAnalyzingDieta) return
    setIsAnalyzingDieta(true)
    setDietaAnalisiError(null)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(dietaFile)
      })
      const mediaType = dietaFile.type as 'image/jpeg' | 'image/png' | 'application/pdf'
      const profile = {
        obiettivo, sesso, eta: parseInt(eta) || null, peso_kg: parseFloat(peso) || null,
        frequenza_allenamento: frequenza, luogo_allenamento: luogo,
        livello_attivita: livello, obiettivo_workout: obiettivoWo,
        preferenze_alimentari: preferenze, intolleranze,
      }
      const res = await fetch('https://api-7sydqvaalq-ew.a.run.app/analyze-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType, profile }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Errore analisi dieta')
      setDietaAnalisi(data.result)
    } catch (e: unknown) {
      setDietaAnalisiError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setIsAnalyzingDieta(false)
    }
  }

  // Reset analisi when file changes
  const handleDietaFileChange = (f: File | null) => {
    setDietaFile(f)
    setDietaAnalisi(null)
    setDietaAnalisiError(null)
  }

  const canProceed = () => {
    if (step === 1) return obiettivo !== ''
    if (step === 2) return sesso !== '' && peso !== '' && altezza !== '' && eta !== ''
    if (step === 3) return attivitaExtra !== '' && livelloStress !== ''
    if (step === 4) return luogo !== '' && livello !== '' && obiettivoWo !== ''
    if (step === 5) return preferenze.length > 0
    if (step === 6) return true // cibi non graditi is optional
    if (step === 7) return true // analisi sangue optional
    if (step === 8) return true // vecchia dieta optional
    if (step === 9) return isDone
    return true
  }

  const generatePlan = async () => {
    if (!user) return
    setIsGenerating(true)
    setGenError(null)
    setIsDone(false)

    const profile = {
      sesso, obiettivo,
      peso_kg: parseFloat(peso) || null,
      altezza_cm: parseInt(altezza) || null,
      eta: parseInt(eta) || null,
      peso_target_kg: parseFloat(pesoTarget) || null,
      livello_attivita: livello,
      luogo_allenamento: luogo,
      frequenza_allenamento: frequenza,
      obiettivo_workout: obiettivoWo,
      pasti_al_giorno: pastiGiorno,
      ore_sonno: oreSonno,
      livello_stress: livelloStress,
      preferenze_alimentari: preferenze,
      intolleranze,
      cibi_non_graditi: cibiNonGraditi,
    }

    const fnUrl = 'https://api-7sydqvaalq-ew.a.run.app/generate-plan'
    const maxRetries = 2
    let lastError = ''

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Delay crescente prima di ogni retry
          await new Promise(r => setTimeout(r, 3000 * attempt))
        }

        // AbortController con 100s timeout — claude-3-5-sonnet richiede ~60-80s
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 100000)

        // Build dieta_analisi context string if available
        const dietaContext = dietaAnalisi
          ? `Consulenza vecchia dieta: ${dietaAnalisi.consulenza}\nProblemi critici: ${dietaAnalisi.punti_critici.join('; ')}\nPunti positivi: ${dietaAnalisi.punti_positivi.join('; ')}\nMacro stimati vecchia dieta: kcal=${dietaAnalisi.macro_stimati.kcal}, prot=${dietaAnalisi.macro_stimati.proteine_g}g, carb=${dietaAnalisi.macro_stimati.carboidrati_g}g, grassi=${dietaAnalisi.macro_stimati.grassi_g}g`
          : undefined

        let res: Response
        try {
          res = await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile, dieta_analisi: dietaContext }),
            signal: controller.signal,
          })
        } finally {
          clearTimeout(timeoutId)
        }

        const data = await res.json()
        // 504 = server timeout → riprova (non mostrare errore subito)
        if (res.status === 504) throw new Error('__retry__')
        if (!res.ok || !data.ok) throw new Error(data.error || 'Errore generazione piano')

        // Save to localStorage for immediate use
        saveAIPlan(data.piano, data.macros_target)
        // Save to Supabase in background
        savePianoAI(user.id, data.piano, data.macros_target)

        setGeneratedData({ piano: data.piano, macros_target: data.macros_target })
        setIsDone(true)
        setIsGenerating(false)
        return // success
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Errore sconosciuto'
        const isAbort = e instanceof Error && e.name === 'AbortError'
        const is504 = msg === '__retry__'
        const isNetwork = isAbort || is504
          || msg.toLowerCase().includes('load failed')
          || msg.toLowerCase().includes('network')
          || msg.toLowerCase().includes('failed to fetch')
        lastError = (isAbort || is504)
          ? `Elaborazione lenta — nuovo tentativo automatico (${attempt + 1}/${maxRetries + 1})...`
          : isNetwork
            ? 'Connessione lenta o server in avvio. Riprova tra qualche secondo.'
            : msg
        // Retry su errori di rete/timeout/504
        if (!isNetwork || attempt === maxRetries) break
      }
    }

    setGenError(lastError)
    setIsGenerating(false)
  }

  const handleNext = async () => {
    if (!canProceed() || saving) return

    if (step === 8) {
      // Save onboarding profile to Supabase, then go to generation step
      if (user) {
        setSaving(true)
        await saveOnboarding(user.id, {
          sesso, obiettivo,
          peso_kg: parseFloat(peso) || null,
          peso_target_kg: parseFloat(pesoTarget) || null,
          altezza_cm: parseInt(altezza) || null,
          eta: parseInt(eta) || null,
          livello_attivita: livello,
          luogo_allenamento: luogo,
          frequenza_allenamento: frequenza,
          obiettivo_workout: obiettivoWo,
          pasti_al_giorno: pastiGiorno,
          ore_sonno: oreSonno,
          livello_stress: livelloStress,
          preferenze_alimentari: preferenze,
          intolleranze,
          cibi_non_graditi: cibiNonGraditi,
        })
        setUserFrequenza(frequenza)
        setSaving(false)
      }
      setStep(9)
      return
    }

    if (step === 9 && isDone) {
      navigate('/home')
      return
    }

    setStep(s => s + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
    else {
      if (window.history.length > 1) navigate(-1)
      else navigate('/profilo')
    }
  }

  // CTA label
  const ctaLabel = (() => {
    if (saving) return 'Salvataggio...'
    if (step === 7) return analisiFile ? 'Continua con analisi' : 'Salta'
    if (step === 8) return dietaAnalisi ? 'Genera piano con analisi →' : dietaFile ? 'Salta analisi' : 'Salta — genera il piano'
    if (step === 9 && !isGenerating && !isDone) return '🚀 Genera il mio piano'
    if (step === 9 && isDone) return 'Inizia il percorso →'
    return 'Continua'
  })()

  return (
    <div style={{
      background: c.bg,
      position: 'fixed', top: 'env(safe-area-inset-top)', left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Back button */}
      {!isGenerating && (
        <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
          <motion.div whileTap={{ scale: 0.9 }} onClick={handleBack}
            style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${c.w20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.w60} strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </motion.div>
        </div>
      )}

      {/* Scroll area */}
      <div style={{ flex: 1, overflowY: 'scroll', WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
        <div style={{ padding: '18px 0 0', flexShrink: 0 }}>
          <ProgressBar step={step} total={TOTAL_STEPS} />
        </div>

        <div style={{ padding: '0 24px 24px' }}>
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
                <StepSessoDati
                  sesso={sesso} peso={peso} altezza={altezza} eta={eta} pesoTarget={pesoTarget}
                  onSesso={setSesso} onPeso={setPeso} onAltezza={setAltezza} onEta={setEta} onPesoTarget={setPesoTarget}
                />
              )}
              {step === 3 && (
                <StepStileVita
                  attivita={attivitaExtra} pasti={pastiGiorno} sonno={oreSonno} stress={livelloStress}
                  onAttivita={setAttivitaExtra} onPasti={setPastiGiorno} onSonno={setOreSonno} onStress={setLivelloStress}
                />
              )}
              {step === 4 && (
                <StepAllenamento
                  luogo={luogo} frequenza={frequenza} livello={livello} obiettivoWo={obiettivoWo}
                  onChangeLuogo={setLuogo} onChangeFreq={setFrequenza}
                  onChangeLivello={setLivello} onChangeObiettivoWo={setObiettivoWo}
                />
              )}
              {step === 5 && (
                <StepAlimentazione
                  preferenze={preferenze} intolleranze={intolleranze}
                  onPreferenze={setPreferenze} onIntolleranze={setIntolleranze}
                />
              )}
              {step === 6 && <StepCibiNonGraditi value={cibiNonGraditi} onChange={setCibiNonGraditi} />}
              {step === 7 && <StepAnalisiSangue file={analisiFile} onChange={setAnalisiFile} />}
              {step === 8 && (
                <StepVecchiaDieta
                  file={dietaFile}
                  onChange={handleDietaFileChange}
                  analisi={dietaAnalisi}
                  isAnalyzing={isAnalyzingDieta}
                  onAnalyze={analyzeDieta}
                  error={dietaAnalisiError}
                />
              )}
              {step === 9 && (
                <StepGenerazione
                  isGenerating={isGenerating} isDone={isDone} error={genError}
                  generatedData={generatedData} onGenerate={generatePlan}
                  hasDietaAnalisi={!!dietaAnalisi}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA area */}
        <div style={{ padding: '0 24px 40px' }}>
          {/* Step 7: analisi sangue — skip prominent if no file */}
          {step === 7 && !analisiFile && (
            <motion.div whileTap={{ scale: 0.98 }} onClick={handleNext}
              style={{ height: 52, borderRadius: 52, background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 10 }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.ink }}>
                Salta — vai avanti
              </span>
            </motion.div>
          )}

          {/* Step 8: vecchia dieta — skip if no analysis done */}
          {step === 8 && !dietaAnalisi && !dietaFile && (
            <motion.div whileTap={{ scale: 0.98 }} onClick={handleNext}
              style={{ height: 52, borderRadius: 52, background: c.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 10 }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.ink }}>
                Salta — genera il piano
              </span>
            </motion.div>
          )}

          {/* Standard CTA — hidden on step 9 (generation) and on skip-eligible steps */}
          {step !== 9
            && !(step === 7 && !analisiFile)
            && !(step === 8 && !dietaAnalisi && !dietaFile)
            && (
              <CTAButton label={ctaLabel} onClick={handleNext} disabled={!canProceed() || saving} />
            )}

          {step === 9 && !isGenerating && !isDone && (
            <CTAButton label="🚀 Genera il mio piano" onClick={generatePlan} />
          )}

          {step === 9 && isGenerating && (
            <div style={{ height: 52, borderRadius: 52, background: c.bg4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: c.w40 }}>Generazione in corso...</span>
            </div>
          )}

          {step === 9 && isDone && (
            <CTAButton label="Inizia il percorso →" onClick={() => navigate('/home')} />
          )}
        </div>
      </div>
    </div>
  )
}

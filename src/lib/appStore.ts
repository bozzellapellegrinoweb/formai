import { mockPiano, type GiornoPiano, type Pasto, type EsercizioScheda } from './mock/plan'
import { mockTodayWorkout, mockTodayMacros } from './mock/user'

export interface AppState {
  piano: GiornoPiano[]
  todayWorkout: typeof mockTodayWorkout
  todayMacros: typeof mockTodayMacros
  todayIndex: number // index in piano[] che corrisponde a oggi
}

const STORAGE_KEY = 'forma_ai_state'
const FREQ_KEY = 'forma_frequenza'
const CHANGE_EVENT = 'forma_ai_state_change'
const AI_PLAN_KEY = 'forma_ai_plan_v2'
const AI_MACROS_KEY = 'forma_ai_macros_v2'

// Giorni di allenamento per frequenza (0=Dom, 1=Lun, ... 6=Sab)
const WORKOUT_DAYS_BY_FREQ: Record<number, number[]> = {
  1: [3],
  2: [2, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
}

function applyFrequenzaToPiano(piano: GiornoPiano[], frequenza: number): GiornoPiano[] {
  const workoutDays = WORKOUT_DAYS_BY_FREQ[frequenza] ?? [1, 2, 3, 4, 5]
  // For 3x we cycle through the first 3 workout templates from mockPiano
  const workoutTemplates = mockPiano.filter(d =>
    !['riposo_attivo', 'riposo'].includes(d.tipo_allenamento)
  )
  let templateIdx = 0
  return piano.map((day, idx) => {
    if (workoutDays.includes(idx)) {
      // Assign a workout template cyclically
      const tmpl = workoutTemplates[templateIdx % workoutTemplates.length]
      templateIdx++
      return {
        ...day,
        tipo_allenamento: tmpl.tipo_allenamento,
        sessione_label: tmpl.sessione_label,
        muscoli: tmpl.muscoli,
        durata_min: tmpl.durata_min,
        kcal_bonus: tmpl.kcal_bonus,
        esercizi: tmpl.esercizi,
        note_sessione: tmpl.note_sessione,
        kcal_totali: tmpl.kcal_totali,
        macro: tmpl.macro,
        pasti: day.pasti, // keep current day's meals
      }
    }
    // Rest day: use Sunday template (index 0)
    const restTmpl = mockPiano[0]
    return {
      ...day,
      tipo_allenamento: 'riposo_attivo',
      sessione_label: 'Riposo — Recupero attivo',
      muscoli: [],
      durata_min: 30,
      kcal_bonus: 60,
      esercizi: [],
      note_sessione: 'Recupero attivo: stretching leggero, camminata o yoga.',
      kcal_totali: restTmpl.kcal_totali,
      macro: restTmpl.macro,
      pasti: day.pasti,
    }
  })
}

export function setUserFrequenza(frequenza: number) {
  localStorage.setItem(FREQ_KEY, String(frequenza))
}

export function saveAIPlan(piano: GiornoPiano[], macros_target: object) {
  // Add current-week dates to the AI plan
  const today = new Date()
  const todayDow = today.getDay()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - todayDow)
  const pianoWithDates = piano.map((g, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return { ...g, data: d.getDate() }
  })
  localStorage.setItem(AI_PLAN_KEY, JSON.stringify(pianoWithDates))
  localStorage.setItem(AI_MACROS_KEY, JSON.stringify(macros_target))
  // Clear old state so next getState() uses fresh AI plan
  localStorage.removeItem(STORAGE_KEY)
}

export function getAIPlan(): GiornoPiano[] | null {
  try {
    const raw = localStorage.getItem(AI_PLAN_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function getAIMacros(): { kcal_allenamento: number; kcal_riposo: number; proteine_g: number; carboidrati_allenamento_g: number; grassi_g: number } | null {
  try {
    const raw = localStorage.getItem(AI_MACROS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function buildPianoWithCurrentDates(): GiornoPiano[] {
  const today = new Date()
  const todayDow = today.getDay() // 0=Dom, 1=Lun, ... 6=Sab
  // Get the Sunday that starts this week
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - todayDow)
  return mockPiano.map((giorno, i) => {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    return { ...giorno, data: d.getDate() }
  })
}

function getInitialState(): AppState {
  const todayIndex = new Date().getDay() // 0=Dom…6=Sab matches piano index

  // Use AI-generated plan if available
  const aiPlan = getAIPlan()
  if (aiPlan && aiPlan.length === 7) {
    // Always recalculate dates from the real clock — the saved plan may have stale week dates
    const now = new Date()
    const dow = now.getDay() // 0=Dom … 6=Sab
    const sunday = new Date(now)
    sunday.setDate(now.getDate() - dow)
    const aiPlanFresh = aiPlan.map((g, i) => {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      return { ...g, data: d.getDate() }
    })

    // Derive todayMacros from today's AI plan day (keeps Diario in sync with Piano/Home)
    const today = aiPlanFresh[todayIndex]
    const aiTodayMacros = today ? {
      ...mockTodayMacros,
      kcal_target: today.kcal_totali || mockTodayMacros.kcal_target,
      proteine: today.macro?.proteine ?? mockTodayMacros.proteine,
      carboidrati: today.macro?.carboidrati ?? mockTodayMacros.carboidrati,
      grassi: today.macro?.grassi ?? mockTodayMacros.grassi,
    } : mockTodayMacros
    return { piano: aiPlanFresh, todayWorkout: mockTodayWorkout, todayMacros: aiTodayMacros, todayIndex }
  }

  const basePiano = buildPianoWithCurrentDates()
  const storedFreq = localStorage.getItem(FREQ_KEY)
  const piano = storedFreq
    ? applyFrequenzaToPiano(basePiano, parseInt(storedFreq))
    : basePiano
  return {
    piano,
    todayWorkout: mockTodayWorkout,
    todayMacros: mockTodayMacros,
    todayIndex,
  }
}

export function getState(): AppState {
  const initial = getInitialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      // Always recalculate todayIndex and dates from real clock
      // Only carry over user-generated data (pasti loggati, misure, etc.)
      if (saved.piano?.length > 0) {
        const merged = initial.piano.map((day, i) => ({
          ...day,
          // Preserve logged meals from saved state
          pasti: saved.piano[i]?.pasti ?? day.pasti,
        }))
        return { ...initial, piano: merged }
      }
    }
  } catch {}
  return initial
}

function setState(next: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }))
}

export function onStateChange(cb: (state: AppState) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<AppState>).detail)
  window.addEventListener(CHANGE_EVENT, handler)
  return () => window.removeEventListener(CHANGE_EVENT, handler)
}

export function resetState() {
  setState(getInitialState())
}

// ── Azioni che NUTRI può eseguire ──────────────────────────────────────────

export function updateMeal(tipo: Pasto['tipo'], data: Partial<Pasto>) {
  const state = getState()
  const piano = [...state.piano]
  const day = { ...piano[state.todayIndex] }
  day.pasti = day.pasti.map(p =>
    p.tipo === tipo ? { ...p, ...data } : p
  )
  // ricalcola kcal e macro del giorno
  day.kcal_totali = day.pasti.reduce((s, p) => s + p.kcal, 0)
  day.macro = {
    proteine: day.pasti.reduce((s, p) => s + p.macro.p, 0),
    carboidrati: day.pasti.reduce((s, p) => s + p.macro.c, 0),
    grassi: day.pasti.reduce((s, p) => s + p.macro.g, 0),
  }
  piano[state.todayIndex] = day
  setState({ ...state, piano })
}

export function addMeal(pasto: Pasto) {
  const state = getState()
  const piano = [...state.piano]
  const day = { ...piano[state.todayIndex] }
  day.pasti = [...day.pasti.filter(p => p.tipo !== pasto.tipo), pasto]
    .sort((a, b) => {
      const order = ['colazione', 'pranzo', 'spuntino', 'cena']
      return order.indexOf(a.tipo) - order.indexOf(b.tipo)
    })
  day.kcal_totali = day.pasti.reduce((s, p) => s + p.kcal, 0)
  day.macro = {
    proteine: day.pasti.reduce((s, p) => s + p.macro.p, 0),
    carboidrati: day.pasti.reduce((s, p) => s + p.macro.c, 0),
    grassi: day.pasti.reduce((s, p) => s + p.macro.g, 0),
  }
  piano[state.todayIndex] = day
  setState({ ...state, piano })
}

export function updateDayMeals(pasti: Pasto[]) {
  const state = getState()
  const piano = [...state.piano]
  const day = { ...piano[state.todayIndex] }
  day.pasti = pasti
  day.kcal_totali = pasti.reduce((s, p) => s + p.kcal, 0)
  day.macro = {
    proteine: pasti.reduce((s, p) => s + p.macro.p, 0),
    carboidrati: pasti.reduce((s, p) => s + p.macro.c, 0),
    grassi: pasti.reduce((s, p) => s + p.macro.g, 0),
  }
  piano[state.todayIndex] = day
  setState({ ...state, piano })
}

export function updateWorkout(data: Partial<typeof mockTodayWorkout>) {
  const state = getState()
  setState({ ...state, todayWorkout: { ...state.todayWorkout, ...data } })
}

export function updateMacroTargets(data: Partial<typeof mockTodayMacros>) {
  const state = getState()
  setState({ ...state, todayMacros: { ...state.todayMacros, ...data } })
}

export function updateDayNote(note: string) {
  const state = getState()
  const piano = [...state.piano]
  piano[state.todayIndex] = { ...piano[state.todayIndex], note }
  setState({ ...state, piano })
}

export interface WorkoutScheduleInput {
  frequenza: number
  livello: string
  obiettivo: string
  luogo: string
  split?: string
  settimane?: number
  note_programma?: string
  giorni: Array<{
    giorno: string
    tipo: string
    sessione_label: string
    muscoli: string[]
    durata_min: number
    kcal_bonus?: number
    esercizi?: EsercizioScheda[]
    note_sessione?: string
  }>
}

export function updateWorkoutSchedule(input: WorkoutScheduleInput) {
  const state = getState()
  const piano = state.piano.map((day, idx) => {
    const generated = input.giorni[idx]
    if (!generated) return day
    return {
      ...day,
      tipo_allenamento: generated.tipo,
      sessione_label: generated.sessione_label,
      muscoli: generated.muscoli,
      durata_min: generated.durata_min,
      kcal_bonus: generated.kcal_bonus,
      esercizi: generated.esercizi,
      note_sessione: generated.note_sessione,
    }
  })
  setState({ ...state, piano })
}

// hook React
import { useState, useEffect } from 'react'

export function useAppState(): AppState {
  const [state, setLocalState] = useState<AppState>(getState)
  useEffect(() => onStateChange(setLocalState), [])
  return state
}

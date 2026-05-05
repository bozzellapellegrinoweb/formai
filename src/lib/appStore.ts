import { mockPiano, type GiornoPiano, type Pasto, type EsercizioScheda } from './mock/plan'
import { mockTodayWorkout, mockTodayMacros } from './mock/user'

export interface AppState {
  piano: GiornoPiano[]
  todayWorkout: typeof mockTodayWorkout
  todayMacros: typeof mockTodayMacros
  todayIndex: number // index in piano[] che corrisponde a oggi
}

const STORAGE_KEY = 'forma_ai_state'
const CHANGE_EVENT = 'forma_ai_state_change'

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
  return {
    piano: buildPianoWithCurrentDates(),
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

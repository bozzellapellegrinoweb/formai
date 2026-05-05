export interface Exercise {
  id: string
  name: string
  muscle: string
  sets: number
  reps: string
  rest_sec: number
  video_label: string
  video_duration: string
  note?: string
  video_url?: string
}

// Map exercise name → /videos/*.mp4
export const exerciseVideoMap: Record<string, string> = {
  'Squat con bilanciere':           '/videos/squat_con_bilanciere.mp4',
  'Leg Press':                       '/videos/leg_press.mp4',
  'Romanian Deadlift':               '/videos/romanian_deadlift.mp4',
  'Affondi alternati con manubri':   '/videos/affondi_alternati.mp4',
  'Leg Curl sdraiato':               '/videos/leg_curl_sdraiato.mp4',
  'Calf Raise in piedi':             '/videos/calf_raise.mp4',
  'Curl manubri alternati':          '/videos/curl_manubri_webp.webp',
  'Curl con bilanciere':             '/videos/curl_bilanciere.mp4',
  'Curl bilanciere':                 '/videos/curl_bilanciere.mp4',
  'Hammer curl con manubri':         '/videos/hammer_curl.mp4',
  'Alzate laterali con manubri':     '/videos/alzate_laterali.mp4',
  'Face pull al cavo':               '/videos/face_pull_webp.webp',
  'Dead bug':                        '/videos/dead_bug.mp4',
  'Plank':                           '/videos/plank.mp4',
  'Panca piana con bilanciere':      '/videos/panca_piana.mp4',
  'Trazioni alla sbarra':            '/videos/trazioni_alla_sbarra.webp',
  'Rematore con bilanciere':         '/videos/rematore_bilanciere.webp',
  'Pulley basso seduto':             '/videos/pulley_basso.webp',
}

export interface WorkoutSession {
  id: string
  giorno: string
  tipo: string
  label: string
  durata_min: number
  kcal_bonus: number
  carb_bonus: number
  esercizi: Exercise[]
  note_nutri: string
}

export const mockWeekSchedule = [
  { sigla: 'Dom', tipo: 'riposo_attivo', active: false },
  { sigla: 'Lun', tipo: 'push',          active: false },
  { sigla: 'Mar', tipo: 'pull',          active: false },
  { sigla: 'Mer', tipo: 'gambe',         active: true  },
  { sigla: 'Gio', tipo: 'push',          active: false },
  { sigla: 'Ven', tipo: 'pull',          active: false },
  { sigla: 'Sab', tipo: 'riposo',        active: false },
]

export const mockTodayWorkoutSession: WorkoutSession = {
  id: 'wk-mer-gambe',
  giorno: 'Mercoledì',
  tipo: 'gambe',
  label: 'Gambe — Ipertrofia',
  durata_min: 55,
  kcal_bonus: 200,
  carb_bonus: 40,
  note_nutri: '+40g carb a pranzo adattati automaticamente per massimizzare le performance nelle gambe.',
  esercizi: [
    {
      id: 'e1',
      name: 'Squat con bilanciere',
      muscle: 'Quadricipiti · Glutei · Core',
      sets: 4,
      reps: '8 rep',
      rest_sec: 90,
      video_label: 'Vista laterale',
      video_duration: '15s',
      note: 'Schiena dritta, ginocchia in linea con i piedi. Scendi fino a 90° o oltre.',
    },
    {
      id: 'e2',
      name: 'Leg Press',
      muscle: 'Quadricipiti · Femorali · Glutei',
      sets: 4,
      reps: '10 rep',
      rest_sec: 75,
      video_label: 'Vista laterale',
      video_duration: '12s',
      note: 'Piedi a larghezza spalle. Non bloccare le ginocchia in estensione.',
    },
    {
      id: 'e3',
      name: 'Romanian Deadlift',
      muscle: 'Femorali · Glutei · Lombari',
      sets: 3,
      reps: '10 rep',
      rest_sec: 90,
      video_label: 'Vista laterale',
      video_duration: '14s',
      note: 'Mantieni il bilanciere vicino alle gambe. Senti lo stretch nei femorali.',
    },
    {
      id: 'e4',
      name: 'Affondi alternati',
      muscle: 'Quadricipiti · Femorali · Equilibrio',
      sets: 3,
      reps: '12 rep per gamba',
      rest_sec: 60,
      video_label: 'Vista frontale',
      video_duration: '10s',
      note: 'Passo lungo, busto eretto. Ginocchio anteriore non oltre la punta del piede.',
    },
    {
      id: 'e5',
      name: 'Leg Curl sdraiato',
      muscle: 'Femorali',
      sets: 3,
      reps: '12 rep',
      rest_sec: 60,
      video_label: 'Vista laterale',
      video_duration: '10s',
      note: 'Contrazione completa in cima, discesa controllata in 3 secondi.',
    },
    {
      id: 'e6',
      name: 'Calf Raise in piedi',
      muscle: 'Polpacci',
      sets: 4,
      reps: '15 rep',
      rest_sec: 45,
      video_label: 'Vista laterale',
      video_duration: '8s',
      note: 'Piena escursione di movimento. Pausa 1 secondo in cima.',
    },
  ],
}

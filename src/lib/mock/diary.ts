export interface DiaryEntry {
  id: string
  date: string
  label: string
  meal_type: 'colazione' | 'pranzo' | 'cena' | 'spuntino'
  description: string
  emoji: string
  kcal_estimated: number
  macro: { p: number; c: number; g: number }
  agent_comment: string
  in_linea: boolean
}

export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: 'd1',
    date: '2026-05-02',
    label: 'Oggi',
    meal_type: 'colazione',
    description: 'Avena proteica con frutti rossi e uova',
    emoji: '🍳',
    kcal_estimated: 480,
    macro: { p: 28, c: 65, g: 12 },
    agent_comment: 'Colazione perfetta per il giorno gambe! Carboidrati complessi e proteine per un inizio energetico.',
    in_linea: true,
  },
  {
    id: 'd2',
    date: '2026-05-01',
    label: 'Ieri',
    meal_type: 'pranzo',
    description: 'Pasta integrale al tonno',
    emoji: '🍝',
    kcal_estimated: 520,
    macro: { p: 38, c: 72, g: 10 },
    agent_comment: 'Ottimo pranzo! Leggero ma completo. Buona fonte di omega-3 dal tonno.',
    in_linea: true,
  },
  {
    id: 'd3',
    date: '2026-05-01',
    label: 'Ieri',
    meal_type: 'cena',
    description: 'Pizza margherita',
    emoji: '🍕',
    kcal_estimated: 720,
    macro: { p: 24, c: 95, g: 28 },
    agent_comment: 'Leggermente sopra le calorie stimate, ma ci sta! Era giorno di petto. Domani compensiamo con uno spuntino leggero.',
    in_linea: false,
  },
  {
    id: 'd4',
    date: '2026-04-30',
    label: '30 Apr',
    meal_type: 'colazione',
    description: 'Yogurt greco con miele e noci',
    emoji: '🥛',
    kcal_estimated: 320,
    macro: { p: 20, c: 28, g: 14 },
    agent_comment: 'Colazione proteica equilibrata. Le noci aggiungono grassi sani. Ben fatto!',
    in_linea: true,
  },
  {
    id: 'd5',
    date: '2026-04-30',
    label: '30 Apr',
    meal_type: 'pranzo',
    description: 'Insalata di pollo e quinoa',
    emoji: '🥗',
    kcal_estimated: 490,
    macro: { p: 44, c: 52, g: 12 },
    agent_comment: 'Pranzo eccellente! Quinoa + pollo = profilo amminoacidico completo.',
    in_linea: true,
  },
]

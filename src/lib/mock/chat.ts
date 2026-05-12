export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  has_image?: boolean
  imageUrl?: string
  analysis?: { descrizione: string; kcal: number; macro: { p: number; c: number; g: number } }
  date?: string  // ISO date string for day-separator logic
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Ciao Marco! 👋 Oggi è giorno gambe. Ho già adattato il tuo piano: +40g carb a pranzo e +200 kcal totali per supportare le performance. Hai domande sul piano di oggi?',
    time: '09:30',
  },
  {
    id: '2',
    role: 'user',
    content: 'Posso mangiare la pizza stasera?',
    time: '09:38',
  },
  {
    id: '3',
    role: 'assistant',
    content: "Sì! Oggi con le gambe hai più margine calorico. Una pizza margherita standard è ~700 kcal — ti restano circa 140 kcal di buffer. Scegli la margherita o la marinara, evita i fritti. 🍕\n\nRicorda: consulta sempre il tuo medico o dietologo per valutazioni cliniche.",
    time: '09:38',
  },
  {
    id: '4',
    role: 'user',
    content: 'Quante calorie ha il petto di pollo?',
    time: '09:41',
  },
  {
    id: '5',
    role: 'assistant',
    content: 'Petto di pollo alla griglia: ~165 kcal/100g. 31g proteine, 3.6g grassi, carboidrati pressoché zero. È la fonte proteica più efficiente per il tuo obiettivo massa — perfetto per oggi.',
    time: '09:41',
  },
]

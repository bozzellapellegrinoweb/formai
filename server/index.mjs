import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { NUTRITION_KNOWLEDGE } from './knowledge.mjs'
import { WORKOUT_KNOWLEDGE } from './workout_knowledge.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
try {
  const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  })
} catch {}

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildNutriSystem(profile) {
  const nome = profile?.nome || 'utente'
  const eta = profile?.eta ? `${profile.eta} anni` : 'età n.d.'
  const peso = profile?.peso_kg ? `${profile.peso_kg} kg` : 'peso n.d.'
  const altezza = profile?.altezza_cm ? `${profile.altezza_cm} cm` : 'altezza n.d.'
  const bmi = profile?.peso_kg && profile?.altezza_cm
    ? (profile.peso_kg / Math.pow(profile.altezza_cm / 100, 2)).toFixed(1)
    : 'n.d.'
  const obiettivo = profile?.obiettivo || 'non specificato'
  const livello = profile?.livello_attivita || 'non specificato'
  const luogo = profile?.luogo_allenamento || 'non specificato'
  const frequenza = profile?.frequenza_allenamento ? `${profile.frequenza_allenamento}x/settimana` : 'n.d.'
  const preferenze = Array.isArray(profile?.preferenze_alimentari) ? profile.preferenze_alimentari.join(', ') : 'nessuna'

  return `Sei NUTRI, il nutrizionista e coach sportivo AI di forma.ai. Hai accesso a un knowledge base scientifico completo su nutrizione e allenamento, basato su fonti ufficiali italiane (CREA BDA, LARN 2014 SINU) e internazionali (ISSN Position Stands 2017, ACSM).

## PROFILO UTENTE ATTIVO
- Nome: ${nome}, ${eta}, ${peso}, ${altezza} (BMI ${bmi})
- Obiettivo: ${obiettivo}
- Allenamento: ${luogo} ${frequenza}, livello ${livello}
- Preferenze alimentari: ${preferenze}

## KNOWLEDGE BASE SCIENTIFICO — NUTRIZIONE
${NUTRITION_KNOWLEDGE}

## KNOWLEDGE BASE SCIENTIFICO — ALLENAMENTO
${WORKOUT_KNOWLEDGE}

## ISTRUZIONI COMPORTAMENTALI
- Rispondi SEMPRE in italiano, tono diretto e motivante
- Usa i dati del knowledge base per dare risposte precise con numeri reali
- Personalizza SEMPRE per il profilo dell'utente attivo
- Cita le fonti quando dai informazioni tecniche
- Per questioni mediche/patologiche: suggerisci sempre un medico o dietologo
- Risposte concise per domande semplici, dettagliate per domande tecniche
- Usa emoji con parsimonia (max 1–2 per risposta)
- Quando l'utente chiede di MODIFICARE qualcosa nel piano o nell'allenamento, usa gli strumenti disponibili — non solo descrivere la modifica, ESEGUILA davvero
- Quando usi replace_all_meals, chiama SEMPRE anche update_macro_targets con i totali calcolati dai nuovi pasti (somma kcal, proteine, carboidrati, grassi)
- Quando l'utente chiede di creare o generare una scheda fitness/allenamento, usa generate_workout_schedule — non descriverla solo a parole, GENERALA davvero con tutti i 7 giorni, esercizi, serie, reps, recupero e RIR basati sulla knowledge base scientifica
- Per generate_workout_schedule: includi SEMPRE tutti i 7 giorni (anche i giorni di riposo), con esercizi dettagliati per ogni sessione attiva. Usa i pattern di movimento del knowledge base, non i gruppi muscolari isolati.
- Dopo aver usato uno strumento, conferma brevemente cosa hai fatto`
}

const TOOLS = [
  {
    name: 'update_meal',
    description: 'Modifica un pasto specifico nel piano alimentare di oggi. Usare quando l\'utente chiede di cambiare, sostituire o aggiornare un pasto (colazione, pranzo, spuntino, cena).',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['colazione', 'pranzo', 'spuntino', 'cena'], description: 'Quale pasto modificare' },
        nome: { type: 'string', description: 'Nome del nuovo pasto' },
        kcal: { type: 'number', description: 'Calorie totali del pasto' },
        macro: {
          type: 'object',
          properties: {
            p: { type: 'number', description: 'Proteine in grammi' },
            c: { type: 'number', description: 'Carboidrati in grammi' },
            g: { type: 'number', description: 'Grassi in grammi' },
          },
          required: ['p', 'c', 'g'],
        },
        alimenti: { type: 'array', items: { type: 'string' }, description: 'Lista degli alimenti con quantità (es. "Petto di pollo 150g")' },
        ricetta: { type: 'string', description: 'Breve descrizione preparazione' },
      },
      required: ['tipo', 'nome', 'kcal', 'macro', 'alimenti'],
    },
  },
  {
    name: 'replace_all_meals',
    description: 'Sostituisce l\'intero piano pasti di oggi con un nuovo piano completo. Usare quando l\'utente chiede di rifare tutto il piano giornaliero o cambiare regime alimentare.',
    input_schema: {
      type: 'object',
      properties: {
        pasti: {
          type: 'array',
          description: 'Array completo dei 4 pasti del giorno',
          items: {
            type: 'object',
            properties: {
              tipo: { type: 'string', enum: ['colazione', 'pranzo', 'spuntino', 'cena'] },
              nome: { type: 'string' },
              kcal: { type: 'number' },
              macro: {
                type: 'object',
                properties: { p: { type: 'number' }, c: { type: 'number' }, g: { type: 'number' } },
                required: ['p', 'c', 'g'],
              },
              alimenti: { type: 'array', items: { type: 'string' } },
              ricetta: { type: 'string' },
            },
            required: ['tipo', 'nome', 'kcal', 'macro', 'alimenti'],
          },
        },
        nota_giorno: { type: 'string', description: 'Nota sul nuovo piano (motivazione scelte)' },
      },
      required: ['pasti'],
    },
  },
  {
    name: 'update_workout',
    description: 'Modifica i dettagli dell\'allenamento di oggi (tipo, durata, numero esercizi, note). Usare quando l\'utente chiede di cambiare o adattare il workout.',
    input_schema: {
      type: 'object',
      properties: {
        label: { type: 'string', description: 'Nome dell\'allenamento (es. "Gambe — Volume")' },
        type: { type: 'string', description: 'Tipo: gambe, petto, schiena, spalle, braccia, cardio, misto, riposo' },
        durata_min: { type: 'number', description: 'Durata in minuti' },
        esercizi: { type: 'number', description: 'Numero di esercizi' },
        kcal_bonus: { type: 'number', description: 'Bonus calorico per l\'allenamento' },
        note: { type: 'string', description: 'Note nutrizionali legate all\'allenamento' },
      },
      required: ['label', 'type'],
    },
  },
  {
    name: 'update_macro_targets',
    description: 'Aggiorna i target calorici e macro giornalieri. Usare quando l\'utente chiede di cambiare gli obiettivi nutrizionali.',
    input_schema: {
      type: 'object',
      properties: {
        kcal_target: { type: 'number' },
        proteine: { type: 'number' },
        carboidrati: { type: 'number' },
        grassi: { type: 'number' },
      },
    },
  },
  {
    name: 'generate_workout_schedule',
    description: 'Genera e salva una scheda di allenamento settimanale personalizzata basata sul profilo utente. Usare quando l\'utente chiede di creare, generare o aggiornare la propria scheda fitness. Produce un piano completo di 7 giorni con esercizi, serie, ripetizioni e note scientifiche.',
    input_schema: {
      type: 'object',
      properties: {
        frequenza: { type: 'number', description: 'Allenamenti per settimana (2-6)' },
        livello: { type: 'string', enum: ['principiante', 'intermedio', 'avanzato'], description: 'Livello esperienza' },
        obiettivo: { type: 'string', enum: ['massa', 'forza', 'dimagrimento', 'resistenza', 'mantenimento'], description: 'Obiettivo principale' },
        luogo: { type: 'string', enum: ['palestra', 'casa', 'esterno'], description: 'Luogo di allenamento' },
        split: { type: 'string', description: 'Tipo split scelto (es. PPL, Upper/Lower, Full Body, Push/Pull/Legs)' },
        settimane: { type: 'number', description: 'Durata del programma in settimane (default 4)' },
        giorni: {
          type: 'array',
          description: 'Piano settimanale completo — 7 elementi, uno per giorno (dom=0, lun=1, ... sab=6)',
          items: {
            type: 'object',
            properties: {
              giorno: { type: 'string', description: 'Nome giorno (es. Lunedì)' },
              tipo: { type: 'string', description: 'Tipo sessione: push, pull, gambe, upper, lower, full_body, cardio, riposo, riposo_attivo' },
              sessione_label: { type: 'string', description: 'Etichetta dettagliata (es. "Push A — Petto + Spalle + Tricipiti")' },
              muscoli: { type: 'array', items: { type: 'string' }, description: 'Gruppi muscolari coinvolti' },
              durata_min: { type: 'number', description: 'Durata prevista in minuti' },
              kcal_bonus: { type: 'number', description: 'Stima calorie bruciate' },
              esercizi: {
                type: 'array',
                description: 'Lista esercizi della sessione',
                items: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string', description: 'Nome esercizio' },
                    serie: { type: 'number', description: 'Numero di serie' },
                    reps: { type: 'string', description: 'Range ripetizioni (es. "8-10" o "12" o "30s")' },
                    recupero_s: { type: 'number', description: 'Recupero in secondi' },
                    rir: { type: 'number', description: 'Reps In Reserve target (0-4)' },
                    muscolo_primario: { type: 'string', description: 'Muscolo principale' },
                    note: { type: 'string', description: 'Note tecnica/esecuzione' },
                  },
                  required: ['nome', 'serie', 'reps', 'recupero_s'],
                },
              },
              note_sessione: { type: 'string', description: 'Note generali sulla sessione (riscaldamento, cardio, ecc.)' },
            },
            required: ['giorno', 'tipo', 'sessione_label', 'muscoli', 'durata_min'],
          },
        },
        note_programma: { type: 'string', description: 'Spiegazione scientifica delle scelte (split rationale, progressione, ecc.)' },
      },
      required: ['frequenza', 'livello', 'obiettivo', 'luogo', 'giorni'],
    },
  },
]

app.post('/api/chat', async (req, res) => {
  const { messages, profile } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages required' })
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata in .env.local' })
  }

  try {
    const actions = []
    let finalText = ''

    // Prima chiamata — può restituire testo o tool_use
    const NUTRI_SYSTEM = buildNutriSystem(profile)

    let response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: NUTRI_SYSTEM,
      tools: TOOLS,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    // Gestisci tool_use in loop (Claude può chiamare più strumenti)
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults = []

      for (const tool of toolUseBlocks) {
        const input = tool.input
        let result = { success: true, message: '' }

        if (tool.name === 'update_meal') {
          actions.push({ type: 'update_meal', data: input })
          result.message = `Pasto ${input.tipo} aggiornato: ${input.nome} (${input.kcal} kcal)`
        } else if (tool.name === 'replace_all_meals') {
          // Aggiungi completato: false a ogni pasto
          const pasti = input.pasti.map(p => ({ ...p, completato: false }))
          actions.push({ type: 'replace_all_meals', data: { pasti, nota_giorno: input.nota_giorno } })
          result.message = `Piano giornaliero sostituito con ${pasti.length} nuovi pasti`
        } else if (tool.name === 'update_workout') {
          actions.push({ type: 'update_workout', data: input })
          result.message = `Workout aggiornato: ${input.label}`
        } else if (tool.name === 'update_macro_targets') {
          actions.push({ type: 'update_macro_targets', data: input })
          result.message = `Target macro aggiornati`
        } else if (tool.name === 'generate_workout_schedule') {
          actions.push({ type: 'generate_workout_schedule', data: input })
          result.message = `Scheda fitness generata: ${input.split || 'personalizzata'} — ${input.frequenza}x/sett, livello ${input.livello}`
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify(result),
        })
      }

      // Seconda chiamata con i risultati degli strumenti
      const updatedMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ]

      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: NUTRI_SYSTEM,
        tools: TOOLS,
        messages: updatedMessages,
      })
    }

    // Estrai il testo finale
    const textBlock = response.content.find(b => b.type === 'text')
    finalText = textBlock?.text ?? ''

    res.json({ content: finalText, actions })
  } catch (err) {
    console.error('Anthropic error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/health', (_, res) => res.json({ ok: true }))

const PORT = 3001
app.listen(PORT, () => console.log(`NUTRI server → http://localhost:${PORT}`))

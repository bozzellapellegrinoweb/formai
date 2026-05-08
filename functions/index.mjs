import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import Anthropic from '@anthropic-ai/sdk'
import { NUTRITION_KNOWLEDGE } from './knowledge.mjs'
import { WORKOUT_KNOWLEDGE } from './workout_knowledge.mjs'

const anthropicKey = defineSecret('ANTHROPIC_API_KEY')

function buildNutriSystem(profile, plan) {
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

  // Build today's plan section
  let pianoOggi = ''
  if (plan?.oggi) {
    const p = plan.oggi
    pianoOggi = `
PIANO PASTI DI OGGI (${p.label || 'oggi'}):
Target: ${p.kcal_target || '—'} kcal | P ${p.macro_target?.proteine || '—'}g | C ${p.macro_target?.carboidrati || '—'}g | G ${p.macro_target?.grassi || '—'}g
${p.nota ? `Nota: ${p.nota}` : ''}
Pasti:
${(p.pasti || []).map(pasto => `- ${pasto.tipo.toUpperCase()}: ${pasto.nome} — ${pasto.kcal} kcal | P ${pasto.macro?.p}g C ${pasto.macro?.c}g G ${pasto.macro?.g}g${pasto.alimenti?.length ? ` (${pasto.alimenti.join(', ')})` : ''}${pasto.completato ? ' ✓' : ''}`).join('\n')}`

    if (plan.workout?.label) {
      pianoOggi += `\nAllenamento oggi: ${plan.workout.label} (${plan.workout.muscoli?.join(', ') || ''}) — ${plan.workout.durata || '—'} min`
    }
  }

  return `Sei NUTRI, il nutrizionista e coach sportivo AI di forma.ai. Hai accesso a un knowledge base scientifico completo su nutrizione e allenamento, basato su fonti ufficiali italiane (CREA BDA, LARN 2014 SINU) e internazionali (ISSN Position Stands 2017, ACSM).

PROFILO UTENTE ATTIVO:
- Nome: ${nome}, ${eta}, ${peso}, ${altezza} (BMI ${bmi})
- Obiettivo: ${obiettivo}
- Allenamento: ${luogo} ${frequenza}, livello ${livello}
- Preferenze alimentari: ${preferenze}
${pianoOggi}

KNOWLEDGE BASE SCIENTIFICO — NUTRIZIONE:
${NUTRITION_KNOWLEDGE}

KNOWLEDGE BASE SCIENTIFICO — ALLENAMENTO:
${WORKOUT_KNOWLEDGE}

ISTRUZIONI COMPORTAMENTALI:
- Rispondi SEMPRE in italiano, tono diretto e motivante
- HAI GIÀ ACCESSO AL PIANO PASTI DI OGGI — usalo nelle risposte senza chiedere all'utente cosa mangia
- Personalizza SEMPRE per il profilo dell'utente attivo, citando pasti specifici del piano quando rilevante
- Per questioni mediche/patologiche: suggerisci sempre un medico o dietologo
- Risposte concise per domande semplici, dettagliate per domande tecniche
- Usa emoji con parsimonia (max 2 per risposta)
- Quando l'utente chiede di MODIFICARE qualcosa nel piano o nell'allenamento, usa gli strumenti disponibili
- Quando usi replace_all_meals, chiama SEMPRE anche update_macro_targets con i totali calcolati
- Quando l'utente chiede di creare una scheda fitness, usa generate_workout_schedule con tutti i 7 giorni
- Dopo aver usato uno strumento, conferma brevemente cosa hai fatto

FORMATO RISPOSTE — REGOLE ASSOLUTE:
- NON usare MAI markdown: niente ##, **, *, ---, tabelle con |
- Struttura con emoji e a capo, non con simboli markdown
- Per elenchi usa "→" o numeri, non "- " o "*"
- Per separatori usa una riga vuota, non "---"
- Per evidenziare usa MAIUSCOLO, non **grassetto**`
}

const TOOLS = [
  {
    name: 'update_meal',
    description: "Modifica un pasto specifico nel piano alimentare di oggi.",
    input_schema: {
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
  {
    name: 'replace_all_meals',
    description: "Sostituisce l'intero piano pasti di oggi con un nuovo piano completo.",
    input_schema: {
      type: 'object',
      properties: {
        pasti: {
          type: 'array',
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
        nota_giorno: { type: 'string' },
      },
      required: ['pasti'],
    },
  },
  {
    name: 'update_workout',
    description: "Modifica i dettagli dell'allenamento di oggi.",
    input_schema: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        type: { type: 'string' },
        durata_min: { type: 'number' },
        esercizi: { type: 'number' },
        kcal_bonus: { type: 'number' },
        note: { type: 'string' },
      },
      required: ['label', 'type'],
    },
  },
  {
    name: 'update_macro_targets',
    description: 'Aggiorna i target calorici e macro giornalieri.',
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
    description: 'Genera una scheda di allenamento settimanale personalizzata con 7 giorni completi.',
    input_schema: {
      type: 'object',
      properties: {
        frequenza: { type: 'number' },
        livello: { type: 'string', enum: ['principiante', 'intermedio', 'avanzato'] },
        obiettivo: { type: 'string', enum: ['massa', 'forza', 'dimagrimento', 'resistenza', 'mantenimento'] },
        luogo: { type: 'string', enum: ['palestra', 'casa', 'esterno'] },
        split: { type: 'string' },
        settimane: { type: 'number' },
        giorni: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              giorno: { type: 'string' },
              tipo: { type: 'string' },
              sessione_label: { type: 'string' },
              muscoli: { type: 'array', items: { type: 'string' } },
              durata_min: { type: 'number' },
              kcal_bonus: { type: 'number' },
              esercizi: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    serie: { type: 'number' },
                    reps: { type: 'string' },
                    recupero_s: { type: 'number' },
                    rir: { type: 'number' },
                    muscolo_primario: { type: 'string' },
                    note: { type: 'string' },
                  },
                  required: ['nome', 'serie', 'reps', 'recupero_s'],
                },
              },
              note_sessione: { type: 'string' },
            },
            required: ['giorno', 'tipo', 'sessione_label', 'muscoli', 'durata_min'],
          },
        },
        note_programma: { type: 'string' },
      },
      required: ['frequenza', 'livello', 'obiettivo', 'luogo', 'giorni'],
    },
  },
]

export const api = onRequest(
  { secrets: [anthropicKey], region: 'europe-west1', cors: true, timeoutSeconds: 300, memory: '512MiB' },
  async (req, res) => {
    const path = req.path.replace(/^\/api/, '')

    // Health check
    if (req.method === 'GET' && path === '/health') {
      res.json({ ok: true })
      return
    }

    // Analyze meal — photo OR text description
    if (req.method === 'POST' && path === '/analyze-meal') {
      const { imageBase64, mediaType, textDescription, profile } = req.body
      const apiKey = anthropicKey.value()
      if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' }); return }
      const client = new Anthropic({ apiKey })
      const nome = profile?.nome || 'utente'
      const obiettivo = profile?.obiettivo || 'non specificato'
      const systemPrompt = `Sei NUTRI, nutrizionista AI di forma.ai. Stima i valori nutrizionali in modo accurato e realistico. Rispondi SEMPRE in italiano. Utente: ${nome}, obiettivo: ${obiettivo}.`
      const jsonInstruction = 'Rispondi SOLO con un JSON valido (nessun testo prima o dopo) nel formato:\n{"descrizione":"nome del piatto","kcal":000,"macro":{"p":00,"c":00,"g":00},"commento":"breve commento nutrizionale di 1 frase"}'
      try {
        let content
        if (imageBase64 && mediaType) {
          content = [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
            { type: 'text', text: `Analizza questo pasto e stima calorie e macro. Porzioni realistiche. ${jsonInstruction}` },
          ]
        } else if (textDescription) {
          content = [{ type: 'text', text: `Stima calorie e macro per questo pasto: "${textDescription}". Assumi porzioni tipiche italiane. ${jsonInstruction}` }]
        } else {
          res.status(400).json({ error: 'imageBase64+mediaType oppure textDescription richiesti' })
          return
        }
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content }],
        })
        const raw = response.content[0]?.text || '{}'
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { descrizione: textDescription || 'Pasto', kcal: 0, macro: { p: 0, c: 0, g: 0 }, commento: '' }
        res.json({ ok: true, result })
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      return
    }

    // ── generate-plan ─────────────────────────────────────────────────────
    if (req.method === 'POST' && path === '/generate-plan') {
      const { profile } = req.body
      if (!profile) { res.status(400).json({ error: 'profile required' }); return }
      const apiKey = anthropicKey.value()
      if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' }); return }
      const client = new Anthropic({ apiKey })

      // Mifflin-St Jeor TDEE
      const p = profile
      const isMale = p.sesso === 'uomo'
      const bmr = p.peso_kg && p.altezza_cm && p.eta
        ? Math.round((10 * p.peso_kg) + (6.25 * p.altezza_cm) - (5 * p.eta) + (isMale ? 5 : -161))
        : null
      const activityMult = { principiante: 1.375, intermedio: 1.55, avanzato: 1.725 }[p.livello_attivita] ?? 1.55
      const tdee = bmr ? Math.round(bmr * activityMult) : null
      const kcalTarget = tdee ? (p.obiettivo === 'dimagrimento' ? tdee - 400 : p.obiettivo === 'massa' ? tdee + 300 : tdee) : 2000
      const kcalRiposo = Math.round(kcalTarget * 0.85)

      const systemPrompt = `Sei un nutrizionista e coach sportivo AI di livello olimpionico. Genera un piano alimentare e fitness SETTIMANALE personalizzato al 100% per questo utente, partendo da domenica (indice 0) a sabato (indice 6).

PROFILO UTENTE:
- Sesso: ${p.sesso || 'non specificato'}
- Età: ${p.eta || 'n.d.'} anni
- Peso: ${p.peso_kg || 'n.d.'} kg | Altezza: ${p.altezza_cm || 'n.d.'} cm
- Obiettivo principale: ${p.obiettivo || 'mantenimento'}
${p.peso_target_kg ? `- Peso target: ${p.peso_target_kg} kg` : ''}
- Luogo allenamento: ${p.luogo_allenamento || 'palestra'}
- Frequenza: ${p.frequenza_allenamento || 4}x/settimana
- Livello: ${p.livello_attivita || 'intermedio'}
- Obiettivo workout: ${p.obiettivo_workout || 'ipertrofia'}
- Pasti al giorno: ${p.pasti_al_giorno || 4}
- Ore sonno: ${p.ore_sonno || 7}h
- Livello stress: ${p.livello_stress || 'medio'}
- Preferenze alimentari: ${Array.isArray(p.preferenze_alimentari) ? p.preferenze_alimentari.join(', ') : 'nessuna'}
- Intolleranze: ${Array.isArray(p.intolleranze) ? p.intolleranze.join(', ') : 'nessuna'}
- Cibi NON graditi (ESCLUDI SEMPRE): ${p.cibi_non_graditi || 'nessuno specificato'}

CALCOLI METABOLICI:
- BMR (Mifflin-St Jeor): ~${bmr || 'n.d.'} kcal
- TDEE stimato: ~${tdee || 'n.d.'} kcal
- Target kcal giorno allenamento: ${kcalTarget} kcal
- Target kcal giorno riposo: ${kcalRiposo} kcal

REGOLE ASSOLUTE:
1. ESCLUDI SEMPRE i cibi non graditi dall'utente — zero eccezioni
2. Rispetta tutte le preferenze alimentari e intolleranze
3. Ogni pasto deve avere ingredienti specifici e realistici con grammature (es. "150g petto di pollo, 80g riso basmati")
4. La ricetta deve essere concisa ma pratica (2-3 frasi)
5. Split allenamento automatico basato su frequenza e livello
6. Giorni riposo: proteine mantenute, carboidrati ridotti del 25%
7. Usa fonti proteiche variate durante la settimana
8. I pasti devono essere appetibili e fattibili per un italiano medio
9. Includi colazione, ${p.pasti_al_giorno >= 5 ? 'spuntino mattina, ' : ''}pranzo${p.pasti_al_giorno >= 4 ? ', spuntino pomeriggio' : ''}, cena per ogni giorno`

      const GENERATE_PLAN_TOOL = {
        name: 'create_weekly_plan',
        description: 'Crea il piano settimanale completo di nutrizione e fitness per 7 giorni',
        input_schema: {
          type: 'object',
          properties: {
            macros_target: {
              type: 'object',
              properties: {
                kcal_allenamento: { type: 'number' },
                kcal_riposo: { type: 'number' },
                proteine_g: { type: 'number' },
                carboidrati_allenamento_g: { type: 'number' },
                carboidrati_riposo_g: { type: 'number' },
                grassi_g: { type: 'number' },
                note: { type: 'string' },
              },
              required: ['kcal_allenamento', 'kcal_riposo', 'proteine_g', 'carboidrati_allenamento_g', 'grassi_g'],
            },
            giorni: {
              type: 'array',
              minItems: 7, maxItems: 7,
              items: {
                type: 'object',
                properties: {
                  giorno: { type: 'string' },
                  sigla: { type: 'string' },
                  tipo_allenamento: { type: 'string', enum: ['push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'riposo_attivo', 'riposo', 'cardio', 'ppll'] },
                  sessione_label: { type: 'string' },
                  muscoli: { type: 'array', items: { type: 'string' } },
                  durata_min: { type: 'number' },
                  kcal_bonus: { type: 'number' },
                  esercizi: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        nome: { type: 'string' },
                        serie: { type: 'number' },
                        reps: { type: 'string' },
                        recupero_s: { type: 'number' },
                        rir: { type: 'number' },
                        muscolo_primario: { type: 'string' },
                        note: { type: 'string' },
                      },
                      required: ['nome', 'serie', 'reps', 'recupero_s'],
                    },
                  },
                  note_sessione: { type: 'string' },
                  kcal_totali: { type: 'number' },
                  macro: {
                    type: 'object',
                    properties: { proteine: { type: 'number' }, carboidrati: { type: 'number' }, grassi: { type: 'number' } },
                    required: ['proteine', 'carboidrati', 'grassi'],
                  },
                  pasti: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        tipo: { type: 'string', enum: ['colazione', 'spuntino', 'pranzo', 'cena'] },
                        nome: { type: 'string' },
                        alimenti: { type: 'array', items: { type: 'string' } },
                        kcal: { type: 'number' },
                        macro: {
                          type: 'object',
                          properties: { p: { type: 'number' }, c: { type: 'number' }, g: { type: 'number' } },
                          required: ['p', 'c', 'g'],
                        },
                        ricetta: { type: 'string' },
                      },
                      required: ['tipo', 'nome', 'alimenti', 'kcal', 'macro', 'ricetta'],
                    },
                  },
                  note: { type: 'string' },
                },
                required: ['giorno', 'sigla', 'tipo_allenamento', 'sessione_label', 'muscoli', 'kcal_totali', 'macro', 'pasti'],
              },
            },
          },
          required: ['macros_target', 'giorni'],
        },
      }

      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 16000,
          system: systemPrompt,
          tools: [GENERATE_PLAN_TOOL],
          tool_choice: { type: 'any' },
          messages: [{ role: 'user', content: 'Genera il piano settimanale completo e personalizzato per questo utente. Sii creativo con i pasti, vari durante la settimana, e preciso con le grammature degli ingredienti.' }],
        })

        const toolUse = response.content.find(b => b.type === 'tool_use' && b.name === 'create_weekly_plan')
        if (!toolUse) {
          res.status(500).json({ error: 'Il modello non ha generato il piano strutturato' })
          return
        }

        const giorni = toolUse.input?.giorni
        if (!Array.isArray(giorni) || giorni.length !== 7) {
          console.error('generate-plan: giorni malformati', JSON.stringify(toolUse.input).substring(0, 200))
          res.status(500).json({ error: 'Piano generato incompleto (giorni mancanti). Riprova.' })
          return
        }

        // Add dates starting from this week's Sunday
        const today = new Date()
        const todayDow = today.getDay()
        const sunday = new Date(today)
        sunday.setDate(today.getDate() - todayDow)

        const piano = giorni.map((g, i) => {
          const d = new Date(sunday)
          d.setDate(sunday.getDate() + i)
          return {
            ...g,
            data: d.getDate(),
            pasti: (g.pasti || []).map(p => ({ ...p, completato: false })),
          }
        })

        res.json({ ok: true, piano, macros_target: toolUse.input.macros_target })
      } catch (e) {
        console.error('generate-plan error:', e.message)
        res.status(500).json({ error: e.message })
      }
      return
    }

    if (req.method !== 'POST' || path !== '/chat') {
      res.status(404).json({ error: 'Not found' })
      return
    }

    const { messages, profile, plan } = req.body
    if (!messages?.length) {
      res.status(400).json({ error: 'messages required' })
      return
    }

    const apiKey = anthropicKey.value()
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' })
      return
    }

    const client = new Anthropic({ apiKey })

    try {
      const actions = []
      const NUTRI_SYSTEM = buildNutriSystem(profile, plan)

      let response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: NUTRI_SYSTEM,
        tools: TOOLS,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      })

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
            result.message = `Scheda generata: ${input.split || 'personalizzata'} ${input.frequenza}x/sett`
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: tool.id,
            content: JSON.stringify(result),
          })
        }

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

      const textBlock = response.content.find(b => b.type === 'text')
      const finalText = textBlock?.text ?? ''

      res.json({ content: finalText, actions })
    } catch (err) {
      console.error('Anthropic error:', err.message)
      res.status(500).json({ error: err.message })
    }
  }
)

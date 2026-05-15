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

    // ── analyze-diet ──────────────────────────────────────────────────────
    if (req.method === 'POST' && path === '/analyze-diet') {
      const { imageBase64, mediaType, profile } = req.body
      const apiKey = anthropicKey.value()
      if (!apiKey) { res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' }); return }
      if (!imageBase64 || !mediaType) { res.status(400).json({ error: 'imageBase64 e mediaType richiesti' }); return }
      const client = new Anthropic({ apiKey })

      const p = profile || {}
      const systemPrompt = `Sei NUTRI, il nutrizionista AI di forma.ai. Parli in prima persona come un professionista che ha davanti a sé il paziente.
Analizza la dieta/piano alimentare caricato dall'utente con occhio clinico e tono diretto ma empatico.
Il tuo output è una consulenza vera — non un elenco di bullet points, ma un testo fluente che suona come una conversazione con un nutrizionista esperto.
Rispondi SEMPRE in italiano.`

      const userPrompt = `Questo è il profilo dell'utente:
- Obiettivo: ${p.obiettivo || 'non specificato'}
- Sesso: ${p.sesso || 'n.d.'}, Età: ${p.eta || 'n.d.'} anni, Peso: ${p.peso_kg || 'n.d.'} kg
- Frequenza allenamento: ${p.frequenza_allenamento || 'n.d.'} sessioni/settimana
- Luogo: ${p.luogo_allenamento || 'palestra'}, Livello: ${p.livello_attivita || 'intermedio'}
- Obiettivo workout: ${p.obiettivo_workout || 'non specificato'}
- Preferenze: ${Array.isArray(p.preferenze_alimentari) ? p.preferenze_alimentari.join(', ') : 'nessuna'}
- Intolleranze: ${Array.isArray(p.intolleranze) ? p.intolleranze.join(', ') : 'nessuna'}

Analizza la sua vecchia dieta/piano alimentare caricato nell'immagine.
Poi rispondi con un JSON in questo formato esatto (nessun testo fuori dal JSON):
{
  "titolo": "stringa breve tipo 'Dieta analizzata — ecco cosa ho trovato'",
  "consulenza": "testo fluente 3-5 frasi, tono diretto e professionale come un nutrizionista che parla al paziente. Commenta cosa va bene, cosa manca o è sbagliato rispetto al profilo, e un riferimento scientifico naturale (es. 'secondo le linee guida ISSN 2017...'). NO elenchi puntati qui.",
  "punti_critici": ["max 3 punti brevi, i problemi principali da correggere"],
  "punti_positivi": ["max 2 punti brevi, cosa funziona già"],
  "macro_stimati": { "kcal": 0, "proteine_g": 0, "carboidrati_g": 0, "grassi_g": 0 },
  "integrata_nel_piano": true
}`

      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
              { type: 'text', text: userPrompt },
            ],
          }],
        })
        const raw = response.content[0]?.text || '{}'
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('Risposta non valida da Claude')
        const result = JSON.parse(jsonMatch[0])
        res.json({ ok: true, result })
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
      return
    }

    // ── generate-plan ─────────────────────────────────────────────────────
    if (req.method === 'POST' && path === '/generate-plan') {
      const { profile, dieta_analisi } = req.body
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

      const systemPrompt = `Sei un nutrizionista e coach sportivo AI scientifico. Genera un piano alimentare e fitness SETTIMANALE personalizzato per questo utente, partendo da domenica (indice 0) a sabato (indice 6).

LINEE GUIDA SCIENTIFICHE (LARN 2014 / ACSM / Schoenfeld):
- Proteine: 1.6-2.2 g/kg per ipertrofia, 1.2-1.6 g/kg per mantenimento, 2.2-2.8 g/kg per dimagrimento preservando massa
- Carboidrati: 3-7 g/kg per atleti; giorni riposo -25%; priorità complessi (avena, riso, pasta integrale, patate)
- Grassi: 0.8-1.2 g/kg, fonti: olio EVO, avocado, frutta secca, pesce grasso
- Fibra: 25-35g/die da verdure, legumi, cereali integrali
- Valori nutrizionali chiave: pollo 100g=165kcal P31g G3.6g; uova 1 grande=70kcal P6g G5g; riso cotto 100g=130kcal C28g; pasta 80g cruda=286kcal C57g P10g; salmone 150g=280kcal P37g G14g; fiocchi avena 50g=185kcal C32g P6.5g
- Split: 3x=PPL o full body; 4x=upper-lower; 5x=push-pull-legs+upper+lower; 6x=PPL×2
- Ipertrofia: 3-4 serie, 6-12 reps, 60-90s recupero, RIR 1-2; Forza: 3-5 serie, 3-5 reps, 2-4min recupero
- Progressione: volume settimanale 10-20 serie/gruppo muscolare; deload ogni 4-6 settimane

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

CALCOLI METABOLICI PRE-CALCOLATI (usa questi come base):
- BMR (Mifflin-St Jeor): ~${bmr || 'n.d.'} kcal
- TDEE stimato: ~${tdee || 'n.d.'} kcal
- Target kcal giorno allenamento: ${kcalTarget} kcal
- Target kcal giorno riposo: ${kcalRiposo} kcal

REGOLE ASSOLUTE:
1. ESCLUDI SEMPRE i cibi non graditi — zero eccezioni
2. Ogni giorno ha ESATTAMENTE questi pasti (no duplicati, no extra): colazione${p.pasti_al_giorno >= 5 ? ', spuntino_mattina' : ''}, pranzo${p.pasti_al_giorno >= 4 ? ', spuntino' : ''}, cena — STOP. Non aggiungere altri spuntini.
3. VARIETÀ OBBLIGATORIA fonti proteiche: pollo / manzo / salmone / tonno / uova / legumi / ricotta / merluzzo — ruota ogni giorno, mai la stessa fonte 2 giorni di fila
4. VARIETÀ OBBLIGATORIA carboidrati: riso / pasta / patate / pane integrale / avena / farro / quinoa — cambia ogni giorno
5. Valori nutrizionali accurati (es. pollo 150g=247kcal P46.5g G5.4g; salmone 150g=280kcal P37g G14g)
6. Grammature realistiche con valori precisi per ogni alimento
7. Ricetta: 1 frase obbligatoria con metodo cottura (es. "Cuoci il petto di pollo in padella con olio EVO e rosmarino per 15 min.")
8. Split allenamento: frequenza ${p.frequenza_allenamento || 4}x/settimana, obiettivo ${p.obiettivo_workout || 'ipertrofia'}, luogo ${p.luogo_allenamento || 'palestra'}
9. Max 5 esercizi per sessione, RIR 1-2, varia gli esercizi tra i giorni (no stesso esercizio 2 volte in 3 giorni)
10. Giorni riposo: proteine invariate, carboidrati -25%
${dieta_analisi ? `
ANALISI VECCHIA DIETA DELL'UTENTE (usa come contesto per migliorare il piano):
${dieta_analisi}
Mantieni i pattern positivi della vecchia dieta dove applicabile. Correggi i problemi critici identificati.` : ''}`

      const GENERATE_PLAN_TOOL = {
        name: 'create_weekly_plan',
        description: 'Crea il piano settimanale completo di nutrizione e fitness per 7 giorni',
        input_schema: {
          type: 'object',
          properties: {
            giorni: {
              type: 'array',
              minItems: 7, maxItems: 7,
              items: {
                type: 'object',
                properties: {
                  giorno: { type: 'string' },
                  sigla: { type: 'string' },
                  tipo_allenamento: { type: 'string', enum: ['push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'riposo_attivo', 'riposo', 'cardio'] },
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
                      },
                      required: ['nome', 'serie', 'reps', 'recupero_s', 'rir', 'muscolo_primario'],
                    },
                  },
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
                },
                required: ['giorno', 'sigla', 'tipo_allenamento', 'sessione_label', 'muscoli', 'durata_min', 'kcal_totali', 'macro', 'pasti'],
              },
            },
            macros_target: {
              type: 'object',
              properties: {
                kcal_allenamento: { type: 'number' },
                kcal_riposo: { type: 'number' },
                proteine_g: { type: 'number' },
                carboidrati_allenamento_g: { type: 'number' },
                grassi_g: { type: 'number' },
              },
              required: ['kcal_allenamento', 'kcal_riposo', 'proteine_g', 'carboidrati_allenamento_g', 'grassi_g'],
            },
          },
          required: ['giorni', 'macros_target'],
        },
      }

      try {
        // Timeout di 85s — claude-3-5-sonnet veloce e creativo
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 85000)

        let response
        try {
          response = await client.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 8000,
            system: systemPrompt,
            tools: [GENERATE_PLAN_TOOL],
            tool_choice: { type: 'any' },
            messages: [{ role: 'user', content: `Genera il piano. Regole STRETTE per mantenere output compatto:
- nome pasto: max 5 parole creative (es. "Bowl quinoa feta olive", "Uova strapazzate funghi")
- alimenti: max 4 items, formato "Xg cibo" (es. "150g pollo", "80g riso")
- ricetta: max 8 parole (es. "Grigliato con olio EVO e erbe")
- sessione_label: max 4 parole (es. "Upper A - Petto")
- muscoli: max 3 items
- nome esercizio: max 3 parole
Creatività nei pasti, varietà proteica ogni giorno.` }],
          }, { signal: controller.signal })
        } finally {
          clearTimeout(timeoutId)
        }

        const toolUse = response.content?.find(b => b.type === 'tool_use' && b.name === 'create_weekly_plan')
        if (!toolUse) {
          console.error('generate-plan: toolUse non trovato, content:', JSON.stringify(response.content).substring(0, 300))
          res.status(500).json({ error: 'Il modello non ha generato il piano strutturato. Riprova.' })
          return
        }

        const giorni = toolUse.input?.giorni
        if (!Array.isArray(giorni) || giorni.length !== 7) {
          console.error('generate-plan: giorni malformati, length:', giorni?.length, 'keys:', Object.keys(toolUse.input || {}), JSON.stringify(toolUse.input).substring(0, 500))
          res.status(500).json({ error: `Piano generato incompleto (${giorni?.length ?? 0}/7 giorni). Riprova.` })
          return
        }

        // Add dates starting from this week's Sunday
        const today = new Date()
        const todayDow = today.getDay()
        const sunday = new Date(today)
        sunday.setDate(today.getDate() - todayDow)

        const MEAL_ORDER = ['colazione', 'spuntino_mattina', 'pranzo', 'spuntino', 'cena']
        const piano = giorni.map((g, i) => {
          if (!g || typeof g !== 'object') {
            console.error('generate-plan: giorno malformato a indice', i)
            return null
          }
          const d = new Date(sunday)
          d.setDate(sunday.getDate() + i)
          const pastiRaw = Array.isArray(g.pasti) ? g.pasti : []

          // Dedup: tieni solo il primo pasto per ogni tipo (evita 10 spuntini)
          const seenTipi = new Set()
          const pastiDedup = pastiRaw
            .filter(p => p && typeof p === 'object' && p.tipo)
            .filter(p => {
              if (seenTipi.has(p.tipo)) return false
              seenTipi.add(p.tipo)
              return true
            })
            .sort((a, b) => MEAL_ORDER.indexOf(a.tipo) - MEAL_ORDER.indexOf(b.tipo))
            .map(p => ({
              ...p,
              completato: false,
              // Garantisce ricetta sempre presente
              ricetta: p.ricetta || `Prepara ${p.nome} secondo preferenza.`,
              alimenti: Array.isArray(p.alimenti) ? p.alimenti : [],
            }))

          return {
            ...g,
            data: d.getDate(),
            pasti: pastiDedup,
          }
        }).filter(Boolean)

        if (piano.length !== 7) {
          res.status(500).json({ error: 'Piano generato con giorni non validi. Riprova.' })
          return
        }

        console.log('generate-plan: successo', piano.length, 'giorni')
        res.json({ ok: true, piano, macros_target: toolUse.input.macros_target })
      } catch (e) {
        const isTimeout = e.name === 'AbortError' || e.message?.includes('aborted')
        console.error('generate-plan error:', e.name, e.message)
        if (isTimeout) {
          res.status(504).json({ error: 'Generazione troppo lenta. Riprova — di solito il secondo tentativo è più veloce.' })
        } else {
          res.status(500).json({ error: e.message || 'Errore generazione piano' })
        }
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

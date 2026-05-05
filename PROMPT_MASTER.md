# FORMA.AI — Prompt Master per Claude Code (Antigravity)
# Copia e incolla integralmente all'inizio di ogni sessione

---

## Chi sei e cosa stai costruendo

Stai lavorando su **forma.ai**, un'app mobile di nutrizione AI sviluppata da Informamentis S.r.l. (Pellegrino Bozzella, Dubai). Il progetto è nella cartella `/forma-ai` sul Mac del founder.

forma.ai è la prima app italiana che adatta automaticamente il piano nutrizionale in base all'allenamento del giorno. Non un contacalorie — un biologo nutrizionista AI che conosce ogni utente e risponde H24 in italiano naturale.

---

## Stack tecnologico — NON deviare

```
Frontend:     React + Capacitor 6 (iOS + Android, codebase unica)
Stile:        NativeWind 4.x (Tailwind) per utility classes
Animazioni:   Framer Motion — per TUTTE le animazioni, nessuna eccezione
Grafici:      Recharts (macro rings, grafici peso)
Micro-anim:   Lottie React (streak, achievements, celebrazioni)
Backend:      Supabase (PostgreSQL + Storage + Edge Functions + pgvector)
AI Agent:     Claude API — modello claude-sonnet-4-6
Vision:       Claude Vision nativo — NO Google Vision, NO Tesseract, NO servizi terzi
Knowledge:    pgvector su Supabase (RAG su LARN 2024, tabelle CREA, USDA)
Pagamenti:    RevenueCat (in-app iOS/Android) + Stripe (web)
Notifiche:    OneSignal
Content:      Higgsfield Pro (foto piatti Nano Banana Pro + video esercizi Kling 3.0)
Language:     TypeScript strict mode — obbligatorio ovunque
```

---

## Design System — REGOLE INDEROGABILI

### Riferimento visivo
Stile ispirato a: **Habit & Fitness Tracker App** (Behance, ITO Digital Agency, 2025).
Fedele al Behance ma con la palette forma.ai. Dark profondo organico, non il dark freddo delle tech app americane.

### Token colori — usa SOLO questi hex

```css
/* Background layers */
--bg:           #0E0E0B;   /* background principale — quasi nero organico */
--bg2:          #161613;   /* header, bottom nav */
--bg3:          #1E1E1A;   /* card primo livello */
--bg4:          #252521;   /* card annidate, input fields */

/* Colore primario */
--sage:         #7A9E7E;   /* accent principale, anelli progress, CTA */
--sage-light:   #9EC4A2;   /* testo su dark, highlights, badge */
--sage-dark:    #4A6B4E;   /* bubble chat utente, CTA secondari */
--sage-glow:    rgba(122,158,126,0.15);  /* glow card allenamento */
--sage-glow2:   rgba(122,158,126,0.08); /* sfondo note agente */

/* Accenti semantici */
--terra:        #C4714A;   /* calorie totali, warning, eccessi */
--gold:         #C9A84C;   /* carboidrati, streak, achievements */

/* Testo */
--white:        #F5F2ED;   /* testo principale — bianco caldo */
--white60:      rgba(245,242,237,0.6);   /* testo secondario */
--white30:      rgba(245,242,237,0.3);   /* testo terziario, placeholder */
--white10:      rgba(245,242,237,0.1);   /* bordi card, separatori */
--white05:      rgba(245,242,237,0.05);  /* sfondo card subtle */
```

### Tipografia — solo questi font

```
Font primario:  Sora (Google Fonts) — per tutto il testo UI
Font dati:      DM Mono (Google Fonts) — per numeri, calorie, macro, orari

Display hero:   Sora 800, 28-32px, letter-spacing -0.5px
Card title:     Sora 700, 17-20px, letter-spacing -0.3px
Body:           Sora 400, 12-14px, line-height 1.6
Label nav:      Sora 500, 9-10px, uppercase, letter-spacing 0.3px
Dati numerici:  DM Mono 500, 11-16px, letter-spacing -0.3px
```

### Componenti — regole costruttive

```
Border radius card principale:    20-24px
Border radius card interna:       14-16px
Border radius pill / CTA:         50px
Border radius input:              50px

Bordo card standard:   1px solid rgba(245,242,237,0.08)
Bordo card hover:      1px solid rgba(245,242,237,0.15)
Bordo card allenamento (accent top): 2px solid #7A9E7E solo sul top

Profondità: MAI shadow tradizionali — usa SOLO differenza di background color tra layer
Icone bottom nav: stroke outline 1.8px, dimensione 20px, nessuna fill
Anello calorie: SVG stroke-dasharray, stroke #7A9E7E, sfondo rgba(245,242,237,0.06)
Card verde (pranzo/feature): gradient da rgba(74,107,78,0.9) a rgba(50,80,54,0.95)
Transizioni: 0.2s ease — SOLO con Framer Motion, mai CSS transitions raw
```

### Struttura schermate — invariabile

Ogni schermata ha:
1. Status bar (ora + icone batteria/wifi)
2. Header contestuale
3. Contenuto scrollabile
4. Bottom nav fissa a 4 voci: Home | Piano | Chat | Profilo

---

## Architettura Claude API — CRITICA

### Regola fondamentale
**Claude Vision gestisce TUTTO il riconoscimento immagini e testo.**
- Foto pasto → Claude Vision (stima calorie + macro)
- Barcode prodotto → Claude Vision (legge etichetta nutrizionale)
- PDF analisi cliniche → Claude Vision (estrae valori + commenta rispetto al piano)
- NON usare Google Vision API
- NON usare Tesseract OCR
- NON usare altri servizi di riconoscimento

### Chiamata API con immagine

```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT, // vedi sotto
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg', // o image/png, application/pdf
            data: base64ImageOrPDF
          }
        },
        {
          type: 'text',
          text: 'Analizza questo pasto rispetto al mio piano di oggi.'
        }
      ]
    }]
  })
});
```

### System prompt agente — template da iniettare

```
Sei il nutrizionista AI di forma.ai. Il tuo nome è NUTRI.
Rispondi SEMPRE in italiano naturale, mai tradotto.
Tono: professionale, caldo, mai punitivo, mai giudicante.

Profilo utente:
- Nome: {USER_NAME}
- Obiettivo: {GOAL} (es: dimagrimento / massa / mantenimento)
- Peso: {WEIGHT}kg | Altezza: {HEIGHT}cm | Età: {AGE}
- Intolleranze: {INTOLERANCES}

Piano oggi ({DATE}):
- Allenamento: {WORKOUT_TYPE}
- Calorie target: {KCAL} kcal
- Macro: Proteine {P}g | Carboidrati {C}g | Grassi {G}g
- Calorie consumate finora: {CONSUMED} kcal
- Rimanenti: {REMAINING} kcal

Piano settimanale (sintesi): {WEEKLY_PLAN_SUMMARY}

Regole:
1. Ogni raccomandazione alimentare specifica deve concludere con:
   "Ricorda: consulta sempre il tuo medico o dietologo per valutazioni cliniche."
2. Per le analisi del sangue: commenta i valori fuori range e suggerisci
   modifiche alimentari, ma NON diagnosticare mai condizioni mediche.
3. Celebra i progressi, non punire gli scivoloni.
4. Risposte concise (max 4 righe) salvo richieste di spiegazioni dettagliate.
```

---

## Struttura cartelle progetto

```
/forma-ai
├── src/
│   ├── components/
│   │   ├── ui/              # componenti base (Card, Button, Input, Badge)
│   │   ├── charts/          # MacroRing, WeightChart, ProgressBar
│   │   ├── meal/            # MealCard, MealPhoto, MealLog
│   │   ├── workout/         # WorkoutCard, ExercisePlayer, MacroBadge
│   │   └── chat/            # ChatBubble, ChatInput, AgentTyping
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── PlanScreen.tsx
│   │   ├── WorkoutScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── DiaryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── hooks/
│   │   ├── useAgent.ts      # chiamate Claude API
│   │   ├── usePlan.ts       # piano settimanale
│   │   ├── useDiary.ts      # diario pasti
│   │   ├── useWorkout.ts    # scheda allenamento
│   │   └── useVision.ts     # foto → Claude Vision
│   ├── lib/
│   │   ├── supabase.ts      # client Supabase
│   │   ├── claude.ts        # wrapper Claude API + Vision
│   │   ├── revenuecat.ts    # abbonamenti
│   │   └── onesignal.ts     # notifiche
│   ├── design/
│   │   ├── tokens.ts        # colori, tipografia, spacing (unica fonte di verità)
│   │   ├── theme.ts         # NativeWind theme config
│   │   └── fonts.ts         # caricamento Sora + DM Mono
│   └── assets/
│       ├── meals/           # foto piatti da Higgsfield (300+)
│       ├── exercises/       # video esercizi da Higgsfield (80+)
│       └── lottie/          # animazioni streak e achievements
├── supabase/
│   ├── migrations/          # schema SQL completo
│   └── functions/           # Edge Functions (plan-generator, macro-calculator)
├── capacitor.config.ts
├── tailwind.config.js       # NativeWind config con token FORMA
├── tsconfig.json
└── BLUEPRINT.md             # questo file
```

---

## Regole di sviluppo — lista di controllo

Prima di ogni commit verifica:

- [ ] Palette colori rispetta ESATTAMENTE i token definiti (zero hex non dichiarati)
- [ ] Nessuna shadow tradizionale (`box-shadow`, `drop-shadow`) — solo background depth
- [ ] Ogni animazione usa Framer Motion (nessuna CSS `transition` raw)
- [ ] Ogni riconoscimento immagine usa Claude Vision nativo
- [ ] TypeScript strict mode — zero `any`
- [ ] Supabase RLS attivo su ogni tabella
- [ ] RevenueCat per paywall — mai Stripe direttamente in-app mobile
- [ ] Disclaimer medico presente in ogni risposta con raccomandazioni nutrizionali
- [ ] Font: solo Sora + DM Mono — mai system fonts
- [ ] Bottom nav presente su ogni schermata con voce attiva evidenziata in --sage

---

## Prompt pronti per le feature principali

### Generazione piano settimanale

```typescript
const PLAN_PROMPT = `
Genera un piano alimentare settimanale per ${userName}.

Dati:
- Età: ${age} | Peso: ${weight}kg | Altezza: ${height}cm
- Obiettivo: ${goal}
- Allenamenti: ${workoutType} x ${workoutsPerWeek} volte/settimana
- Intolleranze: ${intolerances.join(', ') || 'nessuna'}
- Preferenze: ${preferences.join(', ') || 'nessuna'}
- Budget alimentare: EUR ${weeklyBudget}/settimana

Rispondi SOLO con JSON valido in questo schema esatto (nessun testo fuori dal JSON):
{
  "giorni": [
    {
      "giorno": "Lunedì",
      "tipo_allenamento": "gambe",
      "kcal_totali": 1840,
      "macro": { "proteine": 185, "carboidrati": 220, "grassi": 62 },
      "pasti": [
        {
          "tipo": "colazione",
          "nome": "Avena proteica con frutti rossi",
          "alimenti": ["Fiocchi d'avena 80g", "Uova 2", "Frutti rossi 100g", "Latte PS 150ml"],
          "kcal": 480,
          "macro": { "p": 28, "c": 65, "g": 12 },
          "ricetta": "Cuoci i fiocchi d'avena nel latte 5 minuti. Aggiungi le uova strapazzate a parte. Completa con i frutti rossi freschi.",
          "foto_query": "oatmeal bowl with berries and eggs Italian breakfast"
        }
      ]
    }
  ],
  "note_settimanali": "Piano ad alto contenuto proteico per supportare l'ipertrofia. Nei giorni di allenamento i carboidrati aumentano del 20% per ottimizzare le performance."
}
`;
```

### Analisi foto pasto (Claude Vision)

```typescript
const MEAL_VISION_PROMPT = `
Analizza questo pasto.

Contesto:
- Calorie rimanenti oggi: ${remainingKcal} kcal
- Macro rimanenti: P ${remainingP}g | C ${remainingC}g | G ${remainingG}g
- Allenamento odierno: ${todayWorkout}

Rispondimi con JSON:
{
  "nome_pasto_stimato": "...",
  "kcal_stimate": 000,
  "macro_stimati": { "p": 00, "c": 00, "g": 00 },
  "in_linea_con_piano": true/false,
  "messaggio": "Testo breve max 2 righe, tono positivo",
  "suggerimento": "Eventuale aggiunta/sostituzione (null se non necessario)"
}
`;
```

### Lettura analisi cliniche (Claude Vision)

```typescript
const CLINICAL_PROMPT = `
Leggi questi referti clinici e aiutami a capire cosa significano per la mia dieta.

Piano alimentare attuale (sintesi): ${planSummary}
Obiettivo: ${goal}

Per ogni valore fuori range trovato:
1. Spiega cosa significa in parole semplici
2. Suggerisci una modifica alimentare specifica e pratica

Formato risposta JSON:
{
  "valori_analizzati": [
    {
      "nome": "Vitamina D",
      "valore": "18 ng/mL",
      "range_normale": "30-100 ng/mL",
      "stato": "basso",
      "significato": "La vitamina D è importante per...",
      "modifica_alimentare": "Aumenta il consumo di pesce azzurro (sardine, sgombro) 3 volte/settimana e uova ogni giorno."
    }
  ],
  "riepilogo": "Breve riepilogo generale",
  "disclaimer": "Questi dati sono informativi. Condividi sempre i tuoi referti con il medico curante per una valutazione clinica completa."
}
`;
```

---

## Supabase — Schema SQL di base

```sql
-- Esegui in ordine in Supabase SQL Editor

-- 1. Utenti (estende auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  age integer,
  weight_kg decimal(5,2),
  height_cm integer,
  goal text check (goal in ('dimagrimento','massa','mantenimento','patologia')),
  workout_type text,
  workouts_per_week integer default 3,
  intolerances text[],
  preferences text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users see own profile" on public.profiles for all using (auth.uid() = id);

-- 2. Piani nutrizionali
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  week_start date not null,
  plan_json jsonb not null,
  created_at timestamptz default now()
);
alter table public.plans enable row level security;
create policy "Users see own plans" on public.plans for all using (auth.uid() = user_id);

-- 3. Diario pasti
create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  meal_type text check (meal_type in ('colazione','pranzo','cena','spuntino')),
  description text,
  photo_url text,
  kcal_estimated integer,
  macro_json jsonb,
  agent_comment text,
  created_at timestamptz default now()
);
alter table public.diary_entries enable row level security;
create policy "Users see own diary" on public.diary_entries for all using (auth.uid() = user_id);

-- 4. Log allenamenti
create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  workout_type text not null,
  duration_min integer,
  notes text,
  created_at timestamptz default now()
);
alter table public.workout_logs enable row level security;
create policy "Users see own workouts" on public.workout_logs for all using (auth.uid() = user_id);

-- 5. Chat con agente
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text not null,
  has_image boolean default false,
  created_at timestamptz default now()
);
alter table public.chat_messages enable row level security;
create policy "Users see own chat" on public.chat_messages for all using (auth.uid() = user_id);

-- 6. Analisi cliniche
create table public.clinical_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  file_url text not null,
  agent_analysis jsonb,
  uploaded_at timestamptz default now()
);
alter table public.clinical_uploads enable row level security;
create policy "Users see own clinicals" on public.clinical_uploads for all using (auth.uid() = user_id);

-- 7. Abbonamenti (sync RevenueCat webhook)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  plan text check (plan in ('trial','base','pro','b2b')),
  status text check (status in ('active','expired','cancelled')),
  expires_at timestamptz,
  revenuecat_id text unique,
  updated_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create policy "Users see own subscription" on public.subscriptions for all using (auth.uid() = user_id);

-- 8. Vettori RAG nutrizionale
create extension if not exists vector;
create table public.nutrition_embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  source text,
  category text
);
create index on public.nutrition_embeddings using ivfflat (embedding vector_cosine_ops);
-- Questa tabella è pubblica in lettura (nessuna RLS) — solo admin può scrivere
```

---

## Prima sessione — comandi iniziali

Quando apri Claude Code in Antigravity per la prima volta sul progetto:

```bash
# 1. Vai nella cartella
cd /forma-ai

# 2. Inizializza progetto Capacitor + React
npm create vite@latest . -- --template react-ts
npm install
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init forma-ai ai.forma.app

# 3. Installa dipendenze core
npm install framer-motion @supabase/supabase-js nativewind
npm install recharts lottie-react
npm install react-query @tanstack/react-query

# 4. Font Google
# In index.html aggiungi:
# <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

# 5. Configura Tailwind con token FORMA
# Vedi design/tokens.ts per i valori esatti
```

---

*forma.ai — Blueprint Prompt v1.0 — Maggio 2026*
*Informamentis S.r.l. — Pellegrino Bozzella — Dubai*

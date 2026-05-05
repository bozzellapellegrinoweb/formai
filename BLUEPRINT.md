# forma.ai — Blueprint Completo
**Informamentis S.r.l. | Pellegrino Bozzella | Dubai**
**Versione 1.0 — Maggio 2026 | Confidenziale**

---

## Indice

1. [Visione](#1-visione)
2. [Mercato](#2-mercato)
3. [Prodotto MVP](#3-prodotto-mvp)
4. [Design System](#4-design-system)
5. [Stack Tecnico](#5-stack-tecnico)
6. [Architettura AI](#6-architettura-ai)
7. [Higgsfield Strategy](#7-higgsfield-strategy)
8. [Modello di Business](#8-modello-di-business)
9. [Roadmap 24 Mesi](#9-roadmap-24-mesi)
10. [Risk Assessment](#10-risk-assessment)
11. [Go-to-Market](#11-go-to-market)
12. [Prompt Claude Code](#12-prompt-claude-code)

---

## 1. Visione

### La promessa unica

> **"La tua dieta cambia ogni giorno in base a come ti alleni."**

forma.ai è la prima app italiana di nutrizione che adatta automaticamente il piano alimentare all'allenamento del giorno. Non un contacalorie. Un biologo nutrizionista AI che conosce ogni utente, risponde H24 in italiano naturale, e integra analisi cliniche, foto pasti e video esercizi in un'unica esperienza coerente.

### Problema → Soluzione

| Problema di mercato | Risposta forma.ai |
|---|---|
| Nutrizione e allenamento vivono in app separate | Piano che si adatta automaticamente ogni giorno |
| Zero AI nutrizionale in italiano, zero localizzazione | Agente AI in italiano naturale, DB alimenti italiani |
| Nutrizionista = 80-150 EUR a visita | Accesso H24 a 6.99 EUR/mese |
| Analisi cliniche mai integrate con la dieta | Claude Vision legge PDF e commenta rispetto al piano |
| App fitness graficamente piatte, poco coinvolgenti | UI dark premium ispirata al Behance reference |

### Nome e identità

- **Prodotto:** forma.ai
- **Società:** Informamentis S.r.l.
- **Tagline:** *"Il tuo nutrizionista. Sempre con te."*
- **Posizionamento:** Premium, italiano, scientifico ma accessibile

---

## 2. Mercato

### Italia 2026 — Dati verificati

| KPI | Valore | Fonte | Data |
|---|---|---|---|
| Mercato fitness app IT 2026 | ~€258M | Grand View Research | Gen 2026 |
| CAGR 2026-2033 | 14.2% | Grand View Research | Gen 2026 |
| Target Italia 2033 | €663M | Grand View Research | Gen 2026 |
| Mercato EU fitness app 2026 | €4.15B | Market Data Forecast | Feb 2026 |
| ARPU Italia annuo | $16.28 | Statista | 2026 |
| Penetrazione utenti IT | 25.55% → 30.57% | Statista | 2024-2029 |
| Competitor diretti IT con AI nutrizionale | **0** | Analisi diretta | Mag 2026 |

### Gap confermato

I top player italiani nel 2024 (Yuka, Foodvisor) non hanno agente AI conversazionale integrato con l'allenamento. MyFitnessPal domina a livello globale ma non ha localizzazione profonda italiana e non integra analisi cliniche. Il segmento "diet & nutrition AI" in italiano è **completamente scoperto**.

---

## 3. Prodotto MVP

### Filosofia MVP

> Quattro funzioni eseguite in modo impeccabile. Tutto il resto arriva dopo 10.000 utenti attivi.

### Feature 1 — Piano Nutrizionale AI

Onboarding 3 minuti → Claude API genera dieta settimanale → ogni pasto con foto (Higgsfield Nano Banana Pro) + ricetta step-by-step + macro dettagliati. Export PDF.

**Cosa lo rende diverso:** database alimenti italiano profondo (pizze regionali, paste, salumi, formaggi DOP). Non una traduzione di MyFitnessPal.

### Feature 2 — Adattamento Macro per Allenamento ⭐ IL DIFFERENZIATORE

L'utente indica il tipo di allenamento. forma.ai ricalcola automaticamente calorie e macro per quella giornata.

```
Giorno gambe (palestra)  →  +40g carboidrati a pranzo, +200 kcal totali
Giorno corsa 10km        →  +carboidrati pre-run, +elettroliti
Giorno yoga              →  deficit leggero, focus antiossidanti
Giorno riposo            →  deficit controllato, proteine invariate
```

Nessuna app italiana fa questo. Nessuna app italiana lo farà nei prossimi 18 mesi.

### Feature 3 — Agente AI H24 con Claude Vision

Chat in italiano naturale. L'agente conosce il piano, l'allenamento di oggi, le ultime 7 giorni di diario.

**Input supportati — tutti elaborati da Claude nativo:**
- Testo libero ("posso mangiare la pizza stasera?")
- Foto pasto → stima calorie + macro + commento contestuale
- Foto barcode → lettura etichetta nutrizionale
- PDF analisi cliniche → estrazione valori + correlazione con piano alimentare
- Audio → STT → risposta testuale

**Claude Vision è usato per tutto. Zero Google Vision. Zero Tesseract. Zero servizi terzi.**

### Feature 4 — Diario Rapido 10 Secondi

Log pasto: foto o testo libero. Nessuna pesatura ossessiva. Tono positivo sempre. Il diario alimenta l'agente per migliorare il piano settimana dopo settimana. Streak celebrativi (Lottie), mai contatori di fallimento.

### Schermate MVP

| Schermata | Contenuto chiave | Note design |
|---|---|---|
| Splash | Hero foto trainer Higgsfield, tagline, CTA | Dark full-bleed, gradiente sage |
| Onboarding | 5 step: obiettivo / fisico / allenamento / preferenze / piano | Progress bar sage, animata |
| Home | Calendario giorni, badge workout+macro, anello calorie, pasti | Card stile Behance |
| Piano Settimanale | Vista 7 giorni, foto piatti, tap per ricetta | Griglia foto AI |
| Scheda Allenamento | Video Higgsfield loopabili, playlist per tipo | Player video inline |
| Chat AI | Bubble chat, upload foto/PDF, risposta real-time | Streaming testo |
| Diario | Log pasti, riepilogo kcal, streak | Timeline verticale |
| Profilo | Dati, obiettivo, progresso peso, abbonamento | Grafici Recharts |

---

## 4. Design System

### Riferimento visivo

**Habit & Fitness Tracker App** — ITO Digital Agency LLC (Behance, aprile 2025)
URL: `https://www.behance.net/gallery/224218247/Habit-Fitness-Tracker-App`

Stile adottato: dark profondo organico, card arrotondate bold, accent cromatico forte su fondo scuro. Verde lime del Behance → **sage #7A9E7E** di forma.ai.

Il file `DESIGN_REFERENCE.html` nella root del progetto riproduce fedelmente tutte le schermate del Behance con la palette forma.ai — usalo come riferimento visivo primario durante lo sviluppo.

### Palette cromatica

```css
/* ── BACKGROUND LAYERS ── */
--bg:           #0E0E0B;   /* principale — quasi nero caldo */
--bg2:          #161613;   /* nav, header */
--bg3:          #1E1E1A;   /* card primo livello */
--bg4:          #252521;   /* card annidate, input */

/* ── COLORE PRIMARIO ── */
--sage:         #7A9E7E;
--sage-light:   #9EC4A2;
--sage-dark:    #4A6B4E;
--sage-glow:    rgba(122,158,126,0.15);
--sage-glow2:   rgba(122,158,126,0.08);

/* ── ACCENTI SEMANTICI ── */
--terra:        #C4714A;   /* calorie, warning */
--gold:         #C9A84C;   /* carboidrati, streak */

/* ── TESTO ── */
--white:        #F5F2ED;
--white60:      rgba(245,242,237,0.6);
--white30:      rgba(245,242,237,0.3);
--white10:      rgba(245,242,237,0.1);
--white05:      rgba(245,242,237,0.05);
```

### Tipografia

```
Font display:   Sora 800 — 28-32px — titoli hero, splash
Font heading:   Sora 700 — 17-20px — card title, sezioni
Font body:      Sora 400 — 12-14px — testo corrente
Font label:     Sora 500 — 9-10px  — nav, badge, tag (uppercase)
Font dati:      DM Mono 500 — 11-16px — calorie, macro, orari
```

### Regole costruttive componenti

```
Border radius card:         20-24px
Border radius card interna: 14-16px
Border radius pill/CTA:     50px
Border radius input:        50px

Bordo card standard:    1px solid rgba(245,242,237,0.08)
Bordo card hover:       1px solid rgba(245,242,237,0.15)
Accent top allenamento: border-top: 2px solid #7A9E7E

Profondità:     SOLO differenza background — mai box-shadow
Animazioni:     Framer Motion 0.2s ease — mai CSS transitions raw
Icone nav:      stroke outline 1.8px, 20px, nessuna fill
Anello kcal:    SVG stroke-dasharray, stroke #7A9E7E
Card verde:     gradient rgba(74,107,78,0.9) → rgba(50,80,54,0.95)
```

---

## 5. Stack Tecnico

### Overview

```
Frontend:     React + Capacitor 6         iOS + Android, codebase unica
Stile:        NativeWind 4.x (Tailwind)   utility classes + token FORMA
Animazioni:   Framer Motion               tutte le animazioni UI
Grafici:      Recharts                    macro rings, grafici peso
Micro-anim:   Lottie React                streak, achievements
Backend:      Supabase                    PostgreSQL + Storage + Edge Functions
AI:           Claude API claude-sonnet-4-6 chat, vision, generazione piani
Vision:       Claude Vision nativo        foto, barcode, PDF — zero terzi
RAG:          pgvector su Supabase        LARN 2024, CREA, USDA
Pagamenti:    RevenueCat + Stripe         in-app + web
Notifiche:    OneSignal
Content:      Higgsfield Pro              foto piatti + video esercizi
Language:     TypeScript strict           ovunque, zero `any`
Dev:          Claude Code (Antigravity)   sviluppo AI-first
```

### Struttura cartelle

```
/forma-ai
├── src/
│   ├── components/
│   │   ├── ui/              Card, Button, Input, Badge, Pill
│   │   ├── charts/          MacroRing, WeightChart, ProgressBar
│   │   ├── meal/            MealCard, MealPhoto, MealLog
│   │   ├── workout/         WorkoutCard, ExercisePlayer, MacroBadge
│   │   └── chat/            ChatBubble, ChatInput, AgentTyping
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
│   │   ├── useAgent.ts      chiamate Claude API
│   │   ├── usePlan.ts       piano settimanale
│   │   ├── useDiary.ts      diario pasti
│   │   ├── useWorkout.ts    scheda allenamento
│   │   └── useVision.ts     foto → Claude Vision
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── claude.ts        wrapper Claude API + Vision
│   │   ├── revenuecat.ts
│   │   └── onesignal.ts
│   └── design/
│       ├── tokens.ts        UNICA fonte di verità per colori e font
│       ├── theme.ts         NativeWind config
│       └── fonts.ts         Sora + DM Mono
├── supabase/
│   ├── migrations/
│   └── functions/
├── DESIGN_REFERENCE.html    ← riproduzione grafica del Behance con palette FORMA
├── BLUEPRINT.md             ← questo file
├── PROMPT_MASTER.md         ← prompt per Claude Code
├── capacitor.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### Schema Supabase (tabelle principali)

```sql
profiles            — utente, obiettivo, dati fisici, preferenze
plans               — piani settimanali generati (JSONB)
diary_entries       — log pasti con foto_url e analisi Claude
workout_logs        — log allenamenti giornalieri
chat_messages       — storico conversazioni agente
clinical_uploads    — PDF analisi cliniche + analisi Claude
subscriptions       — stato RevenueCat (sync webhook)
nutrition_embeddings — vettori pgvector per RAG
```

---

## 6. Architettura AI

### Principio fondamentale

**Claude Vision gestisce TUTTO.** Foto pasto, barcode, PDF analisi cliniche — tutto passa da Claude API con il messaggio contestuale. Zero dipendenze da Google Vision, Tesseract, o altri servizi OCR/vision.

### Flusso agente

```
Utente invia input (testo / foto / PDF)
         ↓
useAgent.ts costruisce il messaggio con:
  - System prompt con profilo utente + piano + allenamento oggi
  - Contenuto utente (testo + eventuale immagine/PDF in base64)
  - Ultime N chat_messages come history
         ↓
Claude API claude-sonnet-4-6
         ↓
Risposta streamed → chat UI
         ↓
Salvataggio in chat_messages (Supabase)
         ↓
Se modifica macro → aggiornamento plans via Edge Function
```

### System prompt — struttura invariabile

```
Identità:       Sei NUTRI, il nutrizionista AI di forma.ai
Lingua:         Risponde SEMPRE in italiano naturale
Tono:           Professionale, caldo, mai punitivo

Contesto iniettato a ogni chiamata:
  {USER_NAME} {AGE} {WEIGHT} {HEIGHT} {GOAL}
  {DATE} {WORKOUT_TYPE}
  {KCAL_TARGET} {P}g {C}g {G}g
  {KCAL_CONSUMED} {REMAINING}
  {WEEKLY_PLAN_SUMMARY}

Regole hard:
  1. Disclaimer medico su ogni raccomandazione clinica
  2. Per analisi del sangue: commenta, NON diagnosticare
  3. Celebra progressi, non punire scivoloni
  4. Risposte max 4 righe salvo richieste esplicite di dettaglio
```

### RAG nutrizionale

```
Fonti:          LARN 2024 (italiane), tabelle CREA, EFSA, USDA
Embedding:      text-embedding-3-small (OpenAI) → pgvector
Retrieval:      cosine similarity, top-5 chunks
Uso:            domande specifiche su alimenti ("quante proteine ha il baccalà?")
```

---

## 7. Higgsfield Strategy

### Piano produzione pre-lancio (Mesi 0-2)

| Tool | Output | Quantità | Uso |
|---|---|---|---|
| Nano Banana Pro (4K) | Foto piatti italiani | 300+ | Piano pasti, diario, ricette |
| Soul ID | Trainer M + Trainer F | 2 personaggi fissi | Coerenza tutti i video |
| Kling 3.0 + Motion Control | Video esercizi 8-15s loopabili | 80 (laterale + frontale) | Scheda allenamento |
| Lipsync Studio | Trainer spiega in italiano | 20 video chiave | Tutorial esercizi complessi |
| Upscale 4K | Tutti gli asset | 100% | Qualità premium percepita |

### Prompt template foto piatti (Nano Banana Pro)

```
Professional food photography of [NOME PIATTO ITALIANO],
Italian cuisine, served on a white matte ceramic plate,
natural side light from left, linen tablecloth texture,
warm ambient light, 45-degree angle shot, shallow depth of field,
editorial magazine style, clean minimalist composition,
4K ultra-sharp, appetizing, no heavy garnish.
```

### Marketing organico ongoing

- **AI Influencer:** Soul ID trainer pubblica 3x/settimana su Instagram + TikTok
- Contenuti: consigli nutrizionali, ricette veloci, myth-busting, motivazione
- CTA fisso: "Scarica forma.ai — link in bio"
- 5 video hero pre-lancio (9:16, Kling 3.0) per paid + organic
- Costo operativo: zero dopo setup Soul ID

---

## 8. Modello di Business

### Pricing

| Piano | Prezzo | Target | Include |
|---|---|---|---|
| Trial | €0 / 7gg | Tutti | Tutto incluso — obbligo scelta dopo |
| **Base** | **€6.99/mese** | Consumer | Piano AI, chat H24, adattamento workout, foto piatti, video esercizi, progress |
| Pro | €9.99/mese | Power user | Base + analisi cliniche, HealthKit/Fit, meal prep, barcode, PDF export |
| Annual Base | €59/anno | Consumer | Sconto 30% — presentato in onboarding |
| B2B Nutrizionista | €29.99/mese | Professionisti | 30 profili pazienti Pro, dashboard, alert, branding, report PDF |

**Regola:** nessun free tier permanente. Solo trial 7 giorni. Il free non costruisce un business, costruisce utenti parassiti.

### Proiezioni

| Milestone | Utenti paganti | MRR | ARR |
|---|---|---|---|
| Lancio (M3) | 150 | €1.1K | €13K |
| M6 | 500 | €3.5K | €42K |
| Anno 1 | 3.000 | €21K | €252K |
| Anno 2 | 15.000 | €105K | €1.26M |

**LTV medio:** €120 (retention 14 mesi × €8.50 ARPU medio)
**CAC target:** < €15 tramite micro-influencer e affiliati PT

---

## 9. Roadmap 24 Mesi

| Periodo | Fase | Deliverable | KPI |
|---|---|---|---|
| M0-2 | Pre-produzione | Design system, 300 foto Higgsfield, Soul ID, 80 video esercizi, RAG pgvector, consulenza legale IT healthtech, schema Supabase | Asset completi prima del codice |
| M3-5 | MVP | App Capacitor iOS+Android, onboarding, piano AI, chat H24, adattamento workout, diario, RevenueCat, beta 500 utenti | 150 paganti, NPS > 40 |
| M6-8 | Crescita 1 | Analisi cliniche Claude Vision, progress tracking, meal prep, barcode, AI Influencer live, PT affiliati | 500 paganti, €3.5K MRR |
| M9-12 | Crescita 2 | Apple Health/Google Fit, notifiche smart, retention optimization, B2B nutrizionisti beta | 2K paganti, €15K MRR |
| M13-18 | Espansione | B2B dashboard completa, piani patologie (PCOS, pre-diabete, colesterolo), ciclo mestruale, wearable avanzati | 8K paganti, €60K MRR |
| M19-24 | Scale | Internazionalizzazione ES+FR, integrazioni palestre, enterprise, eventuale seed round | 15K paganti, €100K+ MRR |

---

## 10. Risk Assessment

| Rischio | Livello | Descrizione | Mitigazione |
|---|---|---|---|
| **Legale / Medico** | 🔴 ALTO | Prescrivere diete è attività riservata in Italia. Analisi cliniche = rischio diagnosi non autorizzata | Consulenza legale healthtech pre-lancio. Advisory board 1-2 biologi nutrizionisti. Disclaimer automatico ogni risposta. Posizionamento: "supporto informativo" |
| **Churn rate** | 🟡 MEDIO | Fitness app perdono 60-70% utenti nei primi 30 giorni. Tono punitivo è il killer principale | Tono sempre positivo. Personalizzazione progressiva = lock-in positivo. Streak celebrativi, zero contatori di fallimento |
| **GDPR dati sanitari** | 🟡 MEDIO | Dati clinici = categoria speciale GDPR art. 9 | Supabase EU region (Francoforte). Consenso esplicito separato. Privacy policy specifica. DPO se necessario |
| **Qualità scientifica** | 🟡 MEDIO | RAG impreciso = consigli nutrizionali sbagliati o pericolosi | Fonti LARN 2024, CREA, EFSA. Review periodica advisory board. Test suite casi edge clinici |
| **Competitivo** | 🟢 BASSO | MyFitnessPal/Noom localizzazione Italia migliorata | First mover 18-24 mesi. DB alimenti italiani profondo. Agente in italiano naturale non tradotto |

---

## 11. Go-to-Market

### Canali di acquisizione

| Canale | Meccanismo | CAC | Note |
|---|---|---|---|
| Micro-influencer fitness IT | Codice sconto + 20% commissione anno 1 | €8-15 | 50K-300K follower, nicchie: body, running, CrossFit |
| Personal Trainer affiliati | 25% ricorrente finché cliente resta | €0 (commission-only) | PT porta clienti, guadagna passivamente |
| AI Influencer Higgsfield | Soul ID 3 post/settimana IG + TikTok | €0 operativo | Setup once, zero costo ongoing |
| Lista d'attesa pre-lancio | Landing page + Meta ads mirati | €2-5 | Target 2.000 iscritti prima del lancio |
| B2B nutrizionisti | Cold outreach LinkedIn | €0 | Pazienti → utenti consumer |

### Timeline GTM

```
M0-1:   Lista d'attesa attiva, Soul ID creato, 5 micro-influencer partner selezionati
M2:     Beta privata 100 utenti, raccolta feedback, NPS baseline
M3:     Lancio App Store + Play Store, codici influencer attivi
M4-6:   Scaling micro-influencer, 20 PT affiliati onboarded, B2B beta
M7+:    Paid acquisition (Meta/TikTok) SOLO dopo CAC < €15 verificato organicamente
```

---

## 12. Prompt Claude Code

Vedi file dedicato: `PROMPT_MASTER.md`

Il prompt master contiene:
- Stack tecnologico completo
- Design system con token esatti
- Architettura Claude API con esempi di codice
- Struttura cartelle progetto
- Schema SQL Supabase completo
- Prompt pronti per ogni feature (generazione piano, analisi foto, analisi cliniche)
- Comandi iniziali per setup progetto

**Uso:** copia e incolla `PROMPT_MASTER.md` integralmente come primo messaggio in ogni sessione Claude Code in Antigravity.

---

*forma.ai Blueprint v1.0 — Maggio 2026*
*Informamentis S.r.l. — Pellegrino Bozzella — Platinum Tower, JLT, Dubai*
*Documento confidenziale — uso interno riservato*

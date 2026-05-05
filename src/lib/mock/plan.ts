export type MealType = 'colazione' | 'pranzo' | 'cena' | 'spuntino'

export interface Pasto {
  tipo: MealType
  nome: string
  alimenti: string[]
  kcal: number
  macro: { p: number; c: number; g: number }
  ricetta: string
  completato: boolean
}

export interface EsercizioScheda {
  nome: string
  serie: number
  reps: string
  recupero_s: number
  rir?: number
  muscolo_primario?: string
  note?: string
}

export interface GiornoPiano {
  giorno: string
  sigla: string
  data: number
  tipo_allenamento: string
  sessione_label: string       // es. "Push A — Petto + Spalle + Tricipiti"
  muscoli: string[]            // es. ["Petto", "Spalle", "Tricipiti", "Core"]
  durata_min?: number
  kcal_bonus?: number
  esercizi?: EsercizioScheda[]
  note_sessione?: string
  kcal_totali: number
  macro: { proteine: number; carboidrati: number; grassi: number }
  pasti: Pasto[]
  note: string
}

// Marco · 82 kg · 180 cm · 30 anni · Intermedio · 5x/sett · Obiettivo: Massa
// Split: PPL ibrido (Push/Pull/Legs/Push/Pull) — evidence-based (Schoenfeld 2016, ACSM 2026)
// Ogni muscolo allenato 2x/settimana · Core incluso ogni sessione · Cardio integrato

export const mockPiano: GiornoPiano[] = [
  // ── DOMENICA — RIPOSO ATTIVO ───────────────────────────────────────────
  {
    giorno: 'Domenica',
    sigla: 'Dom',
    data: 28,
    tipo_allenamento: 'riposo_attivo',
    sessione_label: 'Riposo attivo — Mobilità & Stretching',
    muscoli: [],
    durata_min: 30,
    kcal_bonus: 60,
    note_sessione: 'Mobilità articolare 15min + stretching globale 15min. Recupero attivo per ottimizzare la sintesi proteica post-sessione precedente.',
    kcal_totali: 1640,
    macro: { proteine: 170, carboidrati: 158, grassi: 58 },
    note: 'Giorno di riposo: proteine invariate per supportare il recupero muscolare. Carboidrati ridotti, grassi sani.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'Uova strapazzate con avocado e pane integrale',
        alimenti: ['3 uova intere', 'Mezzo avocado', '2 fette pane integrale', 'Pomodorini'],
        kcal: 430, macro: { p: 28, c: 38, g: 18 },
        ricetta: 'Strapazza le uova in padella con olio EVO. Schiaccia l\'avocado sul pane tostato con sale e limone. Aggiungi i pomodorini freschi.',
        completato: true,
      },
      {
        tipo: 'pranzo',
        nome: 'Insalata di pollo con quinoa e verdure',
        alimenti: ['Petto di pollo 150g', 'Quinoa cotta 100g', 'Spinaci freschi 80g', 'Cetrioli', 'Olio EVO 10g', 'Limone'],
        kcal: 510, macro: { p: 52, c: 50, g: 14 },
        ricetta: 'Cuoci la quinoa in brodo vegetale. Griglia il pollo e taglialo a striscioline. Componi l\'insalata e condisci con olio e limone.',
        completato: true,
      },
      {
        tipo: 'spuntino',
        nome: 'Yogurt greco con frutti di bosco',
        alimenti: ['Yogurt greco 0% 200g', 'Frutti di bosco misti 80g', 'Miele 1 cucchiaino'],
        kcal: 185, macro: { p: 22, c: 22, g: 2 },
        ricetta: 'Metti lo yogurt in una ciotola e aggiungi i frutti di bosco e il miele.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Merluzzo al forno con patate e verdure',
        alimenti: ['Merluzzo 200g', 'Patate 180g', 'Broccoli 150g', 'Olio EVO 12g', 'Rosmarino', 'Aglio'],
        kcal: 515, macro: { p: 68, c: 48, g: 24 },
        ricetta: 'Taglia le patate a cubetti e arrostiscile in forno a 200°C per 25min. Cuoci il merluzzo in forno con olio, aglio e rosmarino per 18min. Servi con broccoli al vapore.',
        completato: false,
      },
    ],
  },

  // ── LUNEDÌ — PUSH A (Petto focus) ─────────────────────────────────────
  {
    giorno: 'Lunedì',
    sigla: 'Lun',
    data: 29,
    tipo_allenamento: 'push',
    sessione_label: 'Push A — Petto + Spalle + Tricipiti + Core',
    muscoli: ['Petto', 'Spalle', 'Tricipiti', 'Core'],
    durata_min: 65,
    kcal_bonus: 210,
    note_sessione: '+40g carb pre-workout · Focus compound petto · RIR 2 sui compound, RIR 1 sugli isolanti · Core ogni sessione',
    esercizi: [
      { nome: 'Panca piana con bilanciere', serie: 4, reps: '8', recupero_s: 180, rir: 2, muscolo_primario: 'Petto', note: 'Schiena neutra, impugnatura larga spalle. Fase discesa 2s controllata.' },
      { nome: 'Panca inclinata con manubri (30°)', serie: 3, reps: '10', recupero_s: 120, rir: 2, muscolo_primario: 'Petto sup.', note: 'Inclinazione 30°, gomiti a 45° dal busto. Non aprire troppo i gomiti.' },
      { nome: 'Dip alle parallele', serie: 3, reps: '8-10', recupero_s: 90, rir: 2, muscolo_primario: 'Petto/Tricipiti', note: 'Busto leggermente inclinato per enfatizzare il petto. Se facile, aggiungi zavorra.' },
      { nome: 'Spinte militari con bilanciere (OHP)', serie: 4, reps: '10', recupero_s: 120, rir: 2, muscolo_primario: 'Spalle', note: 'Barra dal mento, core rigido. Non iperestendere la zona lombare.' },
      { nome: 'Alzate laterali con manubri', serie: 4, reps: '15', recupero_s: 60, rir: 1, muscolo_primario: 'Deltoide med.', note: 'Gomiti leggermente piegati. Arriva ad altezza spalla, non oltre.' },
      { nome: 'Pushdown cavo V-bar', serie: 3, reps: '12', recupero_s: 60, rir: 1, muscolo_primario: 'Tricipiti', note: 'Gomiti fermi ai fianchi. Contrazione completa in basso.' },
      { nome: 'Plank', serie: 3, reps: '45s', recupero_s: 60, rir: 0, muscolo_primario: 'Core', note: 'Corpo rigido, non alzare i glutei. Respira normalmente.' },
    ],
    kcal_totali: 1840,
    macro: { proteine: 185, carboidrati: 215, grassi: 55 },
    note: 'Giorno Push A: carb elevati per energia muscolare. Focus petto con spalle e tricipiti. Core a fine sessione.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'Porridge proteico con banana e mandorle',
        alimenti: ['Fiocchi d\'avena 80g', 'Proteine del siero 30g', 'Banana 1 media', 'Mandorle 15g', 'Latte parzialmente scremato 200ml'],
        kcal: 490, macro: { p: 38, c: 62, g: 12 },
        ricetta: 'Cuoci l\'avena nel latte per 5min. Aggiungi le proteine in polvere e mescola bene. Completa con banana a rondelle e mandorle tritate.',
        completato: true,
      },
      {
        tipo: 'pranzo',
        nome: 'Petto di pollo con riso basmati e insalata verde',
        alimenti: ['Petto di pollo 180g', 'Riso basmati cotto 200g', 'Insalata mista 100g', 'Olio EVO 10g', 'Limone', 'Curcuma'],
        kcal: 580, macro: { p: 58, c: 68, g: 12 },
        ricetta: 'Griglia il pollo con curcuma e limone per 15min. Cuoci il riso basmati. Condisci l\'insalata con olio e limone. Abbina tutto nel piatto.',
        completato: false,
      },
      {
        tipo: 'spuntino',
        nome: 'Shake proteico pre/post workout con riso soffiato',
        alimenti: ['Proteine del siero 40g', 'Riso soffiato 30g', 'Latte parzialmente scremato 250ml'],
        kcal: 310, macro: { p: 42, c: 28, g: 4 },
        ricetta: 'Frulla le proteine con il latte. Accompagna con il riso soffiato per i carboidrati rapidi post-allenamento.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Salmone al forno con patate dolci e asparagi',
        alimenti: ['Salmone 200g', 'Patate dolci 200g', 'Asparagi 150g', 'Olio EVO 12g', 'Limone', 'Aglio'],
        kcal: 460, macro: { p: 47, c: 57, g: 27 },
        ricetta: 'Cuoci le patate dolci in forno a 200°C per 30min. Cuoci il salmone in padella con aglio e limone per 12min. Griglia gli asparagi con poco olio.',
        completato: false,
      },
    ],
  },

  // ── MARTEDÌ — PULL A (Schiena focus) ──────────────────────────────────
  {
    giorno: 'Martedì',
    sigla: 'Mar',
    data: 30,
    tipo_allenamento: 'pull',
    sessione_label: 'Pull A — Schiena + Bicipiti + Core',
    muscoli: ['Schiena', 'Bicipiti', 'Romboidi', 'Core'],
    durata_min: 60,
    kcal_bonus: 190,
    note_sessione: 'Fase eccentrica 3s sui compound · Face pull per cuffia dei rotatori (prevenzione infortuni) · Core integrato',
    esercizi: [
      { nome: 'Trazioni alla sbarra', serie: 4, reps: '8', recupero_s: 120, rir: 2, muscolo_primario: 'Dorsali/Bicipiti', note: 'Presa prona larga. Porta il petto alla sbarra. Se difficile, usa lat machine assistita.' },
      { nome: 'Rematore con bilanciere', serie: 4, reps: '8', recupero_s: 120, rir: 2, muscolo_primario: 'Dorsali med.', note: 'Schiena a 45°. Porta la barra all\'ombelico, gomiti indietro. Fase eccentrica 3s.' },
      { nome: 'Pulley basso seduto', serie: 3, reps: '10', recupero_s: 90, rir: 2, muscolo_primario: 'Dorsali/Romboidi', note: 'Presa neutra stretta. Porta la maniglia allo sterno. Non dondolare il busto.' },
      { nome: 'Face pull al cavo', serie: 3, reps: '15', recupero_s: 60, rir: 1, muscolo_primario: 'Spalle post./Cuffia', note: 'Cavo all\'altezza degli occhi. Porta verso la fronte, gomiti alti e fuori.' },
      { nome: 'Curl manubri alternati', serie: 4, reps: '10', recupero_s: 60, rir: 1, muscolo_primario: 'Bicipiti', note: 'Supinazione completa al vertice. Non dondolare il busto.' },
      { nome: 'Curl con bilanciere', serie: 3, reps: '12', recupero_s: 60, rir: 1, muscolo_primario: 'Bicipiti', note: 'Presa alla larghezza delle spalle. Fase discesa 3s eccentrica.' },
      { nome: 'Dead bug', serie: 3, reps: '10', recupero_s: 60, rir: 0, muscolo_primario: 'Core', note: 'Lombare incollata al pavimento durante tutto il movimento. Respira in fuori durante l\'estensione.' },
    ],
    kcal_totali: 1820,
    macro: { proteine: 185, carboidrati: 205, grassi: 55 },
    note: 'Giorno Pull A: focus schiena lat e trapezi. Bicipiti come muscolo secondario. Core a fine sessione.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'Pancakes proteici con miele e mirtilli',
        alimenti: ['Farina d\'avena 60g', 'Proteine del siero 25g', '2 uova', 'Latte 100ml', 'Mirtilli 60g', 'Miele 1 cucchiaino'],
        kcal: 470, macro: { p: 40, c: 55, g: 12 },
        ricetta: 'Mescola farina, proteine, uova e latte fino a ottenere un composto omogeneo. Cuoci piccoli pancakes in padella antiaderente. Servi con mirtilli e miele.',
        completato: true,
      },
      {
        tipo: 'pranzo',
        nome: 'Tonno con pasta integrale al pomodoro',
        alimenti: ['Tonno al naturale 160g', 'Pasta integrale 90g', 'Pomodori pelati 200g', 'Capperi', 'Olio EVO 10g', 'Basilico'],
        kcal: 545, macro: { p: 52, c: 62, g: 13 },
        ricetta: 'Cuoci la pasta al dente. Prepara il sugo con pomodori, capperi e olio. Aggiungi il tonno sgocciolato a fine cottura. Condisci con basilico fresco.',
        completato: false,
      },
      {
        tipo: 'spuntino',
        nome: 'Ricotta con crackers integrali e frutta secca',
        alimenti: ['Ricotta magra 150g', 'Crackers integrali 4 pezzi', 'Noci 20g', 'Miele 5g'],
        kcal: 320, macro: { p: 22, c: 28, g: 14 },
        ricetta: 'Spalma la ricotta sui crackers. Aggiungi le noci e un filo di miele.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Bistecca di manzo magra con lenticchie e spinaci',
        alimenti: ['Manzo magro 180g', 'Lenticchie cotte 150g', 'Spinaci freschi 100g', 'Olio EVO 10g', 'Rosmarino'],
        kcal: 485, macro: { p: 71, c: 60, g: 16 },
        ricetta: 'Cuoci la bistecca alla griglia 4min per lato. Scalda le lenticchie con rosmarino. Salta gli spinaci in padella con aglio e olio. Servi tutto insieme.',
        completato: false,
      },
    ],
  },

  // ── MERCOLEDÌ — GAMBE (giorno alto volume) ────────────────────────────
  {
    giorno: 'Mercoledì',
    sigla: 'Mer',
    data: 2,
    tipo_allenamento: 'gambe',
    sessione_label: 'Gambe — Quadricipiti + Femorali + Glutei + Polpacci + Cardio LISS',
    muscoli: ['Quadricipiti', 'Femorali', 'Glutei', 'Polpacci', 'Core'],
    durata_min: 65,
    kcal_bonus: 220,
    note_sessione: '+40g carb pre-allenamento · Cardio LISS 15min finale · Core incluso · Giorno ad alto volume per il gruppo muscolare più grande',
    esercizi: [
      { nome: 'Squat con bilanciere', serie: 4, reps: '8', recupero_s: 90, rir: 2, muscolo_primario: 'Quadricipiti/Glutei', note: 'Schiena dritta, ginocchia in linea con i piedi. Scendi fino a 90° o oltre se mobilità lo permette.' },
      { nome: 'Leg Press', serie: 4, reps: '10', recupero_s: 75, rir: 2, muscolo_primario: 'Quad./Femorali/Glutei', note: 'Piedi a larghezza spalle a metà piattaforma. Non bloccare le ginocchia in estensione.' },
      { nome: 'Romanian Deadlift', serie: 3, reps: '10', recupero_s: 90, rir: 2, muscolo_primario: 'Femorali/Glutei', note: 'Mantieni il bilanciere vicino alle gambe. Senti lo stretch nei femorali prima di risalire.' },
      { nome: 'Affondi alternati con manubri', serie: 3, reps: '12', recupero_s: 60, rir: 1, muscolo_primario: 'Quad./Femorali', note: 'Passo lungo, busto eretto. Ginocchio anteriore non oltre la punta del piede.' },
      { nome: 'Leg Curl sdraiato', serie: 3, reps: '12', recupero_s: 60, rir: 1, muscolo_primario: 'Femorali', note: 'Contrazione completa in cima. Discesa controllata in 3 secondi.' },
      { nome: 'Calf Raise in piedi', serie: 4, reps: '15', recupero_s: 45, rir: 0, muscolo_primario: 'Polpacci', note: 'Piena escursione di movimento. Pausa 1s in cima, discesa lenta.' },
      { nome: 'Dead bug', serie: 3, reps: '10', recupero_s: 60, rir: 0, muscolo_primario: 'Core', note: 'Lombare incollata al pavimento. Estendi braccio e gamba opposti simultaneamente.' },
      { nome: 'Cardio LISS — Tapis roulant', serie: 1, reps: '15min', recupero_s: 0, muscolo_primario: 'Cardiovascolare', note: 'Andatura moderata 6-7 km/h. FC target 120-140 bpm. Recupero attivo post-pesi.' },
    ],
    kcal_totali: 1920,
    macro: { proteine: 180, carboidrati: 235, grassi: 60 },
    note: 'Giorno gambe: carboidrati più alti per il gruppo muscolare più grande del corpo. +40g carb pre-allenamento. Cardio LISS 15min a fine sessione.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'Colazione proteica semplice',
        alimenti: ['Fiocchi d\'avena 80g', 'Banana grande', 'Burro di arachidi 20g', 'Latte parzialmente scremato 300ml', 'Proteine del siero 20g'],
        kcal: 540, macro: { p: 38, c: 72, g: 14 },
        ricetta: 'Prepara l\'avena con il latte e aggiungi le proteine. Taglia la banana a rondelle. Completa con il burro di arachidi per i grassi sani.',
        completato: true,
      },
      {
        tipo: 'pranzo',
        nome: 'Pollo e riso',
        alimenti: ['Petto di pollo 200g', 'Riso bianco cotto 250g', 'Zucchine 150g', 'Olio EVO 10g', 'Paprika'],
        kcal: 560, macro: { p: 55, c: 68, g: 13 },
        ricetta: 'Griglia il pollo con paprika. Cuoci il riso. Rosola le zucchine in padella. Abbina nel piatto.',
        completato: false,
      },
      {
        tipo: 'spuntino',
        nome: 'Snack proteico veloce',
        alimenti: ['Proteine del siero 40g', 'Banana piccola', 'Acqua 300ml'],
        kcal: 240, macro: { p: 38, c: 22, g: 2 },
        ricetta: 'Frulla le proteine con l\'acqua. Mangia la banana a parte per i carboidrati rapidi pre o post-allenamento.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Merluzzo con patate dolci al forno',
        alimenti: ['Merluzzo 220g', 'Patate dolci 220g', 'Fagiolini 150g', 'Olio EVO 12g', 'Limone', 'Prezzemolo'],
        kcal: 580, macro: { p: 49, c: 73, g: 31 },
        ricetta: 'Cuoci le patate dolci in forno a 200°C per 30min. Cuoci il merluzzo in forno con olio, limone e prezzemolo per 20min. Servi con fagiolini al vapore.',
        completato: false,
      },
    ],
  },

  // ── GIOVEDÌ — PUSH B (Spalle focus) ───────────────────────────────────
  {
    giorno: 'Giovedì',
    sigla: 'Gio',
    data: 3,
    tipo_allenamento: 'push',
    sessione_label: 'Push B — Spalle + Petto (sup.) + Tricipiti + Core',
    muscoli: ['Spalle', 'Petto superiore', 'Tricipiti', 'Core'],
    durata_min: 60,
    kcal_bonus: 200,
    note_sessione: 'OHP come esercizio principale · Priorità spalle questa sessione · Tricipiti con alto volume',
    esercizi: [
      { nome: 'Spinte militari con bilanciere (OHP)', serie: 4, reps: '6', recupero_s: 180, rir: 2, muscolo_primario: 'Spalle', note: 'Priorità questa sessione. Barra frontale, mai dietro la nuca. Core rigido.' },
      { nome: 'Panca inclinata con bilanciere (45°)', serie: 3, reps: '8', recupero_s: 120, rir: 2, muscolo_primario: 'Petto sup./Spalle', note: 'Inclinazione 45°. Porta la barra verso le clavicole, non al mento.' },
      { nome: 'Alzate laterali ai cavi', serie: 4, reps: '15', recupero_s: 60, rir: 1, muscolo_primario: 'Deltoide med.', note: 'Usa il cavo per tensione costante su tutto il ROM. Porta il gomito ad altezza spalla.' },
      { nome: 'Face pull al cavo', serie: 3, reps: '15', recupero_s: 60, rir: 1, muscolo_primario: 'Spalle post.', note: 'Rotazione esterna dell\'omero. Gomiti alti, porta verso la fronte. Prevenzione spalle.' },
      { nome: 'Dip alle parallele', serie: 3, reps: '10', recupero_s: 90, rir: 2, muscolo_primario: 'Tricipiti/Petto', note: 'Busto verticale per enfatizzare i tricipiti. Scendi fino a 90° al gomito.' },
      { nome: 'Skull crushers (EZ-bar)', serie: 3, reps: '12', recupero_s: 90, rir: 2, muscolo_primario: 'Tricipiti', note: 'Abbassa lentamente verso la fronte. Gomiti fissi, non aprirli verso l\'esterno.' },
      { nome: 'Ab wheel roll-out', serie: 3, reps: '10', recupero_s: 60, rir: 1, muscolo_primario: 'Core', note: 'Schiena piatta, non iperestendere i lombari. Inizia da inginocchiato se difficile.' },
    ],
    kcal_totali: 1810,
    macro: { proteine: 185, carboidrati: 200, grassi: 56 },
    note: 'Push B: focus spalle e petto superiore. Variazione rispetto a lunedì per stimolare fibre diverse. Core incluso.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'French toast proteico con fragole',
        alimenti: ['Pane integrale 3 fette', '3 uova', 'Latte 100ml', 'Fragole 100g', 'Vaniglia', 'Cannella'],
        kcal: 450, macro: { p: 32, c: 52, g: 13 },
        ricetta: 'Sbatti le uova con latte, vaniglia e cannella. Immergi il pane e cuoci in padella antiaderente. Servi con fragole fresche.',
        completato: false,
      },
      {
        tipo: 'pranzo',
        nome: 'Pollo thai e riso',
        alimenti: ['Petto di pollo 180g', 'Riso basmati 200g', 'Latte di cocco 50ml', 'Peperoni 100g', 'Zenzero', 'Salsa di soia 10ml'],
        kcal: 560, macro: { p: 52, c: 65, g: 14 },
        ricetta: 'Cuoci il pollo a cubetti in padella con latte di cocco, peperoni, zenzero e soia. Servi con riso basmati.',
        completato: false,
      },
      {
        tipo: 'spuntino',
        nome: 'Crackers e hummus con uovo sodo',
        alimenti: ['Crackers integrali 5 pezzi', 'Hummus 60g', '1 uovo sodo', 'Cetriolo'],
        kcal: 225, macro: { p: 14, c: 24, g: 8 },
        ricetta: 'Soda l\'uovo per 10min. Spalma l\'hummus sui crackers e servi con cetriolo a rondelle.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Petto di tacchino con farro e verdure grigliate',
        alimenti: ['Tacchino 200g', 'Farro cotto 180g', 'Melanzane 120g', 'Zucchine 100g', 'Olio EVO 12g'],
        kcal: 575, macro: { p: 87, c: 59, g: 21 },
        ricetta: 'Griglia il tacchino con erbe aromatiche. Cuoci il farro in brodo. Griglia le verdure con poco olio. Componi il piatto.',
        completato: false,
      },
    ],
  },

  // ── VENERDÌ — PULL B + HIIT ───────────────────────────────────────────
  {
    giorno: 'Venerdì',
    sigla: 'Ven',
    data: 4,
    tipo_allenamento: 'pull',
    sessione_label: 'Pull B + Cardio — Schiena + Bicipiti + HIIT 20min + Core',
    muscoli: ['Schiena', 'Bicipiti', 'Femorali posteriori', 'Core'],
    durata_min: 65,
    kcal_bonus: 230,
    note_sessione: 'Stacco da terra come principale (fase di forza) · HIIT 20min finale · Bicipiti extra volume (2° stimolo settimanale)',
    esercizi: [
      { nome: 'Stacco da terra', serie: 4, reps: '5', recupero_s: 180, rir: 3, muscolo_primario: 'Catena poster./Dorsali', note: 'Fase di forza: carichi alti, RIR 3. Setup perfetto ogni rep. Schiena neutra, core braced.' },
      { nome: 'Lat machine presa larga', serie: 4, reps: '10', recupero_s: 90, rir: 2, muscolo_primario: 'Dorsali', note: 'Presa prona larga. Porta la barra sotto il mento. Inizia il movimento aprendo il petto.' },
      { nome: 'Rematore con manubrio', serie: 3, reps: '10', recupero_s: 90, rir: 2, muscolo_primario: 'Dorsali/Romboidi', note: 'Un braccio alla volta. Porta il gomito verso il soffitto, non verso il lato.' },
      { nome: 'Curl bilanciere', serie: 4, reps: '10', recupero_s: 60, rir: 1, muscolo_primario: 'Bicipiti', note: 'Presa alla larghezza delle spalle. Volume bicipiti aggiuntivo — 2° stimolo della settimana.' },
      { nome: 'Hammer curl con manubri', serie: 3, reps: '12', recupero_s: 60, rir: 1, muscolo_primario: 'Brachioradiale/Bicipiti', note: 'Presa neutra. Allena il brachioradiale che i curl normali non colpiscono adeguatamente.' },
      { nome: 'Face pull al cavo', serie: 3, reps: '15', recupero_s: 60, rir: 1, muscolo_primario: 'Spalle post./Cuffia', note: 'Salute della cuffia dei rotatori — non saltare mai. Gomiti alti, rotazione esterna.' },
      { nome: 'HIIT — Tapis roulant/Bike', serie: 1, reps: '20min', recupero_s: 0, muscolo_primario: 'Cardio HIIT', note: '10×(30s sprint + 30s recupero attivo). FC 85-95% durante gli sprint. Brucia 200+ kcal extra.' },
    ],
    kcal_totali: 1870,
    macro: { proteine: 185, carboidrati: 218, grassi: 56 },
    note: 'Pull B: variazione schiena con focus trapezi medi e bicipiti. HIIT 20min a fine sessione (+bonus kcal). Core finale.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'Yogurt proteico con granola e kiwi',
        alimenti: ['Yogurt greco 200g', 'Granola 40g', 'Kiwi 2 pezzi', 'Proteine del siero 15g', 'Miele 5g'],
        kcal: 430, macro: { p: 38, c: 52, g: 9 },
        ricetta: 'Mescola lo yogurt con le proteine in polvere. Aggiungi la granola, il kiwi tagliato e il miele.',
        completato: false,
      },
      {
        tipo: 'pranzo',
        nome: 'Sgombro con pasta integrale e pomodorini',
        alimenti: ['Sgombro al naturale 160g', 'Pasta integrale 90g', 'Pomodorini 150g', 'Olive nere 20g', 'Olio EVO 8g', 'Basilico'],
        kcal: 530, macro: { p: 50, c: 58, g: 14 },
        ricetta: 'Cuoci la pasta al dente. Salta i pomodorini in padella con olio. Aggiungi lo sgombro sgocciolato e le olive. Condisci con basilico.',
        completato: false,
      },
      {
        tipo: 'spuntino',
        nome: 'Shake proteico con banana e burro di mandorle',
        alimenti: ['Proteine del siero 40g', 'Banana 1', 'Burro di mandorle 15g', 'Latte 250ml'],
        kcal: 390, macro: { p: 45, c: 38, g: 12 },
        ricetta: 'Frulla tutti gli ingredienti fino a consistenza cremosa. Ottimo pre o post HIIT.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Uova al forno con legumi e insalata',
        alimenti: ['4 uova', 'Ceci cotti 150g', 'Spinaci 120g', 'Pomodori 100g', 'Olio EVO 10g', 'Cumino'],
        kcal: 520, macro: { p: 52, c: 70, g: 21 },
        ricetta: 'Riscalda i ceci in padella con cumino e pomodori. Aggiungi gli spinaci e apri le uova direttamente in padella. Copri e cuoci 5min fino a solidificazione dell\'albume.',
        completato: false,
      },
    ],
  },

  // ── SABATO — RIPOSO / STRETCHING ──────────────────────────────────────
  {
    giorno: 'Sabato',
    sigla: 'Sab',
    data: 5,
    tipo_allenamento: 'riposo',
    sessione_label: 'Riposo completo — Recupero & Nutrizione',
    muscoli: [],
    durata_min: 0,
    kcal_bonus: 0,
    note_sessione: 'Riposo completo. Priorità: sonno 8h+, idratazione 3L, proteine invariate per mantenere la sintesi proteica muscolare.',
    kcal_totali: 1630,
    macro: { proteine: 170, carboidrati: 152, grassi: 60 },
    note: 'Riposo completo: calorie moderate, proteine invariate per sintesi proteica muscolare. Grassi sani per recupero ormonale.',
    pasti: [
      {
        tipo: 'colazione',
        nome: 'Frittata di albumi con verdure e pane di segale',
        alimenti: ['6 albumi', '1 uovo intero', 'Peperoni 80g', 'Spinaci 60g', 'Pane di segale 2 fette', 'Olio EVO 8g'],
        kcal: 380, macro: { p: 38, c: 34, g: 12 },
        ricetta: 'Sbatti gli albumi con l\'uovo intero. Cuoci le verdure in padella, aggiungi il composto di uova e cuoci come frittata. Servi con il pane di segale tostato.',
        completato: false,
      },
      {
        tipo: 'pranzo',
        nome: 'Bowl di riso integrale con pollo e avocado',
        alimenti: ['Petto di pollo 160g', 'Riso integrale cotto 200g', 'Avocado mezzo', 'Mais 50g', 'Lime', 'Coriandolo'],
        kcal: 520, macro: { p: 52, c: 58, g: 18 },
        ricetta: 'Cuoci il riso integrale. Griglia il pollo e affettalo. Componi la bowl con riso, pollo, avocado a fette e mais. Condisci con lime e coriandolo.',
        completato: false,
      },
      {
        tipo: 'spuntino',
        nome: 'Noci e frutta secca con cioccolato fondente',
        alimenti: ['Noci 25g', 'Anacardi 15g', 'Cioccolato fondente 85% 20g'],
        kcal: 210, macro: { p: 6, c: 12, g: 16 },
        ricetta: 'Mescola noci, anacardi e cioccolato fondente spezzettato.',
        completato: false,
      },
      {
        tipo: 'cena',
        nome: 'Zuppa di lenticchie rosse con pane di segale',
        alimenti: ['Lenticchie rosse 180g', 'Pomodori pelati 200g', 'Carote 100g', 'Sedano 80g', 'Pane di segale 2 fette', 'Olio EVO 10g', 'Curcuma', 'Zenzero'],
        kcal: 520, macro: { p: 74, c: 48, g: 14 },
        ricetta: 'Soffriggi sedano e carote con olio. Aggiungi lenticchie, pomodori, curcuma e zenzero. Cuoci 20min con acqua. Servi con pane di segale.',
        completato: false,
      },
    ],
  },
]

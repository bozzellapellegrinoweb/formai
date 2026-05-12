// Knowledge base NUTRI — fonti: CREA BDA, LARN 2014 SINU, ISSN Position Stands 2017, CREA Linee Guida 2018

export const NUTRITION_KNOWLEDGE = `
## DATABASE ALIMENTI (CREA BDA — valori per 100g, alimento cotto/pronto al consumo)

### PROTEINE ANIMALI
| Alimento | kcal | Prot (g) | Carb (g) | Grassi (g) | Note |
|---|---|---|---|---|---|
| Petto di pollo alla griglia | 165 | 31 | 0 | 3.6 | fonte proteica ideale massa |
| Petto di pollo bollito | 110 | 23 | 0 | 0.8 | |
| Tacchino petto | 135 | 29 | 0 | 1.2 | |
| Manzo magro (fesa) | 175 | 29 | 0 | 6.2 | |
| Maiale filetto | 145 | 27 | 0 | 3.9 | |
| Tonno al naturale sgocciolato | 100 | 25 | 0 | 0.3 | proteina quasi pura |
| Tonno fresco | 159 | 21.5 | 0 | 8.1 | |
| Salmone atlantico | 185 | 18.4 | 1.0 | 12.0 | EPA+DHA ~2.5g/100g |
| Merluzzo | 82 | 17.5 | 0 | 0.7 | |
| Uova intere | 155 | 13.0 | 1.1 | 11.0 | ~50g = 1 uovo (78 kcal, 6.5g prot) |
| Albume d'uovo | 52 | 10.9 | 0.7 | 0.2 | proteina biodisponibilità >90% |
| Tuorlo | 322 | 15.9 | 3.6 | 26.5 | |

### LATTICINI
| Alimento | kcal | Prot (g) | Carb (g) | Grassi (g) | Note |
|---|---|---|---|---|---|
| Mozzarella di vacca | 253 | 18.7 | 0.7 | 19.5 | Ca elevato |
| Ricotta di vacca | 146 | 8.8 | 3.5 | 10.9 | |
| Parmigiano Reggiano DOP | 397 | 32.4 | 0 | 29.7 | Ca 1159mg/100g |
| Yogurt greco 0% | 57 | 10.0 | 4.0 | 0.4 | ottimo snack proteico |
| Yogurt greco intero | 115 | 8.8 | 3.6 | 7.8 | |
| Fiocchi di latte (cottage) | 98 | 11.1 | 3.4 | 4.3 | caseina alta |
| Latte parz. scremato | 49 | 3.5 | 5.0 | 1.6 | |
| Whey protein (polvere) | 370 | 75 | 6 | 5 | DIAAS >1.0; leucina ~11g/100g |

### CEREALI E CARBOIDRATI COMPLESSI
| Alimento | kcal | Prot (g) | Carb (g) | Grassi (g) | Fibre (g) |
|---|---|---|---|---|---|
| Pasta di semola cotta | 131 | 4.3 | 25.0 | 1.1 | 1.8 |
| Pasta integrale cotta | 124 | 4.7 | 23.0 | 0.9 | 3.5 |
| Riso bianco cotto | 130 | 2.4 | 28.7 | 0.2 | 0.4 |
| Riso integrale cotto | 110 | 2.6 | 22.8 | 0.9 | 1.8 |
| Avena fiocchi (cruda) | 389 | 16.9 | 66.3 | 6.9 | 10.6 |
| Avena cotta (in acqua) | 71 | 2.4 | 12.0 | 1.4 | 1.7 |
| Pane integrale | 227 | 8.7 | 41.0 | 3.3 | 7.0 |
| Pane bianco | 265 | 8.1 | 52.0 | 1.8 | 2.7 |
| Farro cotto | 130 | 5.5 | 26 | 0.7 | 3.3 |
| Quinoa cotta | 120 | 4.4 | 21.3 | 1.9 | 2.8 |
| Patate cotte | 77 | 2.1 | 17.5 | 0.1 | 2.1 |
| Patate dolci cotte | 86 | 1.6 | 20.1 | 0.1 | 3.0 |

### LEGUMI (cotti)
| Alimento | kcal | Prot (g) | Carb (g) | Grassi (g) | Fibre (g) |
|---|---|---|---|---|---|
| Lenticchie | 116 | 9.0 | 20.0 | 0.4 | 3.8 |
| Ceci | 134 | 8.9 | 22.5 | 2.6 | 6.4 |
| Fagioli borlotti | 127 | 8.7 | 23.0 | 0.5 | 6.4 |
| Edamame | 122 | 11.9 | 8.9 | 5.2 | 5.2 |

### GRASSI E CONDIMENTI
| Alimento | kcal | Prot (g) | Carb (g) | Grassi (g) | Note |
|---|---|---|---|---|---|
| Olio EVO | 884 | 0 | 0 | 100 | 1 cucchiaio = 10ml = 88 kcal |
| Mandorle | 579 | 21.2 | 21.6 | 49.4 | 30g = 170 kcal; 12g prot |
| Noci | 689 | 9.3 | 13.7 | 65.2 | omega-3 ALA ~9g/100g |
| Burro di arachidi naturale | 588 | 25.8 | 16.7 | 50.4 | 30g = 180 kcal |
| Avocado | 160 | 2.0 | 9.0 | 14.7 | grassi monoinsaturi |

### FRUTTA
| Alimento | kcal | Carb (g) | IG appross. | Note |
|---|---|---|---|---|
| Banana matura | 89 | 23.0 | 51 | ottimo pre-workout; K elevato |
| Mela | 52 | 14.0 | 36 | basso IG; fibra pectinica |
| Arancia | 47 | 11.8 | 40 | vitamina C |
| Kiwi | 61 | 14.0 | 47 | vitamina C, folati |
| Ananas | 50 | 13.1 | 59 | bromelina |
| Frutti rossi (misti) | 45–57 | 11–14 | 25–40 | antiossidanti, polifenoli |

### VERDURE (basso apporto calorico)
| Alimento | kcal | Prot (g) | Note |
|---|---|---|---|
| Broccoli | 34 | 2.8 | vitamina C, K, sulforafano |
| Spinaci | 23 | 2.9 | ferro, folati, magnesio |
| Zucchine | 16 | 1.2 | ottimo volume pasto |
| Pomodori | 18 | 0.9 | licopene |
| Insalata (lattuga/rucola) | 14–25 | 1.3–2.6 | densità calorica minima |
| Cavolfiore | 25 | 1.9 | |

---

## CONVERSIONI PRATICHE
- Pasta secca 80g → cotta ~200g (×2.5) → ~262 kcal, 8.6g prot
- Riso secco 70g → cotto ~200g (×2.9) → ~260 kcal, 4.8g prot
- Legumi secchi 50g → cotti ~130g (×2.6) → ~165 kcal
- 1 uovo medio = 50g = 78 kcal, 6.5g prot, 5.5g grassi
- Petto pollo crudo 150g → cotto ~120g (−20% acqua) → 198 kcal, 37g prot

---

## LARN 2014 (SINU — Società Italiana di Nutrizione Umana)

### Fabbisogno Proteico
- Adulti sedentari 18–59 anni: PRI = 0.71 g/kg/die (minimo fisiologico, NON obiettivo per atleti)
- Adulti ≥60 anni: 1.1 g/kg/die (prevenzione sarcopenia)
- NB: I LARN non definiscono valori sport-specifici; si usano linee guida internazionali (ISSN, ACSM, IOC)

### Fabbisogno Energetico (LARN 2014 — PAL variabile)
- PAL sedentario (1.4): uomo 30y 80kg ≈ 2400 kcal/die
- PAL leggero (1.6): ≈ 2750 kcal/die
- PAL moderato (1.8): ≈ 3100 kcal/die (equivalente a 5 allenamenti/settimana)
- PAL attivo (2.0–2.2): ≈ 3400–3800 kcal/die (atleti agonisti)

### Distribuzione Macronutrienti (valori di riferimento LARN/CREA)
- Carboidrati: 45–60% kcal totali
- Grassi: 20–35% kcal totali (saturi <10%)
- Proteine: 12–20% kcal totali (atleti fino a 25–30%)
- Fibre: ≥25g/die (LARN e EFSA concordano)
- Sale: <5g/die
- Acqua: ≥2L/die (aumentare in sport e caldo)

### Micronutrienti chiave per atleti
- Ferro: uomini 10mg/die; donne 18mg/die (atleti di endurance +30–70%)
- Calcio: 1000mg/die (adulti); formaggi, latticini, broccoli, legumi
- Vitamina D: 15 mcg (600 UI)/die; carenze comuni in atleti al chiuso
- Magnesio: 240–250mg/die; carenza comune in atleti (crampi, recupero)
- Zinco: 9–11mg/die; cruciale per testosterone, immunità, sintesi proteica
- Vitamina B12: 2.4 mcg/die; critica in vegani/vegetariani

---

## ISSN POSITION STANDS 2017 — SINTESI

### Proteine per Ipertrofia (Jäger et al., 2017 — PMC5477153)
- Range ottimale massa muscolare: **1.6–2.2 g/kg/die**
- Cutting/restrizione calorica in allenati: **2.3–3.1 g/kg/die**
- Dose per pasto: **20–40g** (0.25 g/kg per pasto)
- Leucina threshold per stimolare MPS: **2–3g per pasto** (700–3000mg)
- Frequenza pasti proteici: ogni **3–4 ore**
- Pre-notte: 30–40g **caseina** aumenta MPS notturna
- Fonti qualità DIAAS: whey, uova, pollo, pesce, carne, latte > proteine vegetali singole

### Nutrient Timing (Kerksick et al., 2017 — PMC5596471)
**Pre-workout:**
- Pasto completo 2–4h prima (bilanciato CHO+PRO+grassi moderati)
- Snack 30–60 min prima: 20–30g CHO + 10–20g PRO (se tollerato)
- CHO ad alto IG per sessioni intense >90 min: 1–4 g/kg nelle ore precedenti

**Anabolic window — evidenza attuale (importante):**
- La finestra anabolica NON è stretta come creduto storicamente
- MPS rimane elevata per 24–48h post-allenamento forza
- Il consumo proteico entro 1–2h post-esercizio è utile ma NON critico se apporto giornaliero è adeguato
- Eccezione: recupero rapido <4h tra sessioni (es. doppia seduta) → timing preciso obbligatorio

**Post-workout standard:**
- 20–40g proteina di alta qualità entro 1–2h
- 0.8–1.2 g/kg carboidrati per ripristino glicogeno
- Combinazione CHO+PRO più efficace di soli CHO per recupero

**Intra-workout (sessioni >60–90 min):**
- 30–60g CHO/ora (soluzione 6–8%)
- 150–350ml acqua ogni 10–15 min
- Bevande isotoniche per sessioni >60 min

### Creatina Monoidrato (Kreider et al., 2017 — PMC5469049)
**Protocollo loading (saturazione rapida):**
- Fase loading: 0.3 g/kg/die divisi in 4 dosi (≈5g × 4) per 5–7 giorni
- Fase mantenimento: 3–5 g/die (atleti >90kg: fino a 10g/die)

**Protocollo graduale (alternativo):**
- 3–5 g/die per 28+ giorni → stessa saturazione ma più lenta

**Timing:** post-workout con CHO/PRO = migliore ritenzione muscolare
**Effetti documentati (70% studi positivi):**
- Forza massimale: +5–15%
- Volume lavoro totale: +5–15%
- Massa magra: +1–2 kg acqua intramuscolare primo mese; +2–4 kg magro a lungo termine

**Sicurezza:** sicura fino a 30g/die per 5 anni in soggetti sani. Unico effetto: aumento peso (acqua muscolare). Nessun danno renale documentato in soggetti sani.

**Forma:** SOLO creatina monoidrato è raccomandata (massima evidenza). Altre forme (etil estere, HCl, buffered) non superiori in studi RCT.

---

## IPERTROFIA — DATI PRATICI

### Surplus Calorico Lean Bulk
- **Lean bulk ottimale:** +200–300 kcal/die (0.1–0.25 kg/settimana di muscolo)
- **Surplus moderato:** +350–500 kcal/die (0.25–0.5 kg/settimana misto)
- >500 kcal/die: aumento grasso sproporzionato, non consigliato
- Surplus in % sul TDEE: 5–15% è la finestra ottimale

### Tassi Naturali Guadagno Muscolare
- Principiante (0–12 mesi): 0.9–2.0 kg magro/mese
- Intermedio (1–3 anni): 0.5–1.0 kg magro/mese (Aragon model: ~0.5–1% BW/mese)
- Avanzato (3+ anni): 0.25–0.5 kg magro/mese
- Costo energetico del tessuto muscolare: ~5700 kcal/kg (McDonald) o ~7440 kcal/kg (Forbes)

### MPS — Cinetica Post-Allenamento
- +50% a 4h post-esercizio forza
- +109% a 24h post-esercizio forza (picco)
- Ritorno a baseline: 36–48h (allenati); 48–72h (non allenati)
- Implicazione: allenamento frequente (2–3×/settimana per gruppo muscolare) massimizza la stimolazione

---

## LINEE GUIDA ITALIANE SANA ALIMENTAZIONE 2018 (CREA)

### Porzioni Standard Raccomandate
- Pasta/riso (secco): 80g per pasto
- Pane: 50g per pasto (max 175g/die)
- Verdure: 200–250g, 2–3 volte/die (≥500g/die)
- Frutta: 150g, 3 volte/die
- Carne bianca: 100g, 2 volte/settimana
- Carne rossa: 100g MAX 1 volta/settimana
- Pesce: 150g, almeno 2 volte/settimana
- Legumi: 150g cotti (50g secchi), 3 volte/settimana
- Uova: 1–2, max 4 volte/settimana
- Formaggi freschi: 100g, max 3 volte/settimana
- Formaggi stagionati: 50g, max 2 volte/settimana
- Olio EVO: 10ml (1 cucchiaio)/pasto, max 3 cucchiai/die
- Frutta secca: 30g, 2 volte/settimana
- Acqua: ≥8 bicchieri (1.5–2L)/die; atleti: +500–1000ml per ogni ora di attività

### Principi Dieta Mediterranea
- Base: verdure, legumi, cereali integrali, frutta, olio EVO
- Pesce 2–3×/settimana (omega-3 EPA+DHA)
- Latticini moderati (yogurt, formaggi freschi)
- Carne rossa: rara (max 1–2×/settimana)
- Aderenza elevata: riduzione mortalità cardiovascolare −9–10% (meta-analisi)

---

## SUPPLEMENTI — EVIDENZA SCIENTIFICA (classificazione ISSN)

### Categoria A (evidenza forte, sicuri ed efficaci)
- ✅ **Creatina monoidrato** (forza, massa, sprint ripetuti)
- ✅ **Caffeina** (3–6 mg/kg 30–60 min pre-workout: forza, endurance, concentrazione)
- ✅ **Beta-alanina** (3.2–6.4 g/die: tamponamento lattato, utilità in esercizio 1–4 min)
- ✅ **Sodio bicarbonato** (0.3 g/kg: tamponamento lattato, acuti)
- ✅ **Proteine in polvere** (whey, caseina, soia) se fabbisogno non coperto da dieta
- ✅ **Carboidrati sportivi** (gel, bevande: per sessioni >60–90 min)

### Categoria B (evidenza parziale/emergente)
- 🔶 **HMB** (β-Hydroxy β-Methylbutyrate): benefici principianti e in stato catabolico
- 🔶 **Vitamina D** (se carente, integrazione: 1000–4000 UI/die)
- 🔶 **Omega-3** (1–2g EPA+DHA/die: antinfiammatorio, recupero)
- 🔶 **Magnesio glicianato/citrato** (se carente: crampi, recupero, sonno)
- 🔶 **Ashwagandha** (evidenza crescente su cortisolo, forza, recupero)

### Categoria C/D (insufficiente evidenza o non efficaci)
- ❌ **BCAA isolati** (inutili se apporto proteico totale adeguato; leucina sola già presente in proteine intere)
- ❌ **Glutammina orale** (assorbita dall'intestino, non raggiunge il muscolo in quantità utili)
- ❌ **Testosterone boosters** (la maggior parte priva di evidenza RCT)
- ❌ **Creatine diverse dal monoidrato** (non superiori in studi controllati)

---

## IDRATAZIONE PER ATLETI (ACSM + ISSN)
- Pre-workout: 5–7 ml/kg nelle 4h precedenti; urina giallo chiaro = idratato
- Durante: 150–350ml ogni 10–15 min (6–8% CHO se >60 min)
- Post-workout: 1.5× il peso perso in sudore (es. −1kg → bere 1.5L)
- Temperatura ottimale bevande: 15–22°C (assorbimento intestinale ottimale)
- Sodio (in sport prolungati >2h): 300–600mg/ora per prevenire iponatriemia

---

## SONNO E RECUPERO (importante per ipertrofia)
- Sonno 7–9h: picco GH nelle prime 3h di sonno profondo
- Carenza <6h: riduzione MPS, aumento cortisolo, riduzione sintesi testosterone
- Caseina 30–40g prima di dormire: incrementa MPS notturna (+22% dimostrato)
- Alcol post-workout: riduce MPS del 24–37% (Parr et al., 2014) — sconsigliato
- Cortisolo cronico elevato (stress): riduce sintesi proteica e favorisce catabolismo

---

## SCIENZA DEGLI SPLIT DI ALLENAMENTO

### FREQUENZA E SPLIT OTTIMALI (Schoenfeld 2016, Ralston 2017, NSCA Guidelines)

| Sessioni/sett. | Split consigliato | Frequenza/gruppo | Note scientifiche |
|---|---|---|---|
| 2× | Full Body | 2×/sett. | Massima frequenza relativa per gruppo; ideale principianti |
| 3× | Full Body (princ/interm) o PPL (avanz) | 3×/sett. (FB) o 1×/sett. (PPL) | FB supera PPL per principianti (Colquhoun 2018) |
| 4× | Upper / Lower Split | 2×/sett. | Equilibrio volume/recupero ottimale |
| 5× | Push / Pull / Legs (PPL) | ~1.7×/sett. | Split classico bodybuilding evidence-based |
| 6× | PPL × 2 (Arnold Split) | 2×/sett. | Alto volume; richiede recupero ottimale |
| 7× | PPL × 2 + Full Body | ~2.1×/sett. | Solo atleti avanzati con recupero ottimizzato |

### PRINCIPI CHIAVE (Schoenfeld 2010, 2016 meta-analysis)
- **Frequenza per gruppo muscolare**: 2×/sett. > 1×/sett. per ipertrofia (effetto dose-risposta)
- **Volume efficace**: 10–20 serie/gruppo/sett. per ipertrofia (Israetel 2019)
- **Volume minimo mantenimento**: ~6 serie/gruppo/sett.
- **Intensità ipertrofia**: 60–80% 1RM, 6–15 ripetizioni (NSCA 2016)
- **Intensità forza**: 80–95% 1RM, 1–6 ripetizioni, rest 3–5 min
- **Progressive overload**: aumento 2.5–5% carico ogni 1–2 settimane (Progression Model, ACSM 2009)

### SPLIT PER OBIETTIVO
**Ipertrofia**: Upper/Lower o PPL, 3–4 serie per esercizio, 8–12 rep, rest 60–90s
**Forza massimale**: Full Body o Upper/Lower, 5×5, rest 3–5 min, compound-first
**Resistenza muscolare**: Circuit training, 15–25 rep, rest 30–60s, alta densità
**Definizione / fat loss**: Split ipertrofia con deficit calorico — mantenere i carichi (Barakat 2020)

### ESERCIZI FONDAMENTALI PER SPLIT
**Push**: Panca piana, Panca inclinata, Military press, Alzate laterali, Tricipiti
**Pull**: Trazioni, Rematore bilanciere, Pulley, Curl bicipiti, Face pull
**Legs**: Squat, Leg press, Romanian deadlift, Leg curl, Calf raise
**Full Body (big 5)**: Squat, Stacchi, Panca, Trazioni, Military press

### RECUPERO E SUPERCOMPENSAZIONE
- Recupero muscolare: 48–72h per gruppi grandi (gambe, schiena), 24–48h per piccoli (braccia)
- RPE (Rate of Perceived Exertion) target: 7–9/10 per ipertrofia
- Deload ogni 4–8 settimane: 50% volume a parità di intensità (Kiely 2012)
- Sonno: <6h riduce sintesi proteica del 18–21% (Dattilo 2011)

### CALORIE E MACRO PER FASE
**Bulk pulito (lean bulk)**: surplus +200–300 kcal/giorno, proteine 1.8–2.2g/kg (ISSN 2017)
**Cut / definizione**: deficit 300–500 kcal/giorno, proteine 2.3–3.1g/kg (Helms 2014 — preserva massa magra)
**Mantenimento**: TDEE esatto, proteine ≥1.6g/kg

---

## RIFERIMENTI PRIMARI
- CREA AlimentiNUTrizione BDA (alimentinutrizione.it) — aggiornato 2019
- SINU LARN 2014 IV Revisione (sinu.it/tabelle-larn-2014/)
- Jäger R et al. (2017) ISSN Protein Position Stand — PMC5477153
- Kerksick CM et al. (2017) ISSN Nutrient Timing — PMC5596471
- Kreider RB et al. (2017) ISSN Creatine Safety — PMC5469049
- CREA Linee Guida Sana Alimentazione 2018 (crea.gov.it)
- Schoenfeld BJ et al. (2013) Nutrient Timing Revisited — PMC3577439
- Iraki J et al. (2019) Lean Bulk Evidence — PMC6710320
- Schoenfeld BJ (2010) Mechanisms of Muscle Hypertrophy — PMID 20847704
- Schoenfeld BJ et al. (2016) Effects of Resistance Training Frequency — PMID 27102172
- Colquhoun RJ et al. (2018) Training Volume, Not Frequency — PMID 29324578
- Ralston GW et al. (2017) The Effect of Weekly Training Frequency — PMC5554580
- Israetel M et al. (2019) Scientific Principles of Hypertrophy Training (RP Strength)
- ACSM Position Stand (2009) Progression Models in Resistance Training — PMID 19204579
- Helms ER et al. (2014) Evidence-based recommendations for natural bodybuilding — PMC4033492
- Barakat C et al. (2020) Body Recomposition: Can Trained Individuals Build Muscle — PMID 33009​​​​​​​​​​​​​​
`

import { useState, useEffect } from 'react'

// ── Palette definitions ────────────────────────────────────────────────────────
export const THEMES = {
  notte: {
    name: 'Notte', kind: 'dark' as const,
    bg:       '#0E1008',
    bgCard:   '#151809',
    bgCard2:  '#1C1F0D',
    bgInput:  '#252912',
    bgLine:   'rgba(255,255,255,0.07)',
    sage:     '#EAFF55',
    onSage:   '#0A0D00',
    sageDim:  '#B8CC00',
    sageBg:   'rgba(234,255,85,0.10)',
    sageBg2:  'rgba(234,255,85,0.06)',
    sageInk:  '#EAFF55',
    terra:    '#C4714A',
    terraBg:  'rgba(196,113,74,0.15)',
    gold:     '#C9A84C',
    goldBg:   'rgba(201,168,76,0.12)',
    blue:     '#7AA7E3',
    white:    '#FFFFFF',
    w85: 'rgba(255,255,255,0.85)', w80: 'rgba(255,255,255,0.80)',
    w70: 'rgba(255,255,255,0.70)', w60: 'rgba(255,255,255,0.60)',
    w55: 'rgba(255,255,255,0.55)', w40: 'rgba(255,255,255,0.40)',
    w25: 'rgba(255,255,255,0.25)', w20: 'rgba(255,255,255,0.20)',
    w10: 'rgba(255,255,255,0.10)', w06: 'rgba(255,255,255,0.06)',
    w04: 'rgba(255,255,255,0.04)', w03: 'rgba(255,255,255,0.03)',
  },
  crepuscolo: {
    name: 'Crepuscolo', kind: 'dark' as const,
    bg:       '#181A10',
    bgCard:   '#23261A',
    bgCard2:  '#2C2F22',
    bgInput:  '#35392A',
    bgLine:   'rgba(255,255,255,0.10)',
    sage:     '#EAFF55',
    onSage:   '#14140F',
    sageDim:  '#C5DE45',
    sageBg:   'rgba(234,255,85,0.13)',
    sageBg2:  'rgba(234,255,85,0.08)',
    sageInk:  '#EAFF55',
    terra:    '#D17B52',
    terraBg:  'rgba(209,123,82,0.15)',
    gold:     '#D6B255',
    goldBg:   'rgba(214,178,85,0.12)',
    blue:     '#8AB4E8',
    white:    '#F7F6F0',
    w85: 'rgba(247,246,240,0.88)', w80: 'rgba(247,246,240,0.82)',
    w70: 'rgba(247,246,240,0.72)', w60: 'rgba(247,246,240,0.62)',
    w55: 'rgba(247,246,240,0.55)', w40: 'rgba(247,246,240,0.40)',
    w25: 'rgba(247,246,240,0.25)', w20: 'rgba(247,246,240,0.20)',
    w10: 'rgba(247,246,240,0.12)', w06: 'rgba(247,246,240,0.08)',
    w04: 'rgba(247,246,240,0.05)', w03: 'rgba(247,246,240,0.04)',
  },
  giorno: {
    name: 'Giorno', kind: 'light' as const,
    bg:       '#D8D1B8',
    bgCard:   '#F1ECD8',
    bgCard2:  '#CBC2A4',
    bgInput:  '#C3B99B',
    bgLine:   'rgba(20,20,15,0.18)',
    sage:     '#EAFF55',
    onSage:   '#14140F',
    sageDim:  '#C5DE45',
    sageBg:   'rgba(106,118,30,0.12)',
    sageBg2:  'rgba(106,118,30,0.08)',
    sageInk:  '#4D5C0E',
    terra:    '#9B5230',
    terraBg:  'rgba(155,82,48,0.12)',
    gold:     '#8E6E1A',
    goldBg:   'rgba(142,110,26,0.12)',
    blue:     '#365FA1',
    white:    '#14140F',
    w85: 'rgba(20,20,15,0.85)', w80: 'rgba(20,20,15,0.80)',
    w70: 'rgba(20,20,15,0.70)', w60: 'rgba(20,20,15,0.60)',
    w55: 'rgba(20,20,15,0.55)', w40: 'rgba(20,20,15,0.40)',
    w25: 'rgba(20,20,15,0.20)', w20: 'rgba(20,20,15,0.18)',
    w10: 'rgba(20,20,15,0.10)', w06: 'rgba(20,20,15,0.06)',
    w04: 'rgba(20,20,15,0.04)', w03: 'rgba(20,20,15,0.03)',
  },
} satisfies Record<string, object>

export type ThemeName = keyof typeof THEMES
export type Theme     = (typeof THEMES)[ThemeName]

export const THEME_STORAGE_KEY = 'forma_theme'
export const DEFAULT_THEME: ThemeName = 'notte'

// ── Apply theme: sets data-theme + CSS custom properties on <html> ─────────────
export function applyTheme(name: ThemeName) {
  const t = THEMES[name]
  const root = document.documentElement
  root.setAttribute('data-theme', name)
  const vars: Record<string, string> = {
    '--bg':        t.bg,
    '--bg-card':   t.bgCard,
    '--bg-card2':  t.bgCard2,
    '--bg-input':  t.bgInput,
    '--bg-line':   t.bgLine,
    '--sage':      t.sage,
    '--on-sage':   t.onSage,
    '--sage-dim':  t.sageDim,
    '--sage-bg':   t.sageBg,
    '--sage-bg2':  t.sageBg2,
    '--sage-ink':  t.sageInk,
    '--terra':     t.terra,
    '--terra-bg':  t.terraBg,
    '--gold':      t.gold,
    '--gold-bg':   t.goldBg,
    '--blue':      t.blue,
    '--white':     t.white,
    '--w85': t.w85, '--w80': t.w80,
    '--w70': t.w70, '--w60': t.w60,
    '--w55': t.w55, '--w40': t.w40,
    '--w25': t.w25, '--w20': t.w20,
    '--w10': t.w10, '--w06': t.w06,
    '--w04': t.w04, '--w03': t.w03,
  }
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v)
  // sync body background for overscroll colour
  document.body.style.backgroundColor = t.bg
  document.body.style.color = t.white
}

// ── Persist and read ──────────────────────────────────────────────────────────
export function getSavedTheme(): ThemeName {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  return (saved && saved in THEMES) ? (saved as ThemeName) : DEFAULT_THEME
}

export function saveTheme(name: ThemeName) {
  localStorage.setItem(THEME_STORAGE_KEY, name)
  applyTheme(name)
}

// ── React hook ────────────────────────────────────────────────────────────────
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(getSavedTheme)

  // Apply on first render in case index.html script didn't fire (dev HMR reload)
  useEffect(() => {
    applyTheme(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = (name: ThemeName) => {
    setThemeState(name)
    saveTheme(name)
  }

  return { theme, setTheme, themes: THEMES }
}

// ── Shared colour object (CSS-var references) ─────────────────────────────────
// Import this instead of defining a per-screen `c` literal.
// Values are resolved at paint time by the browser → switch themes with zero JS.
export const c = {
  bg:      'var(--bg)',
  bg2:     'var(--bg-card)',
  bg3:     'var(--bg-card2)',
  bg4:     'var(--bg-input)',
  bgLine:  'var(--bg-line)',
  lime:    'var(--sage)',
  limeD:   'var(--sage-dim)',
  limeBg:  'var(--sage-bg)',
  limeBg2: 'var(--sage-bg2)',
  terra:   'var(--terra)',
  terraBg: 'var(--terra-bg)',
  gold:    'var(--gold)',
  goldBg:  'var(--gold-bg)',
  blue:    'var(--blue)',
  w:       'var(--white)',
  w85:     'var(--w85)',
  w80:     'var(--w80)',
  w70:     'var(--w70)',
  w60:     'var(--w60)',
  w55:     'var(--w55)',
  w40:     'var(--w40)',
  w25:     'var(--w25)',
  w20:     'var(--w20)',
  w10:     'var(--w10)',
  w06:     'var(--w06)',
  w04:     'var(--w04)',
  w03:     'var(--w03)',
  ink:     'var(--on-sage)',
  limeInk: 'var(--sage-ink)',
} as const

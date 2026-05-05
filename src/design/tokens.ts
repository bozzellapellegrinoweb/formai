export const colors = {
  // Background layers — fedeli al DESIGN_REFERENCE.html
  bg:      '#0E0E0B',
  bgCard:  '#181A12',
  bgCard2: '#1E2118',
  bgInput: '#252820',

  // Primary accent
  sage:      '#EAFF55',
  sageLight: '#d4f530',
  sageDark:  '#7a9900',
  sageBg:    'rgba(234,255,85,0.11)',

  // Semantic accents
  terra: '#C4714A',
  gold:  '#C9A84C',

  // Text — bianco puro come nel reference
  white: '#FFFFFF',
  w80:   'rgba(255,255,255,0.8)',
  w50:   'rgba(255,255,255,0.5)',
  w25:   'rgba(255,255,255,0.25)',
  w10:   'rgba(255,255,255,0.1)',
  w06:   'rgba(255,255,255,0.06)',
} as const

export const radius = {
  card:   '14px',
  cardLg: '20px',
  pill:   '50px',
  input:  '9px',
} as const

export const fonts = {
  display: { family: 'Poppins', weight: 800, size: '28px' },
  heading: { family: 'Poppins', weight: 700, size: '16px' },
  body:    { family: 'Poppins', weight: 400, size: '11px' },
  label:   { family: 'Poppins', weight: 500, size: '9px' },
  data:    { family: 'DM Mono', weight: 500, size: '13px' },
} as const

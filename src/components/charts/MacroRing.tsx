interface MacroRingProps {
  kcal: number
  kcalTotal: number
  size?: number
}

export default function MacroRing({ kcal, kcalTotal, size = 72 }: MacroRingProps) {
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const progress = Math.min(kcal / kcalTotal, 1)
  const offset = circ * (1 - progress)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="#EAFF55"
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: size > 60 ? 15 : 12,
          fontWeight: 500,
          color: '#FFFFFF',
          lineHeight: 1,
          letterSpacing: '-0.3px',
        }}>
          {kcal}
        </span>
        <span style={{
          fontSize: 7,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: "'DM Mono', monospace",
          marginTop: 1,
        }}>
          kcal
        </span>
      </div>
    </div>
  )
}

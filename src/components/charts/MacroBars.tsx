interface MacroBarsProps {
  proteine: number
  proteineTotal: number
  carboidrati: number
  carboidratiTotal: number
  grassi: number
  grassiTotal: number
}

const bars = [
  { key: 'proteine' as const, label: 'Proteine', color: '#EAFF55' },
  { key: 'carboidrati' as const, label: 'Carb', color: '#C9A84C' },
  { key: 'grassi' as const, label: 'Grassi', color: '#C4714A' },
]

export default function MacroBars({
  proteine, proteineTotal,
  carboidrati, carboidratiTotal,
  grassi, grassiTotal,
}: MacroBarsProps) {
  const totals = { proteine: proteineTotal, carboidrati: carboidratiTotal, grassi: grassiTotal }
  const consumed = { proteine, carboidrati, grassi }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {bars.map((bar) => {
        const pct = Math.min((consumed[bar.key] / totals[bar.key]) * 100, 100)
        return (
          <div key={bar.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 9,
              color: 'rgba(255,255,255,0.3)',
              width: 48,
              fontFamily: "'Poppins', sans-serif",
            }}>
              {bar.label}
            </span>
            <div style={{
              flex: 1, height: 3,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 3, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: bar.color,
                borderRadius: 3,
              }}/>
            </div>
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.6)',
              width: 28,
              textAlign: 'right',
              fontFamily: "'DM Mono', monospace",
            }}>
              {totals[bar.key]}g
            </span>
          </div>
        )
      })}
    </div>
  )
}

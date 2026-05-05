export default function StatusBar({ time = '09:30' }: { time?: string }) {
  return (
    <div style={{
      padding: '13px 16px 3px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
      fontFamily: "'DM Mono', monospace",
      fontSize: 9,
      fontWeight: 500,
      color: '#FFFFFF',
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Signal bars — fedele al reference */}
        <span style={{ fontSize: 8, opacity: 0.8, letterSpacing: 1 }}>▲▲▲</span>
        {/* Battery */}
        <div style={{
          width: 16, height: 8,
          border: '1.5px solid rgba(255,255,255,0.7)',
          borderRadius: 2,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: 1, top: 1, bottom: 1,
            width: '75%',
            background: '#FFFFFF',
            borderRadius: 1,
          }}/>
          <div style={{
            position: 'absolute',
            right: -3, top: '50%', transform: 'translateY(-50%)',
            width: 2, height: 4,
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '0 1px 1px 0',
          }}/>
        </div>
      </div>
    </div>
  )
}

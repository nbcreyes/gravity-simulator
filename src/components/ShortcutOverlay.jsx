export default function ShortcutOverlay({ visible, onClose }) {
  if (!visible) return null

  const shortcuts = [
    { key: 'SPACE',  desc: 'Pause / Resume simulation' },
    { key: 'C',      desc: 'Clear all bodies' },
    { key: 'R',      desc: 'Zoom to fit all bodies' },
    { key: 'T',      desc: 'Top-down view' },
    { key: 'S',      desc: 'Side view' },
    { key: 'ESC',    desc: 'Unlock camera / close' },
    { key: '1',      desc: 'Load Binary Star preset' },
    { key: '2',      desc: 'Load Solar System preset' },
    { key: '3',      desc: 'Load Figure-8 preset' },
    { key: '4',      desc: 'Load Chaos preset' },
    { key: '?',      desc: 'Toggle this overlay' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-3 p-6"
        style={{
          background: 'rgba(6,6,18,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          minWidth: 360,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-orbitron text-sm font-bold tracking-widest text-white">
            KEYBOARD SHORTCUTS
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Shortcuts list */}
        <div className="flex flex-col gap-2 mt-1">
          {shortcuts.map(s => (
            <div key={s.key} className="flex justify-between items-center gap-8">
              <span className="font-mono text-xs text-gray-400">{s.desc}</span>
              <span
                className="font-orbitron text-[10px] px-2 py-1 rounded flex-shrink-0"
                style={{
                  background: 'rgba(0,229,255,0.08)',
                  border: '1px solid rgba(0,229,255,0.2)',
                  color: '#00e5ff'
                }}
              >
                {s.key}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-white/5 mt-2" />

        <p className="font-orbitron text-[8px] tracking-widest text-center"
           style={{ color: '#ffffff22' }}>
          PRESS ? OR CLICK OUTSIDE TO CLOSE
        </p>
      </div>
    </div>
  )
}
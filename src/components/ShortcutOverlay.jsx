export default function ShortcutOverlay({ visible, onClose }) {
  if (!visible) return null

  const shortcuts = [
    { key: 'SPACE', desc: 'Pause / Resume simulation' },
    { key: 'C',     desc: 'Clear all bodies'          },
    { key: 'R',     desc: 'Zoom to fit all bodies'    },
    { key: 'T',     desc: 'Top-down view'             },
    { key: 'S',     desc: 'Side view'                 },
    { key: 'ESC',   desc: 'Unlock camera'             },
    { key: '?',     desc: 'Toggle this overlay'       },
  ]

  const presets = [
    { key: '1', desc: 'Binary Star'      },
    { key: '2', desc: 'Solar System'     },
    { key: '3', desc: 'Figure-8'         },
    { key: '4', desc: 'Chaos'            },
    { key: '5', desc: 'Trojan Asteroids' },
    { key: '6', desc: 'Galaxy Collision' },
    { key: '7', desc: 'Pulsar System'    },
    { key: '8', desc: 'Rogue Planet'     },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-4 p-6"
        style={{
          background: 'rgba(6,6,18,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          minWidth: 400,
          maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-orbitron text-sm font-bold tracking-widest text-white">
              KEYBOARD SHORTCUTS
            </h2>
            <p className="font-orbitron text-[9px] tracking-widest mt-0.5"
               style={{ color: '#00e5ff55' }}>
              GRAVITAS 3D GRAVITY SIMULATOR
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors text-2xl leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Simulation controls */}
        <div className="flex flex-col gap-1.5">
          <p className="font-orbitron text-[9px] tracking-widest mb-1"
             style={{ color: '#00e5ff88' }}>
            SIMULATION
          </p>
          {shortcuts.map(s => (
            <ShortcutRow key={s.key} shortcut={s.key} desc={s.desc} />
          ))}
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Presets */}
        <div className="flex flex-col gap-1.5">
          <p className="font-orbitron text-[9px] tracking-widest mb-1"
             style={{ color: '#ffd54f88' }}>
            PRESETS
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {presets.map(s => (
              <ShortcutRow key={s.key} shortcut={s.key} desc={s.desc} accent="#ffd54f" />
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Mouse controls */}
        <div className="flex flex-col gap-1.5">
          <p className="font-orbitron text-[9px] tracking-widest mb-1"
             style={{ color: '#ffffff33' }}>
            MOUSE
          </p>
          {[
            { key: 'LMB',        desc: 'Select / place body'     },
            { key: 'RMB',        desc: 'Context menu on body'    },
            { key: 'DRAG',       desc: 'Set initial velocity'    },
            { key: 'SCROLL',     desc: 'Zoom in / out'           },
            { key: 'MMB DRAG',   desc: 'Pan camera'              },
            { key: 'RMB DRAG',   desc: 'Orbit camera'            },
          ].map(s => (
            <ShortcutRow key={s.key} shortcut={s.key} desc={s.desc} accent="#ffffff44" />
          ))}
        </div>

        <div className="w-full h-px bg-white/5" />

        <p
          className="font-orbitron text-[8px] tracking-widest text-center"
          style={{ color: '#ffffff18' }}
        >
          PRESS ? OR CLICK OUTSIDE TO CLOSE
        </p>
      </div>
    </div>
  )
}

function ShortcutRow({ shortcut, desc, accent = '#00e5ff' }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="font-mono text-[10px] text-gray-400 flex-1">
        {desc}
      </span>
      <span
        className="font-orbitron text-[8px] px-2 py-0.5 rounded flex-shrink-0"
        style={{
          background: `${accent}12`,
          border: `1px solid ${accent}30`,
          color: accent
        }}
      >
        {shortcut}
      </span>
    </div>
  )
}
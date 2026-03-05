import { useSimulation } from '../store/simulation.js'

const PRESETS = [
  { name: 'Binary Star',       icon: '⭐' },
  { name: 'Solar System',      icon: '🪐' },
  { name: 'Full Solar System', icon: '☀️' },
  { name: 'Figure-8',          icon: '♾️'  },
  { name: 'Chaos',             icon: '💥' },
  { name: 'Trojan Asteroids',  icon: '🪨' },
  { name: 'Galaxy Collision',  icon: '🌌' },
  { name: 'Pulsar System',     icon: '💫' },
  { name: 'Rogue Planet',      icon: '🌠' },
]

const TIME_PRESETS = [0.1, 0.5, 1, 5, 20]

export default function ControlPanel({ pendingMass, setPendingMass, fps, onToggleShortcuts }) {
  const paused                = useSimulation(s => s.paused)
  const bodies                = useSimulation(s => s.bodies)
  const G                     = useSimulation(s => s.G)
  const timeScale             = useSimulation(s => s.timeScale)
  const togglePause           = useSimulation(s => s.togglePause)
  const clearAll              = useSimulation(s => s.clearAll)
  const loadPreset            = useSimulation(s => s.loadPreset)
  const setPlacement          = useSimulation(s => s.setPlacementMode)
  const setG                  = useSimulation(s => s.setG)
  const setTimeScale          = useSimulation(s => s.setTimeScale)
  const placement             = useSimulation(s => s.placementMode)
  const setCameraMode         = useSimulation(s => s.setCameraMode)
  const lockedBodyId          = useSimulation(s => s.lockedBodyId)
  const setLockedBodyId       = useSimulation(s => s.setLockedBodyId)
  const showEnergy            = useSimulation(s => s.showEnergy)
  const showCenterOfMass      = useSimulation(s => s.showCenterOfMass)
  const showLagrange          = useSimulation(s => s.showLagrange)
  const showOrbitalElements   = useSimulation(s => s.showOrbitalElements)
  const toggleEnergy          = useSimulation(s => s.toggleEnergy)
  const toggleCenterOfMass    = useSimulation(s => s.toggleCenterOfMass)
  const toggleLagrange        = useSimulation(s => s.toggleLagrange)
  const toggleOrbitalElements = useSimulation(s => s.toggleOrbitalElements)

  const logMass      = v => Math.round(Math.exp(Math.log(1000) * v / 100))
  const massToSlider = m => Math.round(Math.log(m) / Math.log(1000) * 100)

  const timeLabel = timeScale < 1
    ? `${timeScale.toFixed(2)}x`
    : timeScale < 10
    ? `${timeScale.toFixed(1)}x`
    : `${Math.round(timeScale)}x`

  return (
    <div
      className="fixed left-4 top-4 z-20 p-4 flex flex-col gap-4 overflow-y-auto"
      style={{
        width: 248,
        maxHeight: 'calc(100vh - 32px)',
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        scrollbarWidth: 'none'
      }}
    >
      {/* Title */}
      <div>
        <h1 className="font-orbitron text-base font-bold tracking-[0.2em] text-white">
          GRAVITAS
        </h1>
        <p
          className="font-orbitron text-[9px] tracking-widest mt-0.5"
          style={{ color: '#00e5ff88' }}
        >
          3D GRAVITY SIMULATOR
        </p>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Place body */}
      <div className="flex flex-col gap-2">
        <button
          className="btn-primary"
          style={{ opacity: placement === 'placing' ? 0.6 : 1 }}
          onClick={() => setPlacement(placement === 'placing' ? 'idle' : 'placing')}
        >
          {placement === 'placing' ? '◎  PLACING...' : '+  PLACE BODY'}
        </button>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <label className="font-orbitron text-[9px] text-gray-500 tracking-widest">
              MASS
            </label>
            <span className="font-mono text-[11px] text-white/70">
              {pendingMass} M
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={massToSlider(pendingMass)}
            className="slider"
            onChange={e => setPendingMass(logMass(Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Simulation controls */}
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={togglePause}>
          {paused ? '▶  RESUME' : '⏸  PAUSE'}
        </button>
        <button className="btn-danger flex-1" onClick={clearAll}>
          CLEAR
        </button>
      </div>

      {/* G slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="font-orbitron text-[9px] text-gray-500 tracking-widest">
            GRAVITY  G
          </label>
          <span className="font-mono text-[11px] text-white/70">
            {G.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={0.1}
          max={20}
          step={0.1}
          value={G}
          className="slider"
          onChange={e => setG(Number(e.target.value))}
        />
      </div>

      {/* Time scale */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="font-orbitron text-[9px] text-gray-500 tracking-widest">
            TIME SCALE
          </label>
          <span className="font-mono text-[11px] text-white/70">
            {timeLabel}
          </span>
        </div>
        <input
          type="range"
          min={0.1}
          max={50}
          step={0.1}
          value={timeScale}
          className="slider"
          onChange={e => setTimeScale(Number(e.target.value))}
        />
        <div className="flex gap-1 mt-0.5">
          {TIME_PRESETS.map(t => (
            <button
              key={t}
              onClick={() => setTimeScale(t)}
              className="flex-1 font-orbitron text-[8px] py-1 rounded transition-all"
              style={{
                background: timeScale === t
                  ? 'rgba(0,229,255,0.18)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${timeScale === t
                  ? 'rgba(0,229,255,0.45)'
                  : 'rgba(255,255,255,0.07)'}`,
                color: timeScale === t ? '#00e5ff' : '#555'
              }}
            >
              {t}x
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Presets */}
      <div className="flex flex-col gap-1.5">
        <label className="font-orbitron text-[9px] text-gray-500 tracking-widest mb-0.5">
          PRESETS
        </label>
        {PRESETS.map(p => (
          <button
            key={p.name}
            className="btn-preset"
            onClick={() => loadPreset(p.name)}
          >
            <span className="mr-2">{p.icon}</span>{p.name}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Camera controls */}
      <div className="flex flex-col gap-1.5">
        <label className="font-orbitron text-[9px] text-gray-500 tracking-widest mb-0.5">
          CAMERA
        </label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: 'FIT',  mode: 'zoomfit', key: 'R' },
            { label: 'TOP',  mode: 'topdown', key: 'T' },
            { label: 'SIDE', mode: 'side',    key: 'S' },
          ].map(btn => (
            <button
              key={btn.mode}
              onClick={() => setCameraMode(btn.mode)}
              className="font-orbitron text-[8px] py-1.5 rounded transition-all flex flex-col items-center gap-0.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#888'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = 'rgba(0,229,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'
                e.currentTarget.style.color       = '#00e5ff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color       = '#888'
              }}
            >
              <span>{btn.label}</span>
              <span style={{ color: '#444', fontSize: 7 }}>{btn.key}</span>
            </button>
          ))}
        </div>
        {lockedBodyId && (
          <button
            className="btn-primary mt-1"
            onClick={() => setLockedBodyId(null)}
          >
            🔓  UNLOCK CAMERA
          </button>
        )}
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Physics overlays */}
      <div className="flex flex-col gap-1.5">
        <label className="font-orbitron text-[9px] text-gray-500 tracking-widest mb-0.5">
          OVERLAYS
        </label>
        {[
          { label: 'ENERGY',       active: showEnergy,          toggle: toggleEnergy          },
          { label: 'CENTER MASS',  active: showCenterOfMass,    toggle: toggleCenterOfMass    },
          { label: 'LAGRANGE PTS', active: showLagrange,        toggle: toggleLagrange        },
          { label: 'ORBITAL DATA', active: showOrbitalElements, toggle: toggleOrbitalElements },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.toggle}
            className="flex justify-between items-center px-3 py-1.5 rounded transition-all"
            style={{
              background: item.active
                ? 'rgba(0,229,255,0.1)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.active
                ? 'rgba(0,229,255,0.35)'
                : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span
              className="font-orbitron text-[9px] tracking-widest"
              style={{ color: item.active ? '#00e5ff' : '#555' }}
            >
              {item.label}
            </span>
            <span
              className="font-orbitron text-[8px]"
              style={{ color: item.active ? '#00e5ff' : '#333' }}
            >
              {item.active ? 'ON' : 'OFF'}
            </span>
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Stats */}
      <div className="flex justify-between items-end">
        <div>
          <p className="font-orbitron text-[9px] text-gray-600 tracking-widest">
            BODIES
          </p>
          <p className="font-mono text-xl font-bold" style={{ color: '#00e5ff' }}>
            {bodies.length}
          </p>
        </div>
        <div className="text-right">
          <p className="font-orbitron text-[9px] text-gray-600 tracking-widest">
            FPS
          </p>
          <p className="font-mono text-xl font-bold" style={{ color: '#ffd54f' }}>
            {fps}
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Keyboard shortcuts */}
      <div className="flex flex-col gap-1">
        <label className="font-orbitron text-[9px] text-gray-500 tracking-widest mb-0.5">
          SHORTCUTS
        </label>
        {[
          ['SPACE', 'Pause'],
          ['C',     'Clear'],
          ['R',     'Fit view'],
          ['T',     'Top view'],
          ['S',     'Side view'],
          ['1–9',   'Presets'],
          ['ESC',   'Unlock cam'],
        ].map(([key, label]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-gray-600">{label}</span>
            <span
              className="font-orbitron text-[8px] px-1.5 py-0.5 rounded"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#555'
              }}
            >
              {key}
            </span>
          </div>
        ))}
      </div>

      {/* Shortcut overlay toggle */}
      <button
        onClick={onToggleShortcuts}
        className="w-full font-orbitron text-[9px] py-2 rounded transition-all tracking-widest"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: '#444'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.color      = '#888'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
          e.currentTarget.style.color      = '#444'
        }}
      >
        ?  SHORTCUTS
      </button>
    </div>
  )
}
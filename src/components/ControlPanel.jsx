import { useState } from 'react'
import { useSimulation } from '../store/simulation.js'

const PRESETS = [
  { name: 'Binary Star', icon: '⭐' },
  { name: 'Solar System', icon: '🪐' },
  { name: 'Figure-8', icon: '♾️' },
  { name: 'Chaos', icon: '💥' },
]

export default function ControlPanel({ pendingMass, setPendingMass, fps }) {
  const paused = useSimulation(s => s.paused)
  const bodies = useSimulation(s => s.bodies)
  const G = useSimulation(s => s.G)
  const togglePause = useSimulation(s => s.togglePause)
  const clearAll = useSimulation(s => s.clearAll)
  const loadPreset = useSimulation(s => s.loadPreset)
  const setPlacementMode = useSimulation(s => s.setPlacementMode)
  const setG = useSimulation(s => s.setG)
  const placementMode = useSimulation(s => s.placementMode)

  const logMass = (val) => {
    return Math.round(Math.exp(Math.log(1000) * val / 100))
  }

  const massToSlider = (mass) => {
    return Math.round(Math.log(mass) / Math.log(1000) * 100)
  }

  return (
    <div
      className="glass fixed left-4 top-4 z-20 p-4 flex flex-col gap-4"
      style={{ width: 240 }}
    >
      {/* Title */}
      <div>
        <h1 className="font-orbitron text-base font-bold tracking-[0.2em] text-white">
          GRAVITAS
        </h1>
        <p className="font-orbitron text-[9px] tracking-widest text-cyan-400/60 mt-0.5">
          3D GRAVITY SIMULATOR
        </p>
      </div>

      <div className="w-full h-px bg-white/5" />

      {/* Place body */}
      <div className="flex flex-col gap-2">
        <button
          className={`btn-primary ${placementMode === 'placing' ? 'opacity-50' : ''}`}
          onClick={() => setPlacementMode(placementMode === 'placing' ? 'idle' : 'placing')}
        >
          {placementMode === 'placing' ? '◎ PLACING...' : '+ PLACE BODY'}
        </button>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <label className="font-orbitron text-[9px] text-gray-500 tracking-widest">MASS</label>
            <span className="font-mono text-[11px] text-white/80">{pendingMass}M</span>
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
          {paused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
        <button className="btn-danger flex-1" onClick={clearAll}>
          CLEAR
        </button>
      </div>

      {/* G slider */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <label className="font-orbitron text-[9px] text-gray-500 tracking-widest">GRAVITY (G)</label>
          <span className="font-mono text-[11px] text-white/80">{G.toFixed(2)}</span>
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

      <div className="w-full h-px bg-white/5" />

      {/* Presets */}
      <div className="flex flex-col gap-1.5">
        <label className="font-orbitron text-[9px] text-gray-500 tracking-widest mb-1">PRESETS</label>
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

      {/* Stats */}
      <div className="flex justify-between">
        <div>
          <p className="font-orbitron text-[9px] text-gray-600 tracking-widest">BODIES</p>
          <p className="font-mono text-lg text-cyan-400 font-bold">{bodies.length}</p>
        </div>
        <div className="text-right">
          <p className="font-orbitron text-[9px] text-gray-600 tracking-widest">FPS</p>
          <p className="font-mono text-lg text-ffd54f font-bold" style={{ color: '#ffd54f' }}>{fps}</p>
        </div>
      </div>
    </div>
  )
}
import { useSimulation } from '../store/simulation.js'
import { computeKineticEnergy, computePotentialEnergy, computeTotalEnergy } from '../physics/analysis.js'
import { useRef } from 'react'

export default function EnergyDisplay() {
  const bodies      = useSimulation(s => s.bodies)
  const G           = useSimulation(s => s.G)
  const showEnergy  = useSimulation(s => s.showEnergy)
  const initialRef  = useRef(null)

  if (!showEnergy || bodies.length < 2) return null

  const ke    = computeKineticEnergy(bodies)
  const pe    = computePotentialEnergy(bodies, G)
  const total = ke + pe

  if (initialRef.current === null) initialRef.current = total
  const drift = initialRef.current !== 0
    ? ((total - initialRef.current) / Math.abs(initialRef.current) * 100).toFixed(4)
    : '0.0000'

  const fmt = (n) => {
    if (Math.abs(n) > 1e6)  return (n / 1e6).toFixed(2) + 'M'
    if (Math.abs(n) > 1e3)  return (n / 1e3).toFixed(2) + 'K'
    return n.toFixed(2)
  }

  const driftNum   = parseFloat(drift)
  const driftColor = Math.abs(driftNum) < 0.01
    ? '#00e5ff'
    : Math.abs(driftNum) < 0.1
    ? '#ffd54f'
    : '#ff6e6e'

  return (
    <div
      className="fixed bottom-4 left-4 z-20 p-4 flex flex-col gap-2"
      style={{
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        minWidth: 200
      }}
    >
      <p className="font-orbitron text-[9px] tracking-widest"
         style={{ color: '#00e5ff88' }}>
        ENERGY CONSERVATION
      </p>

      <div className="w-full h-px bg-white/5" />

      <ERow label="KINETIC"   value={fmt(ke)}    color="#4fc3f7" />
      <ERow label="POTENTIAL" value={fmt(pe)}    color="#ffd54f" />
      <ERow label="TOTAL"     value={fmt(total)} color="#fff" />

      <div className="w-full h-px bg-white/5" />

      <div className="flex justify-between items-center">
        <span className="font-orbitron text-[9px] text-gray-500 tracking-widest">
          DRIFT
        </span>
        <span
          className="font-mono text-xs font-bold"
          style={{ color: driftColor }}
        >
          {drift}%
        </span>
      </div>

      {/* Energy bar */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(Math.abs(driftNum) * 100, 100)}%`,
            background: driftColor,
            borderRadius: 99,
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  )
}

function ERow({ label, value, color }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-orbitron text-[9px] text-gray-500 tracking-widest">
        {label}
      </span>
      <span className="font-mono text-xs" style={{ color }}>
        {value}
      </span>
    </div>
  )
}
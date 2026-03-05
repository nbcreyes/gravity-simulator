import { useSimulation } from '../store/simulation.js'
import { computeOrbitalElements } from '../physics/analysis.js'

function ORow({ label, value, unit }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-orbitron text-[8px] text-gray-600 tracking-widest">
        {label}
      </span>
      <span className="font-mono text-sm text-white">
        {value} <span className="text-gray-600 text-xs">{unit}</span>
      </span>
    </div>
  )
}

export default function OrbitalElements() {
  const bodies              = useSimulation(s => s.bodies)
  const selectedBodyId      = useSimulation(s => s.selectedBodyId)
  const G                   = useSimulation(s => s.G)
  const showOrbitalElements = useSimulation(s => s.showOrbitalElements)

  if (!showOrbitalElements || !selectedBodyId) return null

  const body = bodies.find(b => b.id === selectedBodyId)
  if (!body) return null

  const primary = bodies
    .filter(b => b.id !== selectedBodyId)
    .sort((a, b) => b.mass - a.mass)[0]

  if (!primary) return null

  const elements = computeOrbitalElements(body, primary, G)

  if (!elements) return (
    <div
      className="fixed bottom-4 left-1/2 z-20 px-4 py-3"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10
      }}
    >
      <p className="font-orbitron text-[9px] text-gray-500 tracking-widest">
        UNBOUND ORBIT (ESCAPE TRAJECTORY)
      </p>
    </div>
  )

  return (
    <div
      className="fixed bottom-4 left-1/2 z-20 px-5 py-4 flex flex-col gap-2"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${body.color}33`,
        borderRadius: 12,
        minWidth: 320,
        boxShadow: `0 0 20px ${body.color}11`
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: body.color,
            boxShadow: `0 0 6px ${body.color}`
          }}
        />
        <p className="font-orbitron text-[9px] tracking-widest text-white">
          {body.name}
        </p>
        <p
          className="font-orbitron text-[9px] tracking-widest"
          style={{ color: '#ffffff33' }}
        >
          ORBITAL ELEMENTS
        </p>
      </div>

      <div className="w-full h-px bg-white/5" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <ORow label="SEMI-MAJOR AXIS" value={elements.semiMajorAxis} unit="u"  />
        <ORow label="ECCENTRICITY"    value={elements.eccentricity}  unit=""   />
        <ORow label="PERIOD"          value={elements.periodDays}    unit="d"  />
        <ORow label="PERIOD"          value={elements.periodYears}   unit="yr" />
      </div>
    </div>
  )
}
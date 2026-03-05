import { useSimulation } from '../store/simulation.js'
import { bodyRadius } from '../physics/engine.js'

export default function BodyInspector() {
  const bodies = useSimulation(s => s.bodies)
  const selectedBodyId = useSimulation(s => s.selectedBodyId)
  const selectBody = useSimulation(s => s.selectBody)
  const updateBody = useSimulation(s => s.updateBody)
  const removeBody = useSimulation(s => s.removeBody)

  const body = bodies.find(b => b.id === selectedBodyId)
  const isOpen = !!body

  const speed = body
    ? Math.sqrt(
        body.velocity.x ** 2 +
        body.velocity.y ** 2 +
        body.velocity.z ** 2
      ).toFixed(2)
    : 0

  const ke = body ? (0.5 * body.mass * speed ** 2).toFixed(1) : 0

  return (
    <div
      className={`inspector-panel fixed right-0 top-0 h-full w-72 glass z-20 p-5 flex flex-col gap-4 ${isOpen ? 'open' : ''}`}
      style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRadius: 0 }}
    >
      {body && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: body.color,
                  boxShadow: `0 0 8px ${body.color}`
                }}
              />
              <span className="font-orbitron text-sm font-semibold tracking-widest text-white">
                {body.name}
              </span>
            </div>
            <button
              onClick={() => selectBody(null)}
              className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Stats */}
          <div className="flex flex-col gap-3">
            <StatRow label="MASS" value={body.mass.toFixed(1)} unit="M" />
            <StatRow label="SPEED" value={speed} unit="u/s" />
            <StatRow label="KINETIC E" value={ke} unit="J" />
            <StatRow label="X" value={body.position.x.toFixed(1)} unit="u" />
            <StatRow label="Y" value={body.position.y.toFixed(1)} unit="u" />
            <StatRow label="Z" value={body.position.z.toFixed(1)} unit="u" />
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Mass slider */}
          <div className="flex flex-col gap-2">
            <label className="font-orbitron text-xs text-cyan-400 tracking-widest">
              ADJUST MASS
            </label>
            <input
              type="range"
              min={1}
              max={1000}
              value={body.mass}
              className="slider"
              onChange={e => updateBody(body.id, { mass: Number(e.target.value) })}
            />
          </div>

          <div className="mt-auto">
            <button
              className="btn-danger w-full"
              onClick={() => removeBody(body.id)}
            >
              DELETE BODY
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function StatRow({ label, value, unit }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-orbitron text-[10px] text-gray-500 tracking-widest">{label}</span>
      <span className="font-mono text-sm text-white/90">
        {value} <span className="text-gray-600 text-xs">{unit}</span>
      </span>
    </div>
  )
}
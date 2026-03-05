import { useSimulation } from "../store/simulation.js";

function StatRow({ label, value, unit }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-orbitron text-[10px] text-gray-500 tracking-widest">
        {label}
      </span>
      <span className="font-mono text-sm text-white/90">
        {value} <span className="text-gray-600 text-xs">{unit}</span>
      </span>
    </div>
  );
}

export default function BodyInspector() {
  const bodies = useSimulation((s) => s.bodies);
  const selectedId = useSimulation((s) => s.selectedBodyId);
  const selectBody = useSimulation((s) => s.selectBody);
  const updateBody = useSimulation((s) => s.updateBody);
  const removeBody = useSimulation((s) => s.removeBody);
  const setLockedBodyId = useSimulation((s) => s.setLockedBodyId);
  const lockedBodyId = useSimulation((s) => s.lockedBodyId);

  const body = bodies.find((b) => b.id === selectedId);
  const isOpen = !!body;

  const speed = body
    ? Math.sqrt(
        body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2,
      ).toFixed(3)
    : 0;

  const ke = body ? (0.5 * body.mass * Number(speed) ** 2).toFixed(2) : 0;

  return (
    <div
      className="fixed right-0 top-0 h-full w-72 z-20 p-5 flex flex-col gap-4"
      style={{
        background: "rgba(6,6,18,0.85)",
        backdropFilter: "blur(24px)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        transform: isOpen ? "translateX(0%)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {body && (
        <>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: body.color,
                  boxShadow: `0 0 10px ${body.color}`,
                }}
              />
              <span className="font-orbitron text-sm font-semibold tracking-widest text-white">
                {body.name}
              </span>
            </div>
            <button
              onClick={() => selectBody(null)}
              className="text-gray-600 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="w-full h-px bg-white/5" />

          <div className="flex flex-col gap-3">
            <StatRow label="MASS" value={body.mass.toFixed(2)} unit="M" />
            <StatRow label="SPEED" value={speed} unit="u/s" />
            <StatRow label="KE" value={ke} unit="J" />
            <StatRow label="X" value={body.position.x.toFixed(1)} unit="u" />
            <StatRow label="Y" value={body.position.y.toFixed(1)} unit="u" />
            <StatRow label="Z" value={body.position.z.toFixed(1)} unit="u" />
          </div>

          <div className="w-full h-px bg-white/5" />

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <label className="font-orbitron text-[9px] text-cyan-400 tracking-widest">
                ADJUST MASS
              </label>
              <span className="font-mono text-[11px] text-white/60">
                {body.mass.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={1000}
              value={Math.min(body.mass, 1000)}
              className="slider"
              onChange={(e) =>
                updateBody(body.id, { mass: Number(e.target.value) })
              }
            />
          </div>

          <div className="mt-auto">
            <button
              className="btn-danger w-full"
              onClick={() => removeBody(body.id)}
            >
              DELETE BODY
            </button>

            <button
              className="btn-primary w-full mb-2"
              onClick={() =>
                setLockedBodyId(lockedBodyId === body.id ? null : body.id)
              }
            >
              {lockedBodyId === body.id ? "🔓 UNLOCK CAMERA" : "🔒 LOCK CAMERA"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

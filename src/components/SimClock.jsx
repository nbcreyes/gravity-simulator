import { useSimulation } from '../store/simulation.js'

function formatTime(t) {
  // t is in simulation time units
  // We treat 1 unit ≈ 1 simulation day for display
  const totalDays  = Math.floor(t)
  const years      = Math.floor(totalDays / 365)
  const days       = totalDays % 365
  const hours      = Math.floor((t - totalDays) * 24)

  if (years > 0) {
    return {
      primary: `${years.toLocaleString()} yr ${days} d`,
      secondary: 'ELAPSED'
    }
  }
  if (totalDays > 0) {
    return {
      primary: `${days} d ${hours} hr`,
      secondary: 'ELAPSED'
    }
  }
  return {
    primary: `${hours} hr`,
    secondary: 'ELAPSED'
  }
}

export default function SimClock() {
  const simTime = useSimulation(s => s.simTime)
  const paused  = useSimulation(s => s.paused)
  const { primary, secondary } = formatTime(simTime)

  return (
    <div
      className="fixed top-4 left-1/2 z-20 px-5 py-2.5 flex flex-col items-center"
      style={{
        transform: 'translateX(-50%)',
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        minWidth: 180
      }}
    >
      <div className="flex items-center gap-2">
        {/* Pulse indicator */}
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: paused ? '#555' : '#00e5ff',
            boxShadow: paused ? 'none' : '0 0 6px #00e5ff',
            animation: paused ? 'none' : 'pulse 1.5s ease-in-out infinite'
          }}
        />
        <span
          className="font-orbitron font-bold tracking-widest"
          style={{ fontSize: 13, color: paused ? '#555' : '#fff' }}
        >
          {primary}
        </span>
      </div>
      <span
        className="font-orbitron tracking-[0.3em] mt-0.5"
        style={{ fontSize: 8, color: '#00e5ff55' }}
      >
        {paused ? 'PAUSED' : secondary}
      </span>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
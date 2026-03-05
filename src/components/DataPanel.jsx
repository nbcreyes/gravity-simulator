import { useRef } from 'react'
import { useSimulation } from '../store/simulation.js'
import { exportSimulation, importSimulation, takeScreenshot } from '../utils/exportImport.js'

export default function DataPanel() {
  const bodies      = useSimulation(s => s.bodies)
  const simTime     = useSimulation(s => s.simTime)
  const G           = useSimulation(s => s.G)
  const timeScale   = useSimulation(s => s.timeScale)
  const importState = useSimulation(s => s.importState)
  const fileRef     = useRef()

  const handleExport = () => {
    exportSimulation(bodies, simTime, G, timeScale)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const state = await importSimulation(file)
      importState(state)
    } catch {
      alert('Failed to load simulation file.')
    }
    e.target.value = ''
  }

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) takeScreenshot(canvas)
  }

  const btnStyle = (disabled = false) => ({
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    color: disabled ? '#333' : '#888',
    cursor: disabled ? 'not-allowed' : 'pointer'
  })

  const btnHoverOn = (e) => {
    e.currentTarget.style.background = 'rgba(0,229,255,0.1)'
    e.currentTarget.style.color      = '#00e5ff'
  }

  const btnHoverOff = (e, disabled = false) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
    e.currentTarget.style.color      = disabled ? '#333' : '#888'
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-20 p-3 flex flex-col gap-2"
      style={{
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        minWidth: 200
      }}
    >
      <p
        className="font-orbitron text-[9px] tracking-widest"
        style={{ color: '#00e5ff88' }}
      >
        DATA
      </p>

      <div className="w-full h-px bg-white/5" />

      <button
        onClick={handleScreenshot}
        className="flex items-center gap-2 px-3 py-1.5 rounded transition-all font-orbitron text-[9px] tracking-widest"
        style={btnStyle()}
        onMouseEnter={btnHoverOn}
        onMouseLeave={e => btnHoverOff(e)}
      >
        📷  SCREENSHOT
      </button>

      <button
        onClick={handleExport}
        disabled={bodies.length === 0}
        className="flex items-center gap-2 px-3 py-1.5 rounded transition-all font-orbitron text-[9px] tracking-widest"
        style={btnStyle(bodies.length === 0)}
        onMouseEnter={e => { if (bodies.length > 0) btnHoverOn(e) }}
        onMouseLeave={e => btnHoverOff(e, bodies.length === 0)}
      >
        💾  EXPORT JSON
      </button>

      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-3 py-1.5 rounded transition-all font-orbitron text-[9px] tracking-widest"
        style={btnStyle()}
        onMouseEnter={btnHoverOn}
        onMouseLeave={e => btnHoverOff(e)}
      >
        📂  IMPORT JSON
      </button>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
    </div>
  )
}
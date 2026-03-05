import { useState, useEffect, useRef } from 'react'
import SimulationCanvas from './components/SimulationCanvas.jsx'
import ControlPanel     from './components/ControlPanel.jsx'
import BodyInspector    from './components/BodyInspector.jsx'
import SimClock         from './components/SimClock.jsx'
import OrbitMap         from './components/OrbitMap.jsx'
import ShortcutOverlay  from './components/ShortcutOverlay.jsx'
import EnergyDisplay    from './components/EnergyDisplay.jsx'
import OrbitalElements  from './components/OrbitalElements.jsx'
import DataPanel        from './components/DataPanel.jsx'
import AudioManager     from './components/AudioManager.jsx'
import { initAudio, stopAudio } from './audio/soundEngine.js'

export default function App() {
  const [pendingMass,   setPendingMass]   = useState(100)
  const [fps,           setFps]           = useState(60)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [audioEnabled,  setAudioEnabled]  = useState(false)

  const frameCount = useRef(0)
  const lastTime   = useRef(performance.now())

  useEffect(() => {
    let raf
    const tick = () => {
      frameCount.current++
      const now = performance.now()
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current)
        frameCount.current = 0
        lastTime.current   = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Called directly from onClick — required by browser autoplay policy
  const handleToggleAudio = async () => {
    if (!audioEnabled) {
      await initAudio()
      setAudioEnabled(true)
    } else {
      stopAudio()
      setAudioEnabled(false)
    }
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: '#02020f' }}
    >
      <SimulationCanvas
        pendingMass={pendingMass}
        onToggleShortcuts={() => setShowShortcuts(v => !v)}
      />
      <SimClock />
      <ControlPanel
        pendingMass={pendingMass}
        setPendingMass={setPendingMass}
        fps={fps}
        onToggleShortcuts={() => setShowShortcuts(v => !v)}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />
      <BodyInspector />
      <OrbitMap />
      <EnergyDisplay />
      <OrbitalElements />
      <DataPanel />
      <AudioManager audioEnabled={audioEnabled} />
      <ShortcutOverlay
        visible={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
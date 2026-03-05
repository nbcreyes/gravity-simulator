import { useState, useEffect, useRef } from 'react'
import SimulationCanvas from './components/SimulationCanvas.jsx'
import ControlPanel from './components/ControlPanel.jsx'
import BodyInspector from './components/BodyInspector.jsx'

export default function App() {
  const [pendingMass, setPendingMass] = useState(100)
  const [fps, setFps] = useState(60)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    let raf
    const tick = () => {
      frameCount.current++
      const now = performance.now()
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current)
        frameCount.current = 0
        lastTime.current = now
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: '#02020f' }}>
      <SimulationCanvas pendingMass={pendingMass} />
      <ControlPanel pendingMass={pendingMass} setPendingMass={setPendingMass} fps={fps} />
      <BodyInspector />
    </div>
  )
}
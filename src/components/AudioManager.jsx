import { useEffect, useRef } from 'react'
import { useSimulation } from '../store/simulation.js'
import { playCollision, playBodyPlace } from '../audio/soundEngine.js'

export default function AudioManager({ audioEnabled }) {
  const collisionFlashes = useSimulation(s => s.collisionFlashes)
  const placementMode    = useSimulation(s => s.placementMode)
  const bodies           = useSimulation(s => s.bodies)
  const prevFlashCount   = useRef(0)
  const prevPlacement    = useRef('idle')
  const prevBodyCount    = useRef(0)

  useEffect(() => {
    if (!audioEnabled) return
    if (collisionFlashes.length > prevFlashCount.current) {
      playCollision(200)
    }
    prevFlashCount.current = collisionFlashes.length
  }, [collisionFlashes, audioEnabled])

  useEffect(() => {
    if (!audioEnabled) return
    if (
      bodies.length > prevBodyCount.current &&
      prevPlacement.current === 'placing'
    ) {
      playBodyPlace()
    }
    prevBodyCount.current = bodies.length
    prevPlacement.current = placementMode
  }, [bodies.length, placementMode, audioEnabled])

  return null
}
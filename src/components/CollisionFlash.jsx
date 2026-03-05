import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSimulation } from '../store/simulation.js'

function FlashSphere({ flash }) {
  const meshRef    = useRef()
  const frameRef   = useRef(0)
  const removeFlash = useSimulation(s => s.removeCollisionFlash)

  useFrame(() => {
    if (!meshRef.current) return
    frameRef.current += 1
    const t = frameRef.current / 40
    meshRef.current.scale.setScalar(0.5 + t * 3)
    meshRef.current.material.opacity = Math.max(0, 1 - t)
    if (frameRef.current >= 40) removeFlash(flash.id)
  })

  return (
    <mesh
      ref={meshRef}
      position={[flash.position.x, flash.position.y, flash.position.z]}
    >
      <sphereGeometry args={[8, 16, 16]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={3}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

export default function CollisionFlashes() {
  const flashes = useSimulation(s => s.collisionFlashes)
  return (
    <>
      {flashes.map(f => <FlashSphere key={f.id} flash={f} />)}
    </>
  )
}
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function NebulaCloud({ position, color, size, speed, opacity }) {
  const meshRef = useRef()
  const offset  = useMemo(() => Math.random() * Math.PI * 2, [])

  const texture = useMemo(() => {
    const s      = 256
    const canvas = document.createElement('canvas')
    canvas.width  = s
    canvas.height = s
    const ctx  = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2)
    grad.addColorStop(0,   color + 'ff')
    grad.addColorStop(0.4, color + '88')
    grad.addColorStop(1,   color + '00')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, s, s)
    return new THREE.CanvasTexture(canvas)
  }, [color])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime * speed + offset
    meshRef.current.rotation.z = t * 0.05
    meshRef.current.material.opacity = opacity * (0.7 + Math.sin(t * 0.3) * 0.3)
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function Nebula() {
  const clouds = useMemo(() => [
    { position: [-800,  400,  -1200], color: '#1a0533', size: 1800, speed: 0.1,  opacity: 0.35 },
    { position: [ 600, -300,  -1000], color: '#001133', size: 1400, speed: 0.08, opacity: 0.3  },
    { position: [-200,  600,  -1400], color: '#0d1a33', size: 2000, speed: 0.06, opacity: 0.25 },
    { position: [ 900,  200,  -900],  color: '#1a0020', size: 1200, speed: 0.12, opacity: 0.28 },
    { position: [-600, -500,  -1100], color: '#001a1a', size: 1600, speed: 0.07, opacity: 0.22 },
  ], [])

  return (
    <>
      {clouds.map((c, i) => <NebulaCloud key={i} {...c} />)}
    </>
  )
}
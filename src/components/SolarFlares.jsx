import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulation } from '../store/simulation.js'
import { bodyRadius } from '../physics/engine.js'

function Flare({ body, angle, length, width, speed, offset }) {
  const meshRef = useRef()
  const radius  = bodyRadius(body.mass)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t       = clock.elapsedTime * speed + offset
    const scale   = 0.6 + Math.sin(t) * 0.4
    const opacity = 0.3 + Math.sin(t * 1.3) * 0.2
    meshRef.current.scale.set(width, length * scale, 1)
    meshRef.current.material.opacity = Math.max(0, opacity)
  })

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width  = 32
    canvas.height = 128
    const ctx  = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 0, 128)
    grad.addColorStop(0,   'rgba(255,200,50,0)')
    grad.addColorStop(0.2, 'rgba(255,200,50,0.8)')
    grad.addColorStop(0.5, 'rgba(255,150,30,0.6)')
    grad.addColorStop(1,   'rgba(255,100,20,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 32, 128)
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <mesh
      ref={meshRef}
      position={[
        body.position.x + Math.cos(angle) * (radius + length * 0.3),
        body.position.y + Math.sin(angle) * (radius + length * 0.3),
        body.position.z
      ]}
      rotation={[0, 0, angle + Math.PI / 2]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function SolarFlares() {
  const bodies = useSimulation(s => s.bodies)
  const stars  = bodies.filter(b => b.mass > 5000)

  const flareConfigs = useMemo(() => {
    return stars.map(star => ({
      star,
      flares: Array.from({ length: 8 }, (_, i) => ({
        angle:  (i / 8) * Math.PI * 2 + Math.random() * 0.5,
        length: bodyRadius(star.mass) * (0.6 + Math.random() * 0.8),
        width:  bodyRadius(star.mass) * (0.15 + Math.random() * 0.2),
        speed:  0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      }))
    }))
  }, [stars.length])

  return (
    <>
      {flareConfigs.map(({ star, flares }) =>
        flares.map((f, i) => (
          <Flare key={`${star.id}-${i}`} body={star} {...f} />
        ))
      )}
    </>
  )
}
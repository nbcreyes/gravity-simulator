import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulation } from '../store/simulation.js'

export default function AsteroidBelt() {
  const bodies     = useSimulation(s => s.bodies)
  const meshRef    = useRef()
  const COUNT      = 200

  const hasSol     = bodies.some(b => b.name === 'Sol')
  const hasJupiter = bodies.some(b => b.name === 'Jupiter')
  const hasMars    = bodies.some(b => b.name === 'Mars')

  const transforms = useMemo(() => {
    if (!hasSol || !hasJupiter || !hasMars) return null

    const mars    = bodies.find(b => b.name === 'Mars')
    const jupiter = bodies.find(b => b.name === 'Jupiter')
    if (!mars || !jupiter) return null

    const innerR = Math.hypot(mars.position.x,    mars.position.y)    * 1.15
    const outerR = Math.hypot(jupiter.position.x, jupiter.position.y) * 0.85

    const dummy     = new THREE.Object3D()
    const matrices  = []
    const rotSpeeds = []

    for (let i = 0; i < COUNT; i++) {
      const r     = innerR + Math.random() * (outerR - innerR)
      const angle = Math.random() * Math.PI * 2
      const tilt  = (Math.random() - 0.5) * 18
      const scale = 0.4 + Math.random() * 1.2

      dummy.position.set(r * Math.cos(angle), r * Math.sin(angle), tilt)
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      matrices.push(dummy.matrix.clone())
      rotSpeeds.push((Math.random() - 0.5) * 0.02)
    }

    return { matrices, rotSpeeds }
  }, [hasSol, hasJupiter, hasMars])

  useEffect(() => {
    if (!meshRef.current || !transforms) return
    transforms.matrices.forEach((m, i) => {
      meshRef.current.setMatrixAt(i, m)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [transforms])

  useFrame(() => {
    if (!meshRef.current || !transforms) return
    const dummy = new THREE.Object3D()
    transforms.matrices.forEach((m, i) => {
      dummy.matrix.copy(m)
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
      dummy.rotation.y += transforms.rotSpeeds[i]
      dummy.updateMatrix()
      transforms.matrices[i].copy(dummy.matrix)
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  if (!transforms) return null

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#7a6a5a"
        roughness={0.9}
        metalness={0.1}
      />
    </instancedMesh>
  )
}
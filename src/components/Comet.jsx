import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CometTail({ position, velocity }) {
  const trailRef = useRef([])
  const meshRef  = useRef()

  const obj = useMemo(() => {
    const points   = Array.from({ length: 40 }, (_, i) => new THREE.Vector3(0, 0, 0))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color('#aaddff'),
      transparent: true,
      opacity: 0.6,
      vertexColors: false
    })
    return new THREE.Line(geometry, material)
  }, [])

  useFrame(() => {
    if (!position) return
    trailRef.current.unshift(position.clone())
    if (trailRef.current.length > 40) trailRef.current.pop()

    const points = trailRef.current.map((p, i) => {
      // Tail fans out opposite to velocity direction
      const spread = i * 0.3
      return new THREE.Vector3(
        p.x + (Math.random() - 0.5) * spread * 0.1,
        p.y + (Math.random() - 0.5) * spread * 0.1,
        p.z
      )
    })

    while (points.length < 40) points.push(points[points.length - 1] || new THREE.Vector3())
    obj.geometry.setFromPoints(points)
    obj.geometry.attributes.position.needsUpdate = true
  })

  return <primitive object={obj} />
}

export default function Comet({ startPosition, startVelocity, mass = 2, color = '#aaddff' }) {
  const meshRef    = useRef()
  const posRef     = useRef(startPosition.clone())
  const velRef     = useRef(startVelocity.clone())
  const [pos, setPos] = useState(startPosition.clone())

  useFrame(() => {
    if (!meshRef.current) return
    posRef.current.add(velRef.current.clone().multiplyScalar(0.016))
    setPos(posRef.current.clone())
    meshRef.current.position.copy(posRef.current)
  })

  return (
    <>
      <mesh ref={meshRef} position={[startPosition.x, startPosition.y, startPosition.z]}>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          roughness={0.3}
        />
        <pointLight color={color} intensity={4} distance={80} decay={2} />
      </mesh>
      <CometTail position={pos} velocity={velRef.current} />
    </>
  )
}
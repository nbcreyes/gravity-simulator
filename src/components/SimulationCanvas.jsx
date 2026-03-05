import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Line, Points, PointMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { useSimulation } from '../store/simulation.js'
import { stepSimulation, bodyRadius, bodyColor } from '../physics/engine.js'
import CollisionFlashes from './CollisionFlash.jsx'
import { bodyRadius, bodyColor } from '../physics/engine.js'

// ─── Starfield ────────────────────────────────────────────────────────────────
function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 4000
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4000
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4000
    }
    return arr
  }, [])

  return (
    <Points positions={positions} frustumCulled={false}>
      <PointMaterial size={0.6} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </Points>
  )
}

// ─── Single Body ──────────────────────────────────────────────────────────────
function Body({ body, isSelected, onSelect }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const radius = bodyRadius(body.mass)

  useFrame(({ clock }) => {
    if (ringRef.current && isSelected) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.08
      ringRef.current.scale.setScalar(s)
    }
  })

  const color = body.color || bodyColor(body.mass)

  return (
    <group position={[body.position.x, body.position.y, body.position.z]}>
      {/* Glow atmosphere */}
      <mesh>
        <sphereGeometry args={[radius * 1.6, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main sphere */}
      <mesh ref={meshRef} onPointerDown={(e) => { e.stopPropagation(); onSelect(body.id) }}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Point light */}
      <pointLight
        color={color}
        intensity={Math.min(body.mass * 0.05, 8)}
        distance={radius * 30}
        decay={2}
      />

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.8, radius * 2.0, 64]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

// ─── Trail ────────────────────────────────────────────────────────────────────
function Trail({ body }) {
  const trail = body.trail || []
  if (trail.length < 2) return null

  const color = body.color || bodyColor(body.mass)
  const points = trail.map(p => [p.x, p.y, p.z])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.5}
      vertexColors={false}
    />
  )
}

// ─── Physics Loop ─────────────────────────────────────────────────────────────
function PhysicsLoop() {
  const { bodies, paused, G, dt, updateBodies, addCollisionFlash } = useSimulation()
  const bodiesRef = useRef(bodies)
  const pausedRef = useRef(paused)
  const GRef = useRef(G)

  useEffect(() => { bodiesRef.current = bodies }, [bodies])
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { GRef.current = G }, [G])

  useFrame(() => {
    if (pausedRef.current || bodiesRef.current.length === 0) return

    const result = stepSimulation(bodiesRef.current, GRef.current, dt)
    bodiesRef.current = result.bodies
    updateBodies(result.bodies)

    for (const collision of result.collisions) {
      addCollisionFlash(collision)
    }
  })

  return null
}

// ─── Placement Ghost ──────────────────────────────────────────────────────────
function PlacementGhost({ pendingMass }) {
  const { camera } = useThree()
  const [ghostPos, setGhostPos] = useState(new THREE.Vector3(0, 0, 0))
  const [phase, setPhase] = useState('positioning')
  const [startPos, setStartPos] = useState(null)
  const [dragEnd, setDragEnd] = useState(null)
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const raycaster = useRef(new THREE.Raycaster())
  const addBody = useSimulation(s => s.addBody)
  const setMode = useSimulation(s => s.setPlacementMode)

  function getWorldPos(e) {
    const ndc = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    )
    raycaster.current.setFromCamera(ndc, camera)
    const target = new THREE.Vector3()
    raycaster.current.ray.intersectPlane(plane.current, target)
    return target
  }

  useEffect(() => {
    const onMove = (e) => {
      const p = getWorldPos(e)
      if (phase === 'positioning') setGhostPos(p)
      else if (phase === 'velocity') setDragEnd(p.clone())
    }

    const onClick = (e) => {
      if (phase === 'positioning') {
        const p = getWorldPos(e)
        setStartPos(p.clone())
        setGhostPos(p.clone())
        setPhase('velocity')
      }
    }

    const onUp = (e) => {
      if (phase === 'velocity' && startPos) {
        const end = getWorldPos(e)
        const vel = new THREE.Vector3(
          (end.x - startPos.x) * 0.05,
          (end.y - startPos.y) * 0.05,
          0
        )
        addBody({
          id: `body-${Date.now()}`,
          name: 'Body',
          mass: pendingMass,
          position: startPos.clone(),
          velocity: vel,
          acceleration: new THREE.Vector3(0, 0, 0),
          trail: [],
          color: bodyColor(pendingMass)
        })
        setMode('idle')
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      window.removeEventListener('mouseup', onUp)
    }
  }, [phase, startPos, pendingMass, addBody, setMode, camera])

  const radius = bodyRadius(pendingMass)
  const color = bodyColor(pendingMass)
  const pos = phase === 'velocity' && startPos ? startPos : ghostPos

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={phase === 'positioning' ? 0.5 : 0.9}
          wireframe={phase === 'positioning'}
        />
      </mesh>
      {phase === 'velocity' && dragEnd && (
        <Line
          points={[[0,0,0], [dragEnd.x - pos.x, dragEnd.y - pos.y, 0]]}
          color="#00e5ff"
          lineWidth={2.5}
        />
      )}
    </group>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ pendingMass }) {
  const bodies = useSimulation(s => s.bodies)
  const selectedBodyId = useSimulation(s => s.selectedBodyId)
  const placementMode = useSimulation(s => s.placementMode)
  const selectBody = useSimulation(s => s.selectBody)

  return (
    <>
      <ambientLight intensity={0.1} />
      <Starfield />

      <PhysicsLoop />
      <CollisionFlashes />

      {bodies.map(body => (
        <Trail key={`trail-${body.id}`} body={body} />
      ))}

      {bodies.map(body => (
        <Body
          key={body.id}
          body={body}
          isSelected={body.id === selectedBodyId}
          onSelect={selectBody}
        />
      ))}

      {placementMode === 'placing' && (
        <PlacementGhost pendingMass={pendingMass} />
      )}
    </>
  )
}

// ─── Main Canvas Export ───────────────────────────────────────────────────────
export default function SimulationCanvas({ pendingMass }) {
  const placementMode = useSimulation(s => s.placementMode)

  return (
    <div
      className="absolute inset-0"
      style={{ cursor: placementMode === 'placing' ? 'crosshair' : 'default' }}
    >
      <Canvas
        camera={{ fov: 60, position: [0, 0, 300], near: 0.1, far: 10000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: '#02020f' }}
      >
        <Scene pendingMass={pendingMass} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          panSpeed={0.8}
          enabled={placementMode === 'idle'}
        />
        <EffectComposer>
          <Bloom threshold={0.2} strength={1.5} radius={0.8} luminanceThreshold={0.2} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
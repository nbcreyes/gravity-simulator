import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Points, PointMaterial, Text, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulation } from '../store/simulation.js'
import { stepSimulation, bodyRadius, bodyColor } from '../physics/engine.js'
import CollisionFlashes from './CollisionFlash.jsx'
import Nebula from './Nebula.jsx'
import ContextMenu from './ContextMenu.jsx'

// ── Starfield ─────────────────────────────────────────────────────────────────
function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(3000 * 3)
    for (let i = 0; i < 3000; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 8000
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8000
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8000
    }
    return arr
  }, [])

  return (
    <Points positions={positions} frustumCulled={false}>
      <PointMaterial
        size={0.9}
        color="#ffffff"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </Points>
  )
}

// ── Saturn Rings ──────────────────────────────────────────────────────────────
function SaturnRings({ radius }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256; canvas.height = 1
    const ctx  = canvas.getContext('2d')
    const grad = ctx.createLinearGradient(0, 0, 256, 0)
    grad.addColorStop(0,    'rgba(0,0,0,0)')
    grad.addColorStop(0.15, 'rgba(200,180,140,0.6)')
    grad.addColorStop(0.3,  'rgba(180,160,120,0.3)')
    grad.addColorStop(0.5,  'rgba(210,190,150,0.7)')
    grad.addColorStop(0.7,  'rgba(190,170,130,0.4)')
    grad.addColorStop(0.85, 'rgba(200,180,140,0.5)')
    grad.addColorStop(1,    'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 1)
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0.3]}>
      <ringGeometry args={[radius * 1.4, radius * 2.6, 128]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.75}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ── Planet Texture ────────────────────────────────────────────────────────────
function usePlanetTexture(name, color) {
  return useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = color
    ctx.fillRect(0, 0, size, size)

    if (name === 'Jupiter' || name === 'Saturn') {
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i % 2 === 0
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0.1)'
        ctx.fillRect(0, (i / 12) * size, size, size / 12)
      }
    } else if (name === 'Earth') {
      ctx.fillStyle = 'rgba(34,139,34,0.5)'
      ctx.beginPath(); ctx.ellipse(80,  100, 30, 50, 0.4,  0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(160, 80,  40, 35, -0.3, 0, Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(200, 150, 25, 40, 0.8,  0, Math.PI*2); ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.fillRect(0, 0, size, 20)
      ctx.fillRect(0, size - 20, size, 20)
    } else if (name === 'Mars') {
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth   = 2
        ctx.beginPath()
        ctx.arc(
          Math.random() * size,
          Math.random() * size,
          5 + Math.random() * 15,
          0, Math.PI * 2
        )
        ctx.stroke()
      }
    } else {
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`
        ctx.beginPath()
        ctx.arc(
          Math.random() * size,
          Math.random() * size,
          Math.random() * 8,
          0, Math.PI * 2
        )
        ctx.fill()
      }
    }

    return new THREE.CanvasTexture(canvas)
  }, [name, color])
}

// ── Trail ─────────────────────────────────────────────────────────────────────
function Trail({ body }) {
  const trail = body.trail || []
  if (trail.length < 2) return null

  const color = body.color || bodyColor(body.mass)

  const obj = useMemo(() => {
    const points   = trail.map(p => new THREE.Vector3(p.x, p.y, p.z))
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.45
    })
    return new THREE.Line(geometry, material)
  }, [trail, color])

  return <primitive object={obj} />
}

// ── Velocity Arrow ────────────────────────────────────────────────────────────
function VelocityArrow({ start, end }) {
  const obj = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(end.x - start.x, end.y - start.y, 0)
    ]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color('#00e5ff'),
      transparent: true,
      opacity: 0.9
    })
    return new THREE.Line(geometry, material)
  }, [start, end])

  return <primitive object={obj} />
}

// ── Single Body ───────────────────────────────────────────────────────────────
function Body({ body, isSelected, onSelect, onContextMenu }) {
  const meshRef  = useRef()
  const ringRef  = useRef()
  const radius   = bodyRadius(body.mass)
  const color    = body.color || bodyColor(body.mass)
  const isStar   = body.mass > 5000
  const isSaturn = body.name === 'Saturn'
  const texture  = usePlanetTexture(body.name, color)

  useFrame(({ clock }) => {
    if (meshRef.current)
      meshRef.current.rotation.y = clock.elapsedTime * (isStar ? 0.05 : 0.2)
    if (ringRef.current && isSelected)
      ringRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3) * 0.08)
  })

  return (
    <group position={[body.position.x, body.position.y, body.position.z]}>
      {/* Atmosphere */}
      <mesh>
        <sphereGeometry args={[radius * 1.9, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isStar ? 0.6 : 0.25}
          transparent
          opacity={isStar ? 0.4 : 0.18}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Main body */}
      <mesh
        ref={meshRef}
        onPointerDown={e => { e.stopPropagation(); onSelect(body.id) }}
        onContextMenu={e => {
          e.stopPropagation()
          if (onContextMenu) {
            onContextMenu(body, e.nativeEvent.clientX, e.nativeEvent.clientY)
          }
        }}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          map={isStar ? null : texture}
          color={isStar ? color : '#ffffff'}
          emissive={color}
          emissiveIntensity={isStar ? 5.0 : 1.2}
          roughness={isStar ? 0.8 : 0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Star corona */}
      {isStar && (
        <Sparkles
          count={40}
          scale={radius * 4}
          size={3}
          speed={0.3}
          color={color}
          opacity={0.6}
        />
      )}

      {/* Saturn rings */}
      {isSaturn && <SaturnRings radius={radius} />}

      {/* Light */}
      <pointLight
        color={color}
        intensity={isStar
          ? Math.min(body.mass * 0.002, 12)
          : Math.min(body.mass * 0.001, 3)}
        distance={radius * (isStar ? 80 : 30)}
        decay={2}
      />

      {/* Label */}
      <Text
        position={[0, radius + 6, 0]}
        fontSize={4}
        color={color}
        anchorX="center"
        anchorY="bottom"
        renderOrder={999}
        material-depthTest={false}
      >
        {body.name}
      </Text>

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.9, radius * 2.1, 64]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

// ── Camera Controller ─────────────────────────────────────────────────────────
function CameraController() {
  const { camera }    = useThree()
  const bodies        = useSimulation(s => s.bodies)
  const lockedBodyId  = useSimulation(s => s.lockedBodyId)
  const cameraMode    = useSimulation(s => s.cameraMode)
  const setCameraMode = useSimulation(s => s.setCameraMode)

  const isAnimating   = useRef(false)
  const animTarget    = useRef(new THREE.Vector3())
  const animLookAt    = useRef(new THREE.Vector3())
  const animProgress  = useRef(0)

  useEffect(() => {
    if (cameraMode !== 'zoomfit' || bodies.length === 0) return
    const positions = bodies.map(b => b.position)
    const center    = positions.reduce(
      (acc, p) => acc.add(new THREE.Vector3(p.x, p.y, p.z)),
      new THREE.Vector3()
    ).divideScalar(positions.length)
    const maxDist = Math.max(...positions.map(p =>
      new THREE.Vector3(p.x, p.y, p.z).distanceTo(center)
    ))
    animTarget.current.set(center.x, center.y, center.z + Math.max(maxDist * 2.5, 200))
    animLookAt.current.copy(center)
    animProgress.current = 0
    isAnimating.current  = true
    setCameraMode('free')
  }, [cameraMode, bodies])

  useEffect(() => {
    if (cameraMode !== 'topdown') return
    animTarget.current.set(0, 600, 0)
    animLookAt.current.set(0, 0, 0)
    animProgress.current = 0
    isAnimating.current  = true
    setCameraMode('free')
  }, [cameraMode])

  useEffect(() => {
    if (cameraMode !== 'side') return
    animTarget.current.set(600, 0, 0)
    animLookAt.current.set(0, 0, 0)
    animProgress.current = 0
    isAnimating.current  = true
    setCameraMode('free')
  }, [cameraMode])

  useFrame((_, delta) => {
    if (isAnimating.current) {
      animProgress.current = Math.min(animProgress.current + delta * 2, 1)
      const t = 1 - Math.pow(1 - animProgress.current, 3)
      camera.position.lerp(animTarget.current, t * 0.1)
      camera.lookAt(animLookAt.current)
      if (animProgress.current >= 1) isAnimating.current = false
      return
    }

    if (lockedBodyId) {
      const body = bodies.find(b => b.id === lockedBodyId)
      if (body) {
        const r      = bodyRadius(body.mass)
        const target = new THREE.Vector3(
          body.position.x,
          body.position.y + r * 3,
          body.position.z + r * 10
        )
        camera.position.lerp(target, 0.05)
        camera.lookAt(body.position.x, body.position.y, body.position.z)
      }
    }
  })

  return null
}

// ── Keyboard Shortcuts ────────────────────────────────────────────────────────
function KeyboardShortcuts({ onToggleShortcuts }) {
  const togglePause     = useSimulation(s => s.togglePause)
  const clearAll        = useSimulation(s => s.clearAll)
  const loadPreset      = useSimulation(s => s.loadPreset)
  const setCameraMode   = useSimulation(s => s.setCameraMode)
  const setLockedBodyId = useSimulation(s => s.setLockedBodyId)

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePause()
          break
        case 'KeyC':
          clearAll()
          break
        case 'KeyR':
          setCameraMode('zoomfit')
          break
        case 'KeyT':
          setCameraMode('topdown')
          break
        case 'KeyS':
          setCameraMode('side')
          break
        case 'Escape':
          setLockedBodyId(null)
          break
        case 'Digit1':
          loadPreset('Binary Star')
          break
        case 'Digit2':
          loadPreset('Solar System')
          break
        case 'Digit3':
          loadPreset('Figure-8')
          break
        case 'Digit4':
          loadPreset('Chaos')
          break
        case 'Slash':
          if (e.shiftKey) onToggleShortcuts()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onToggleShortcuts])

  return null
}

// ── Physics Loop ──────────────────────────────────────────────────────────────
function PhysicsLoop() {
  const {
    bodies, paused, G, dt, timeScale,
    updateBodies, addCollisionFlash, incrementTime
  } = useSimulation()

  const refs = useRef({ bodies, paused, G, timeScale })

  useEffect(() => { refs.current.bodies    = bodies    }, [bodies])
  useEffect(() => { refs.current.paused    = paused    }, [paused])
  useEffect(() => { refs.current.G         = G         }, [G])
  useEffect(() => { refs.current.timeScale = timeScale }, [timeScale])

  useFrame(() => {
    const { bodies, paused, G, timeScale } = refs.current
    if (paused || bodies.length === 0) return

    const steps    = Math.max(1, Math.round(timeScale))
    const scaledDt = dt * timeScale / steps

    let current = bodies
    for (let i = 0; i < steps; i++) {
      const result = stepSimulation(current, G, scaledDt)
      current = result.bodies
      result.collisions.forEach(c => addCollisionFlash(c))
    }

    refs.current.bodies = current
    updateBodies(current)
    incrementTime(dt * timeScale)
  })

  return null
}

// ── Placement Ghost ───────────────────────────────────────────────────────────
function PlacementGhost({ pendingMass }) {
  const { camera }  = useThree()
  const [ghostPos, setGhostPos] = useState(new THREE.Vector3())
  const [phase,    setPhase]    = useState('positioning')
  const [startPos, setStartPos] = useState(null)
  const [dragEnd,  setDragEnd]  = useState(null)

  const plane     = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const raycaster = useRef(new THREE.Raycaster())
  const addBody   = useSimulation(s => s.addBody)
  const setMode   = useSimulation(s => s.setPlacementMode)

  const getWorldPos = (e) => {
    try {
      const ndc = new THREE.Vector2(
        (e.clientX / window.innerWidth)  *  2 - 1,
        (e.clientY / window.innerHeight) * -2 + 1
      )
      raycaster.current.setFromCamera(ndc, camera)
      const target = new THREE.Vector3()
      const hit    = raycaster.current.ray.intersectPlane(plane.current, target)
      return hit ? target : null
    } catch { return null }
  }

  useEffect(() => {
    const onMove = (e) => {
      const p = getWorldPos(e)
      if (!p) return
      if (phase === 'positioning') setGhostPos(p.clone())
      else                         setDragEnd(p.clone())
    }

    const onDown = (e) => {
      if (e.button !== 0) return
      if (phase === 'positioning') {
        const p = getWorldPos(e)
        if (!p) return
        setStartPos(p.clone())
        setGhostPos(p.clone())
        setPhase('velocity')
      }
    }

    const onUp = (e) => {
      if (e.button !== 0) return
      if (phase === 'velocity' && startPos) {
        const end = getWorldPos(e)
        if (!end) return
        addBody({
          id: `body-${Date.now()}`,
          name: 'Body',
          mass: pendingMass,
          position: startPos.clone(),
          velocity: new THREE.Vector3(
            (end.x - startPos.x) * 0.05,
            (end.y - startPos.y) * 0.05,
            0
          ),
          acceleration: new THREE.Vector3(0, 0, 0),
          trail: [],
          color: bodyColor(pendingMass)
        })
        setMode('idle')
      }
    }

    window.addEventListener('mousemove',   onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup',   onUp)
    return () => {
      window.removeEventListener('mousemove',   onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup',   onUp)
    }
  }, [phase, startPos, pendingMass, camera])

  const radius = bodyRadius(pendingMass)
  const color  = bodyColor(pendingMass)
  const pos    = phase === 'velocity' && startPos ? startPos : ghostPos

  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={phase === 'positioning' ? 0.4 : 0.85}
          wireframe={phase === 'positioning'}
        />
      </mesh>
      {phase === 'velocity' && dragEnd && (
        <VelocityArrow start={pos} end={dragEnd} />
      )}
    </group>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ pendingMass, onToggleShortcuts, onContextMenu }) {
  const bodies         = useSimulation(s => s.bodies)
  const selectedBodyId = useSimulation(s => s.selectedBodyId)
  const placementMode  = useSimulation(s => s.placementMode)
  const selectBody     = useSimulation(s => s.selectBody)

  return (
    <>
      <ambientLight intensity={0.04} />
      <Nebula />
      <Starfield />
      <PhysicsLoop />
      <CameraController />
      <KeyboardShortcuts onToggleShortcuts={onToggleShortcuts} />
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
          onContextMenu={onContextMenu}
        />
      ))}

      {placementMode === 'placing' && (
        <PlacementGhost pendingMass={pendingMass} />
      )}
    </>
  )
}

// ── Canvas Export ─────────────────────────────────────────────────────────────
export default function SimulationCanvas({ pendingMass, onToggleShortcuts }) {
  const placementMode = useSimulation(s => s.placementMode)
  const [contextMenu, setContextMenu] = useState(null)

  return (
    <div
      className="absolute inset-0"
      style={{ cursor: placementMode === 'placing' ? 'crosshair' : 'default' }}
      onContextMenu={e => e.preventDefault()}
    >
      <Canvas
        camera={{ fov: 60, position: [0, 0, 600], near: 0.1, far: 20000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{ background: '#02020f' }}
        onContextMenu={e => e.preventDefault()}
      >
        <Scene
          pendingMass={pendingMass}
          onToggleShortcuts={onToggleShortcuts}
          onContextMenu={(body, x, y) => setContextMenu({
            bodyId:    body.id,
            bodyName:  body.name,
            bodyColor: body.color,
            x,
            y
          })}
        />
        <OrbitControls
          makeDefault
          enablePan
          enableZoom
          enableRotate
          zoomSpeed={0.8}
          rotateSpeed={0.5}
          panSpeed={0.8}
          enabled={placementMode === 'idle'}
        />
      </Canvas>

      <ContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
      />
    </div>
  )
}
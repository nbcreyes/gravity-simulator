import * as THREE from 'three'
import { generateId, bodyColor } from './engine.js'

const G = 1.0

function makeBody(overrides) {
  return {
    id: generateId(),
    mass: 1,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    acceleration: new THREE.Vector3(0, 0, 0),
    trail: [],
    name: 'Body',
    color: '#ffd54f',
    ...overrides
  }
}

export function loadPreset(name) {
  switch (name) {
    case 'Binary Star': return binaryStarPreset()
    case 'Solar System': return solarSystemPreset()
    case 'Figure-8':    return figureEightPreset()
    case 'Chaos':       return chaosPreset()
    default: return []
  }
}

function solarSystemPreset() {
  const starMass = 10000

  const planets = [
    { name: 'Mercury', mass: 0.5,  r: 60,  color: '#90a4ae' },
    { name: 'Venus',   mass: 1.2,  r: 100, color: '#ffcc80' },
    { name: 'Earth',   mass: 1.5,  r: 145, color: '#4fc3f7' },
    { name: 'Mars',    mass: 0.8,  r: 200, color: '#ff7043' },
    { name: 'Jupiter', mass: 12.0, r: 340, color: '#ffd54f' },
    { name: 'Saturn',  mass: 8.0,  r: 480, color: '#ffe0b2' },
  ]

  const bodies = [
    makeBody({
      id: generateId(),
      name: 'Sol',
      mass: starMass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      color: '#fff7c0'
    })
  ]

  for (const p of planets) {
    const v = Math.sqrt(G * starMass / p.r)
    bodies.push(makeBody({
      id: generateId(),
      name: p.name,
      mass: p.mass,
      position: new THREE.Vector3(p.r, 0, 0),
      velocity: new THREE.Vector3(0, v, 0),
      color: p.color
    }))
  }

  return bodies
}

function binaryStarPreset() {
  const m1 = 6000
  const m2 = 4000
  const M  = m1 + m2
  const a  = 200

  const r1 = a * m2 / M
  const r2 = a * m1 / M

  const v_rel = Math.sqrt(G * M / a)
  const v1 = v_rel * m2 / M
  const v2 = v_rel * m1 / M

  return [
    makeBody({
      id: generateId(),
      name: 'Alpha',
      mass: m1,
      position: new THREE.Vector3(-r1, 0, 0),
      velocity: new THREE.Vector3(0, v1, 0),
      color: '#fff7c0'
    }),
    makeBody({
      id: generateId(),
      name: 'Beta',
      mass: m2,
      position: new THREE.Vector3(r2, 0, 0),
      velocity: new THREE.Vector3(0, -v2, 0),
      color: '#ffccaa'
    })
  ]
}

function figureEightPreset() {
  const scale = 120
  const mass  = 1000

  const x1 =  0.97000436 * scale
  const y1 = -0.24308753 * scale
  const x2 =  0
  const y2 =  0
  const x3 = -x1
  const y3 = -y1

  const vNorm = Math.sqrt(G * mass / scale)
  const vx3 =  0.93240737 * vNorm
  const vy3 =  0.86473146 * vNorm
  const vx1 = -vx3 / 2
  const vy1 = -vy3 / 2

  return [
    makeBody({
      id: generateId(),
      name: 'P1',
      mass,
      position: new THREE.Vector3(x1, y1, 0),
      velocity: new THREE.Vector3(vx1, vy1, 0),
      color: '#4fc3f7'
    }),
    makeBody({
      id: generateId(),
      name: 'P2',
      mass,
      position: new THREE.Vector3(x2, y2, 0),
      velocity: new THREE.Vector3(vx3, vy3, 0),
      color: '#ffd54f'
    }),
    makeBody({
      id: generateId(),
      name: 'P3',
      mass,
      position: new THREE.Vector3(x3, y3, 0),
      velocity: new THREE.Vector3(vx1, vy1, 0),
      color: '#ff7043'
    })
  ]
}

function chaosPreset() {
  const names = ['Krait', 'Venom', 'Hydra', 'Orca', 'Mako', 'Titan', 'Nexus', 'Void']
  return Array.from({ length: 8 }, (_, i) => {
    const mass = 200 + Math.random() * 800
    return makeBody({
      id: generateId(),
      name: names[i],
      mass,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 100
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      color: bodyColor(mass)
    })
  })
}
import * as THREE from 'three'
import { generateId, bodyColor } from './engine.js'

const G = 6.674

function makeBody(overrides) {
  return {
    id: generateId(),
    mass: 100,
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
    case 'Figure-8': return figureEightPreset()
    case 'Chaos': return chaosPreset()
    default: return []
  }
}

function binaryStarPreset() {
  const M = 500
  const r = 80
  // v = sqrt(G * M / (4*r)) for circular orbit of two equal masses
  const v = Math.sqrt(G * M / (4 * r))

  return [
    makeBody({
      id: generateId(),
      name: 'Alpha',
      mass: M,
      position: new THREE.Vector3(-r, 0, 0),
      velocity: new THREE.Vector3(0, v, 0),
      color: '#ffffff'
    }),
    makeBody({
      id: generateId(),
      name: 'Beta',
      mass: M,
      position: new THREE.Vector3(r, 0, 0),
      velocity: new THREE.Vector3(0, -v, 0),
      color: '#ffffff'
    })
  ]
}

function solarSystemPreset() {
  const starMass = 1000
  const bodies = [
    makeBody({
      id: generateId(),
      name: 'Sol',
      mass: starMass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      color: '#ffffff'
    })
  ]

  const planets = [
    { name: 'Mercury', mass: 2,  r: 40,  color: '#90a4ae' },
    { name: 'Venus',   mass: 8,  r: 65,  color: '#ffcc80' },
    { name: 'Earth',   mass: 10, r: 95,  color: '#4fc3f7' },
    { name: 'Mars',    mass: 5,  r: 130, color: '#ff7043' },
    { name: 'Jupiter', mass: 80, r: 190, color: '#ffd54f' },
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

function figureEightPreset() {
  // Chenciner-Montgomery exact initial conditions (scaled)
  const scale = 50
  const vScale = 1.8

  // Exact positions (from Chenciner-Montgomery 2000)
  const x1 = 0.97000436 * scale
  const y1 = -0.24308753 * scale
  const x3 = -x1
  const y3 = -y1
  const x2 = 0
  const y2 = 0

  // Exact velocities
  const vx3 = 0.93240737 * vScale
  const vy3 = 0.86473146 * vScale
  const vx1 = -vx3 / 2
  const vy1 = -vy3 / 2
  const vx2 = vx1
  const vy2 = vy1

  const mass = 100

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
      velocity: new THREE.Vector3(vx2, vy2, 0),
      color: '#ff7043'
    })
  ]
}

function chaosPreset() {
  const bodies = []
  const names = ['Krait', 'Venom', 'Hydra', 'Orca', 'Mako', 'Titan', 'Nexus', 'Void']
  for (let i = 0; i < 8; i++) {
    const mass = 20 + Math.random() * 180
    bodies.push(makeBody({
      id: generateId(),
      name: names[i],
      mass,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 50
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      color: bodyColor(mass)
    }))
  }
  return bodies
}
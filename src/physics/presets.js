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
    case 'Binary Star':      return binaryStarPreset()
    case 'Solar System':     return solarSystemPreset()
    case 'Figure-8':         return figureEightPreset()
    case 'Chaos':            return chaosPreset()
    case 'Trojan Asteroids': return trojanAsteroidsPreset()
    case 'Galaxy Collision': return galaxyCollisionPreset()
    case 'Pulsar System':    return pulsarSystemPreset()
    case 'Rogue Planet':     return roguePlanetPreset()
    default: return []
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function orbitalVelocity(M, r) {
  return Math.sqrt(G * M / r)
}

function planetBody(name, mass, r, color, starMass, angleOffset = 0) {
  const v   = orbitalVelocity(starMass, r)
  const ang = angleOffset
  return makeBody({
    id:       generateId(),
    name,
    mass,
    position: new THREE.Vector3(
      r * Math.cos(ang),
      r * Math.sin(ang),
      0
    ),
    velocity: new THREE.Vector3(
      -v * Math.sin(ang),
       v * Math.cos(ang),
      0
    ),
    color
  })
}

// ── Solar System (all 8 planets + Pluto) ─────────────────────────────────────
function solarSystemPreset() {
  const starMass = 10000

  // Real relative distances scaled to screen units
  // Mercury=0.387AU, Earth=1AU → Earth at r=145 → scale=145
  // All radii = real_AU * 145
  const planets = [
    { name: 'Mercury', mass: 0.5,   r: 56,   color: '#90a4ae' },
    { name: 'Venus',   mass: 1.2,   r: 105,  color: '#ffcc80' },
    { name: 'Earth',   mass: 1.5,   r: 145,  color: '#4fc3f7' },
    { name: 'Mars',    mass: 0.8,   r: 220,  color: '#ff7043' },
    { name: 'Jupiter', mass: 12.0,  r: 755,  color: '#ffd54f' },
    { name: 'Saturn',  mass: 8.0,   r: 1380, color: '#ffe0b2' },
    { name: 'Uranus',  mass: 3.0,   r: 2770, color: '#80deea' },
    { name: 'Neptune', mass: 2.9,   r: 4340, color: '#5c6bc0' },
    { name: 'Pluto',   mass: 0.05,  r: 5700, color: '#bcaaa4' },
  ]

  const bodies = [
    makeBody({
      id:       generateId(),
      name:     'Sol',
      mass:     starMass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      color:    '#fff7c0'
    })
  ]

  // Spread planets at slightly different angles so they don't start in a line
  const angles = [0, 0.8, 1.7, 2.5, 3.4, 4.2, 5.1, 5.9, 1.2]

  planets.forEach((p, i) => {
    bodies.push(planetBody(p.name, p.mass, p.r, p.color, starMass, angles[i]))
  })

  return bodies
}

// ── Binary Star ───────────────────────────────────────────────────────────────
function binaryStarPreset() {
  const m1    = 6000
  const m2    = 4000
  const M     = m1 + m2
  const a     = 200
  const r1    = a * m2 / M
  const r2    = a * m1 / M
  const v_rel = Math.sqrt(G * M / a)
  const v1    = v_rel * m2 / M
  const v2    = v_rel * m1 / M

  return [
    makeBody({
      id:       generateId(),
      name:     'Alpha',
      mass:     m1,
      position: new THREE.Vector3(-r1, 0, 0),
      velocity: new THREE.Vector3(0, v1, 0),
      color:    '#fff7c0'
    }),
    makeBody({
      id:       generateId(),
      name:     'Beta',
      mass:     m2,
      position: new THREE.Vector3(r2, 0, 0),
      velocity: new THREE.Vector3(0, -v2, 0),
      color:    '#ffccaa'
    })
  ]
}

// ── Figure-8 ──────────────────────────────────────────────────────────────────
function figureEightPreset() {
  const scale = 120
  const mass  = 1000
  const vNorm = Math.sqrt(G * mass / scale)

  const x1  =  0.97000436 * scale
  const y1  = -0.24308753 * scale
  const vx3 =  0.93240737 * vNorm
  const vy3 =  0.86473146 * vNorm
  const vx1 = -vx3 / 2
  const vy1 = -vy3 / 2

  return [
    makeBody({
      id:       generateId(),
      name:     'P1',
      mass,
      position: new THREE.Vector3(x1, y1, 0),
      velocity: new THREE.Vector3(vx1, vy1, 0),
      color:    '#4fc3f7'
    }),
    makeBody({
      id:       generateId(),
      name:     'P2',
      mass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(vx3, vy3, 0),
      color:    '#ffd54f'
    }),
    makeBody({
      id:       generateId(),
      name:     'P3',
      mass,
      position: new THREE.Vector3(-x1, -y1, 0),
      velocity: new THREE.Vector3(vx1, vy1, 0),
      color:    '#ff7043'
    })
  ]
}

// ── Chaos ─────────────────────────────────────────────────────────────────────
function chaosPreset() {
  const names = ['Krait', 'Venom', 'Hydra', 'Orca', 'Mako', 'Titan', 'Nexus', 'Void']
  return Array.from({ length: 8 }, (_, i) => {
    const mass = 200 + Math.random() * 800
    return makeBody({
      id:       generateId(),
      name:     names[i],
      mass,
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 500,
        (Math.random() - 0.5) * 100
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      color:    bodyColor(mass)
    })
  })
}

// ── Trojan Asteroids ──────────────────────────────────────────────────────────
function trojanAsteroidsPreset() {
  const starMass     = 10000
  const jupiterMass  = 12.0
  const jupiterR     = 340
  const jupiterAngle = 0
  const jupiterV     = orbitalVelocity(starMass, jupiterR)

  const bodies = [
    makeBody({
      id:       generateId(),
      name:     'Sol',
      mass:     starMass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      color:    '#fff7c0'
    }),
    makeBody({
      id:       generateId(),
      name:     'Jupiter',
      mass:     jupiterMass,
      position: new THREE.Vector3(jupiterR, 0, 0),
      velocity: new THREE.Vector3(0, jupiterV, 0),
      color:    '#ffd54f'
    })
  ]

  // L4 is 60° ahead of Jupiter, L5 is 60° behind
  const trojanNames = [
    'Achilles','Patroclus','Hector','Odysseus','Ajax',
    'Diomedes','Antilochus','Nestor','Agamemnon','Menelaus',
    'Thetis','Briseis','Andromache','Hecuba','Priam'
  ]

  let nameIdx = 0

  for (let cluster = 0; cluster < 2; cluster++) {
    const clusterAngle = cluster === 0
      ? jupiterAngle + Math.PI / 3   // L4 — 60° ahead
      : jupiterAngle - Math.PI / 3   // L5 — 60° behind

    for (let i = 0; i < 7; i++) {
      // Spread asteroids around the Lagrange point
      const spread    = 0.12
      const angle     = clusterAngle + (Math.random() - 0.5) * spread
      const radiusVar = jupiterR + (Math.random() - 0.5) * jupiterR * 0.08
      const v         = orbitalVelocity(starMass, radiusVar)
      const mass      = 0.05 + Math.random() * 0.3

      bodies.push(makeBody({
        id:       generateId(),
        name:     trojanNames[nameIdx++ % trojanNames.length],
        mass,
        position: new THREE.Vector3(
          radiusVar * Math.cos(angle),
          radiusVar * Math.sin(angle),
          (Math.random() - 0.5) * 10
        ),
        velocity: new THREE.Vector3(
          -v * Math.sin(angle),
           v * Math.cos(angle),
          0
        ),
        color: '#90a4ae'
      }))
    }
  }

  return bodies
}

// ── Galaxy Collision ──────────────────────────────────────────────────────────
function galaxyCollisionPreset() {
  const bodies     = []
  const core1Mass  = 8000
  const core2Mass  = 6000
  const separation = 600

  // Galaxy 1 — moving right, centered left
  const c1x = -separation / 2
  const c1y = 0
  const c1vx = 1.5
  const c1vy = 0

  bodies.push(makeBody({
    id:       generateId(),
    name:     'Core-A',
    mass:     core1Mass,
    position: new THREE.Vector3(c1x, c1y, 0),
    velocity: new THREE.Vector3(c1vx, c1vy, 0),
    color:    '#fff7c0'
  }))

  // Stars orbiting Core 1
  const stars1 = [
    { r: 60,  n: 6,  color: '#4fc3f7' },
    { r: 110, n: 9,  color: '#81c784' },
    { r: 170, n: 12, color: '#ffd54f' },
    { r: 230, n: 8,  color: '#ff7043' },
  ]

  stars1.forEach(ring => {
    for (let i = 0; i < ring.n; i++) {
      const angle = (i / ring.n) * Math.PI * 2 + Math.random() * 0.3
      const v     = orbitalVelocity(core1Mass, ring.r)
      const mass  = 1 + Math.random() * 5
      bodies.push(makeBody({
        id:       generateId(),
        name:     `A-${bodies.length}`,
        mass,
        position: new THREE.Vector3(
          c1x + ring.r * Math.cos(angle),
          c1y + ring.r * Math.sin(angle),
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          c1vx - v * Math.sin(angle),
          c1vy + v * Math.cos(angle),
          0
        ),
        color: ring.color
      }))
    }
  })

  // Galaxy 2 — moving left, centered right
  const c2x  = separation / 2
  const c2y  = 80
  const c2vx = -1.5
  const c2vy = 0

  bodies.push(makeBody({
    id:       generateId(),
    name:     'Core-B',
    mass:     core2Mass,
    position: new THREE.Vector3(c2x, c2y, 0),
    velocity: new THREE.Vector3(c2vx, c2vy, 0),
    color:    '#ffccaa'
  }))

  const stars2 = [
    { r: 55,  n: 5,  color: '#ce93d8' },
    { r: 100, n: 8,  color: '#f48fb1' },
    { r: 155, n: 10, color: '#ffcc80' },
    { r: 205, n: 7,  color: '#80cbc4' },
  ]

  stars2.forEach(ring => {
    for (let i = 0; i < ring.n; i++) {
      const angle = (i / ring.n) * Math.PI * 2 + Math.random() * 0.3
      const v     = orbitalVelocity(core2Mass, ring.r)
      const mass  = 1 + Math.random() * 4
      bodies.push(makeBody({
        id:       generateId(),
        name:     `B-${bodies.length}`,
        mass,
        position: new THREE.Vector3(
          c2x + ring.r * Math.cos(angle),
          c2y + ring.r * Math.sin(angle),
          (Math.random() - 0.5) * 20
        ),
        velocity: new THREE.Vector3(
          c2vx - v * Math.sin(angle),
          c2vy + v * Math.cos(angle),
          0
        ),
        color: ring.color
      }))
    }
  })

  return bodies
}

// ── Pulsar System ─────────────────────────────────────────────────────────────
function pulsarSystemPreset() {
  const pulsarMass = 15000
  const bodies = [
    makeBody({
      id:       generateId(),
      name:     'Pulsar',
      mass:     pulsarMass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      color:    '#e040fb'
    })
  ]

  // Tight fast-orbiting companions at varying inclinations
  const companions = [
    { name: 'PSR-b', mass: 50,  r: 40,  color: '#4fc3f7', inclination: 0 },
    { name: 'PSR-c', mass: 30,  r: 70,  color: '#00e5ff', inclination: 0.3 },
    { name: 'PSR-d', mass: 80,  r: 110, color: '#7c4dff', inclination: -0.2 },
    { name: 'PSR-e', mass: 20,  r: 160, color: '#e040fb', inclination: 0.5 },
    { name: 'PSR-f', mass: 120, r: 220, color: '#ffffff', inclination: 0.1 },
    { name: 'PSR-g', mass: 15,  r: 290, color: '#82b1ff', inclination: -0.4 },
  ]

  companions.forEach((c, i) => {
    const angle = (i / companions.length) * Math.PI * 2
    const v     = orbitalVelocity(pulsarMass, c.r)
    const cosI  = Math.cos(c.inclination)
    const sinI  = Math.sin(c.inclination)

    bodies.push(makeBody({
      id:       generateId(),
      name:     c.name,
      mass:     c.mass,
      position: new THREE.Vector3(
        c.r * Math.cos(angle),
        c.r * Math.sin(angle) * cosI,
        c.r * Math.sin(angle) * sinI
      ),
      velocity: new THREE.Vector3(
        -v * Math.sin(angle),
         v * Math.cos(angle) * cosI,
         v * Math.cos(angle) * sinI
      ),
      color: c.color
    }))
  })

  return bodies
}

// ── Rogue Planet ──────────────────────────────────────────────────────────────
function roguePlanetPreset() {
  const starMass = 10000

  // Start with a mini solar system
  const bodies = [
    makeBody({
      id:       generateId(),
      name:     'Sol',
      mass:     starMass,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      color:    '#fff7c0'
    })
  ]

  const planets = [
    { name: 'Aether',  mass: 2,  r: 80,  color: '#4fc3f7' },
    { name: 'Verdant', mass: 3,  r: 140, color: '#81c784' },
    { name: 'Rust',    mass: 1,  r: 200, color: '#ff7043' },
    { name: 'Gilded',  mass: 10, r: 300, color: '#ffd54f' },
  ]

  const angles = [0, 1.5, 3.0, 4.7]
  planets.forEach((p, i) => {
    bodies.push(planetBody(p.name, p.mass, p.r, p.color, starMass, angles[i]))
  })

  // Rogue planet enters from far left moving diagonally inward
  // Fast enough to be hyperbolic — will disrupt orbits
  const rogueMass = 800
  bodies.push(makeBody({
    id:       generateId(),
    name:     'Nemesis',
    mass:     rogueMass,
    position: new THREE.Vector3(-1200, 400, 0),
    velocity: new THREE.Vector3(6.5, -2.5, 0),
    color:    '#ff1744'
  }))

  return bodies
}
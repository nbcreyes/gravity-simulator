import * as THREE from 'three'

// ── Energy ────────────────────────────────────────────────────────────────────
export function computeKineticEnergy(bodies) {
  return bodies.reduce((sum, b) => {
    const v2 = b.velocity.x**2 + b.velocity.y**2 + b.velocity.z**2
    return sum + 0.5 * b.mass * v2
  }, 0)
}

export function computePotentialEnergy(bodies, G) {
  let pe = 0
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dx = bodies[j].position.x - bodies[i].position.x
      const dy = bodies[j].position.y - bodies[i].position.y
      const dz = bodies[j].position.z - bodies[i].position.z
      const r  = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.001
      pe -= G * bodies[i].mass * bodies[j].mass / r
    }
  }
  return pe
}

export function computeTotalEnergy(bodies, G) {
  return computeKineticEnergy(bodies) + computePotentialEnergy(bodies, G)
}

// ── Center of Mass ────────────────────────────────────────────────────────────
export function computeCenterOfMass(bodies) {
  if (bodies.length === 0) return new THREE.Vector3(0, 0, 0)
  const totalMass = bodies.reduce((s, b) => s + b.mass, 0)
  const com = bodies.reduce((acc, b) => {
    acc.x += b.position.x * b.mass
    acc.y += b.position.y * b.mass
    acc.z += b.position.z * b.mass
    return acc
  }, { x: 0, y: 0, z: 0 })
  return new THREE.Vector3(
    com.x / totalMass,
    com.y / totalMass,
    com.z / totalMass
  )
}

// ── Orbital Elements ──────────────────────────────────────────────────────────
export function computeOrbitalElements(body, primary, G) {
  if (!primary) return null

  const rx = body.position.x - primary.position.x
  const ry = body.position.y - primary.position.y
  const rz = body.position.z - primary.position.z
  const vx = body.velocity.x - primary.velocity.x
  const vy = body.velocity.y - primary.velocity.y
  const vz = body.velocity.z - primary.velocity.z

  const r  = Math.sqrt(rx*rx + ry*ry + rz*rz)
  const v2 = vx*vx + vy*vy + vz*vz
  const mu = G * (body.mass + primary.mass)

  // Semi-major axis: a = -mu / (2 * epsilon)
  const epsilon = v2 / 2 - mu / r
  if (epsilon >= 0) return null // hyperbolic / escape
  const a = -mu / (2 * epsilon)

  // Eccentricity vector
  const rdotv = rx*vx + ry*vy + rz*vz
  const ex = (v2 - mu/r) * rx/mu - rdotv * vx/mu
  const ey = (v2 - mu/r) * ry/mu - rdotv * vy/mu
  const ez = (v2 - mu/r) * rz/mu - rdotv * vz/mu
  const e  = Math.sqrt(ex*ex + ey*ey + ez*ez)

  // Period: T = 2π * sqrt(a³ / mu)
  const T = 2 * Math.PI * Math.sqrt(Math.abs(a)**3 / mu)

  // Calibrate to Earth days
  // Earth: r=145, M_star=10000, G=1 → T_earth ≈ 109.8 ticks = 365 days
  const T_earth = 2 * Math.PI * Math.sqrt(145**3 / (1.0 * 10000))
  const T_days  = T / T_earth * 365

  return {
    semiMajorAxis: Math.abs(a).toFixed(1),
    eccentricity:  e.toFixed(4),
    periodDays:    T_days.toFixed(1),
    periodYears:   (T_days / 365).toFixed(3)
  }
}

// ── Lagrange Points ───────────────────────────────────────────────────────────
export function computeLagrangePoints(b1, b2) {
  // b1 = primary (larger), b2 = secondary
  const dx  = b2.position.x - b1.position.x
  const dy  = b2.position.y - b1.position.y
  const r   = Math.sqrt(dx*dx + dy*dy)
  const cx  = (b1.position.x * b1.mass + b2.position.x * b2.mass) / (b1.mass + b2.mass)
  const cy  = (b1.position.y * b1.mass + b2.position.y * b2.mass) / (b1.mass + b2.mass)
  const mu  = b2.mass / (b1.mass + b2.mass)
  const ang = Math.atan2(dy, dx)

  // L1 — between the two bodies
  const rL1 = r * (1 - Math.cbrt(mu / 3))
  // L2 — beyond secondary
  const rL2 = r * (1 + Math.cbrt(mu / 3))
  // L3 — beyond primary (opposite side)
  const rL3 = r * (1 + 5/12 * mu)

  return [
    {
      label: 'L1',
      position: new THREE.Vector3(
        b1.position.x + rL1 * Math.cos(ang),
        b1.position.y + rL1 * Math.sin(ang),
        0
      )
    },
    {
      label: 'L2',
      position: new THREE.Vector3(
        b1.position.x + rL2 * Math.cos(ang),
        b1.position.y + rL2 * Math.sin(ang),
        0
      )
    },
    {
      label: 'L3',
      position: new THREE.Vector3(
        b1.position.x - rL3 * Math.cos(ang),
        b1.position.y - rL3 * Math.sin(ang),
        0
      )
    },
    {
      label: 'L4',
      position: new THREE.Vector3(
        cx + r * Math.cos(ang + Math.PI/3),
        cy + r * Math.sin(ang + Math.PI/3),
        0
      )
    },
    {
      label: 'L5',
      position: new THREE.Vector3(
        cx + r * Math.cos(ang - Math.PI/3),
        cy + r * Math.sin(ang - Math.PI/3),
        0
      )
    }
  ]
}
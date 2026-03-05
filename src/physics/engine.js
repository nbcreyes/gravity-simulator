import * as THREE from 'three'

export const G_DEFAULT = 1.0
export const DT        = 0.016
const MAX_TRAIL        = 60
const SOFTENING        = 2.0   // prevents singularity at close range

export function generateId() {
  return `body-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function bodyRadius(mass) {
  return Math.cbrt(mass) * 1.8
}

export function bodyColor(mass) {
  if (mass > 8000)  return '#fff7c0'
  if (mass > 4000)  return '#ffccaa'
  if (mass > 1000)  return '#ffd54f'
  if (mass > 500)   return '#ff7043'
  if (mass > 100)   return '#4fc3f7'
  if (mass > 10)    return '#81c784'
  return '#90a4ae'
}

export function stepSimulation(bodies, G, dt) {
  if (bodies.length === 0) return { bodies, collisions: [] }

  const n          = bodies.length
  const collisions = []

  // ── Compute accelerations (O(n²)) ──────────────────────────────────────────
  const accels = bodies.map(() => new THREE.Vector3(0, 0, 0))

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const bi = bodies[i]
      const bj = bodies[j]

      const dx  = bj.position.x - bi.position.x
      const dy  = bj.position.y - bi.position.y
      const dz  = bj.position.z - bi.position.z
      const r2  = dx*dx + dy*dy + dz*dz + SOFTENING*SOFTENING
      const r   = Math.sqrt(r2)
      const r3  = r2 * r

      const fi  = G * bj.mass / r3
      const fj  = G * bi.mass / r3

      accels[i].x += fi * dx
      accels[i].y += fi * dy
      accels[i].z += fi * dz

      accels[j].x -= fj * dx
      accels[j].y -= fj * dy
      accels[j].z -= fj * dz
    }
  }

  // ── Integrate (Velocity Verlet) ────────────────────────────────────────────
  const next = bodies.map((b, i) => {
    const ax = accels[i].x
    const ay = accels[i].y
    const az = accels[i].z

    const vx = b.velocity.x + ax * dt
    const vy = b.velocity.y + ay * dt
    const vz = b.velocity.z + az * dt

    const px = b.position.x + vx * dt
    const py = b.position.y + vy * dt
    const pz = b.position.z + vz * dt

    // Trail — only push if moved enough to matter
    const trail     = b.trail || []
    const lastTrail = trail[0]
    const moved     = lastTrail
      ? Math.hypot(px - lastTrail.x, py - lastTrail.y, pz - lastTrail.z)
      : Infinity

    const newTrail = moved > 1.5
      ? [{ x: px, y: py, z: pz }, ...trail].slice(0, MAX_TRAIL)
      : trail

    return {
      ...b,
      position:     new THREE.Vector3(px, py, pz),
      velocity:     new THREE.Vector3(vx, vy, vz),
      acceleration: new THREE.Vector3(ax, ay, az),
      trail:        newTrail
    }
  })

  // ── Collision detection ────────────────────────────────────────────────────
  const merged  = new Set()
  const result  = []

  for (let i = 0; i < next.length; i++) {
    if (merged.has(i)) continue
    let body = next[i]

    for (let j = i + 1; j < next.length; j++) {
      if (merged.has(j)) continue

      const other = next[j]
      const ri    = bodyRadius(body.mass)
      const rj    = bodyRadius(other.mass)
      const dist  = body.position.distanceTo(other.position)

      if (dist < (ri + rj) * 0.6) {
        // Merge — conserve momentum
        const totalMass = body.mass + other.mass
        const newVx     = (body.velocity.x * body.mass + other.velocity.x * other.mass) / totalMass
        const newVy     = (body.velocity.y * body.mass + other.velocity.y * other.mass) / totalMass
        const newVz     = (body.velocity.z * body.mass + other.velocity.z * other.mass) / totalMass

        // Heavier body survives, absorbs the lighter
        const survivor = body.mass >= other.mass ? body : other
        const absorbed = body.mass >= other.mass ? other : body

        body = {
          ...survivor,
          mass:     totalMass,
          velocity: new THREE.Vector3(newVx, newVy, newVz),
          trail:    survivor.trail
        }

        collisions.push({
          id:       `flash-${Date.now()}-${i}`,
          position: body.position.clone(),
          mass:     totalMass
        })

        merged.add(j)
      }
    }

    result.push(body)
  }

  return { bodies: result, collisions }
}
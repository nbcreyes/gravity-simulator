import * as THREE from 'three'

export const G_DEFAULT = 6.674
export const DT = 0.016
export const SOFTENING = 5
export const MAX_TRAIL = 150

export function computeAccelerations(bodies, G) {
  const accels = bodies.map(() => new THREE.Vector3(0, 0, 0))

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bi = bodies[i]
      const bj = bodies[j]

      const dx = bj.position.x - bi.position.x
      const dy = bj.position.y - bi.position.y
      const dz = bj.position.z - bi.position.z

      const r2 = dx * dx + dy * dy + dz * dz
      const r_soft = Math.sqrt(r2 + SOFTENING * SOFTENING)
      const r_soft3 = r_soft * r_soft * r_soft

      const forceMag = G / r_soft3

      const fx = forceMag * dx
      const fy = forceMag * dy
      const fz = forceMag * dz

      accels[i].x += bj.mass * fx
      accels[i].y += bj.mass * fy
      accels[i].z += bj.mass * fz

      accels[j].x -= bi.mass * fx
      accels[j].y -= bi.mass * fy
      accels[j].z -= bi.mass * fz
    }
  }

  return accels
}

export function stepSimulation(bodies, G, dt) {
  if (bodies.length === 0) return { bodies: [], collisions: [] }

  // Velocity Verlet integration
  // Step 1: store old accelerations
  const oldAccels = bodies.map(b => b.acceleration.clone())

  // Step 2: update positions using current velocity and acceleration
  const moved = bodies.map((b, i) => {
    const newPos = new THREE.Vector3(
      b.position.x + b.velocity.x * dt + 0.5 * oldAccels[i].x * dt * dt,
      b.position.y + b.velocity.y * dt + 0.5 * oldAccels[i].y * dt * dt,
      b.position.z + b.velocity.z * dt + 0.5 * oldAccels[i].z * dt * dt
    )
    return { ...b, position: newPos }
  })

  // Step 3: compute new accelerations at new positions
  const newAccels = computeAccelerations(moved, G)

  // Step 4: update velocities using average of old and new accelerations
  const integrated = moved.map((b, i) => {
    const avgAx = 0.5 * (oldAccels[i].x + newAccels[i].x)
    const avgAy = 0.5 * (oldAccels[i].y + newAccels[i].y)
    const avgAz = 0.5 * (oldAccels[i].z + newAccels[i].z)

    const newVel = new THREE.Vector3(
      b.velocity.x + avgAx * dt,
      b.velocity.y + avgAy * dt,
      b.velocity.z + avgAz * dt
    )

    // Update trail
    const newTrail = [b.position.clone(), ...(b.trail || [])]
    if (newTrail.length > MAX_TRAIL) newTrail.splice(MAX_TRAIL)

    return {
      ...b,
      velocity: newVel,
      acceleration: newAccels[i].clone()
    }
  })

  // Collision detection
  const { survivors, collisions } = detectCollisions(integrated)

  // Update trails after collisions resolved
  const final = survivors.map(b => {
    const newTrail = [b.position.clone(), ...(b.trail || [])]
    if (newTrail.length > MAX_TRAIL) newTrail.splice(MAX_TRAIL)
    return { ...b, trail: newTrail }
  })

  return { bodies: final, collisions }
}

export function detectCollisions(bodies) {
  const collisions = []
  const toRemove = new Set()
  const mergedInto = {}

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      if (toRemove.has(i) || toRemove.has(j)) continue

      const bi = bodies[i]
      const bj = bodies[j]

      const ri = bodyRadius(bi.mass)
      const rj = bodyRadius(bj.mass)

      const dist = bi.position.distanceTo(bj.position)

      if (dist < (ri + rj) * 0.8) {
        // Merge: smaller into larger
        const [survivor, victim] = bi.mass >= bj.mass ? [i, j] : [j, i]
        toRemove.add(victim)

        const totalMass = bodies[survivor].mass + bodies[victim].mass
        const newVel = new THREE.Vector3(
          (bodies[survivor].velocity.x * bodies[survivor].mass + bodies[victim].velocity.x * bodies[victim].mass) / totalMass,
          (bodies[survivor].velocity.y * bodies[survivor].mass + bodies[victim].velocity.y * bodies[victim].mass) / totalMass,
          (bodies[survivor].velocity.z * bodies[survivor].mass + bodies[victim].velocity.z * bodies[victim].mass) / totalMass
        )

        bodies[survivor] = {
          ...bodies[survivor],
          mass: totalMass,
          velocity: newVel
        }

        collisions.push({
          position: bodies[survivor].position.clone(),
          id: `collision-${Date.now()}-${Math.random()}`
        })
      }
    }
  }

  const survivors = bodies.filter((_, i) => !toRemove.has(i))
  return { survivors, collisions }
}

export function bodyRadius(mass) {
  return Math.cbrt(mass) * 2.5
}

export function bodyColor(mass) {
  if (mass < 50) return '#4fc3f7'
  if (mass < 200) return '#ffd54f'
  if (mass < 500) return '#ff7043'
  return '#ffffff'
}

let idCounter = 1
export function generateId() {
  return `body-${idCounter++}`
}
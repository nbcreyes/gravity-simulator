import * as THREE from 'three'

export const G_DEFAULT = 1.0
export const DT = 0.016
export const SOFTENING = 8
export const MAX_TRAIL = 80

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

      accels[i].x += bj.mass * forceMag * dx
      accels[i].y += bj.mass * forceMag * dy
      accels[i].z += bj.mass * forceMag * dz

      accels[j].x -= bi.mass * forceMag * dx
      accels[j].y -= bi.mass * forceMag * dy
      accels[j].z -= bi.mass * forceMag * dz
    }
  }

  return accels
}

export function stepSimulation(bodies, G, dt) {
  if (bodies.length === 0) return { bodies: [], collisions: [] }

  const oldAccels = bodies.map(b => b.acceleration.clone())

  const moved = bodies.map((b, i) => ({
    ...b,
    position: new THREE.Vector3(
      b.position.x + b.velocity.x * dt + 0.5 * oldAccels[i].x * dt * dt,
      b.position.y + b.velocity.y * dt + 0.5 * oldAccels[i].y * dt * dt,
      b.position.z + b.velocity.z * dt + 0.5 * oldAccels[i].z * dt * dt
    )
  }))

  const newAccels = computeAccelerations(moved, G)

  const integrated = moved.map((b, i) => ({
    ...b,
    velocity: new THREE.Vector3(
      b.velocity.x + 0.5 * (oldAccels[i].x + newAccels[i].x) * dt,
      b.velocity.y + 0.5 * (oldAccels[i].y + newAccels[i].y) * dt,
      b.velocity.z + 0.5 * (oldAccels[i].z + newAccels[i].z) * dt
    ),
    acceleration: newAccels[i].clone()
  }))

  const { survivors, collisions } = detectCollisions(integrated)

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

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      if (toRemove.has(i) || toRemove.has(j)) continue

      const bi = bodies[i]
      const bj = bodies[j]
      const ri = bodyRadius(bi.mass)
      const rj = bodyRadius(bj.mass)

      if (bi.position.distanceTo(bj.position) < (ri + rj) * 0.6) {
        const [survivor, victim] = bi.mass >= bj.mass ? [i, j] : [j, i]
        toRemove.add(victim)

        const totalMass = bodies[survivor].mass + bodies[victim].mass
        bodies[survivor] = {
          ...bodies[survivor],
          mass: totalMass,
          velocity: new THREE.Vector3(
            (bodies[survivor].velocity.x * bodies[survivor].mass + bodies[victim].velocity.x * bodies[victim].mass) / totalMass,
            (bodies[survivor].velocity.y * bodies[survivor].mass + bodies[victim].velocity.y * bodies[victim].mass) / totalMass,
            (bodies[survivor].velocity.z * bodies[survivor].mass + bodies[victim].velocity.z * bodies[victim].mass) / totalMass
          )
        }

        collisions.push({
          position: bodies[survivor].position.clone(),
          id: `collision-${Date.now()}-${Math.random()}`
        })
      }
    }
  }

  return {
    survivors: bodies.filter((_, i) => !toRemove.has(i)),
    collisions
  }
}

export function bodyRadius(mass) {
  return Math.cbrt(mass) * 2.5
}

export function bodyColor(mass) {
  if (mass < 1)   return '#4fc3f7'
  if (mass < 50)  return '#81c784'
  if (mass < 200) return '#ffd54f'
  if (mass < 500) return '#ff7043'
  return '#ffffff'
}

let idCounter = 1
export function generateId() {
  return `body-${idCounter++}`
}
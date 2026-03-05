import * as THREE from 'three'

export function exportSimulation(bodies, simTime, G, timeScale) {
  const data = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    simTime,
    G,
    timeScale,
    bodies: bodies.map(b => ({
      id:       b.id,
      name:     b.name,
      mass:     b.mass,
      color:    b.color,
      position: { x: b.position.x, y: b.position.y, z: b.position.z },
      velocity: { x: b.velocity.x, y: b.velocity.y, z: b.velocity.z },
    }))
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `gravitas-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importSimulation(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data   = JSON.parse(e.target.result)
        const bodies = data.bodies.map(b => ({
          ...b,
          position:     new THREE.Vector3(b.position.x, b.position.y, b.position.z),
          velocity:     new THREE.Vector3(b.velocity.x, b.velocity.y, b.velocity.z),
          acceleration: new THREE.Vector3(0, 0, 0),
          trail:        []
        }))
        resolve({ bodies, simTime: data.simTime, G: data.G, timeScale: data.timeScale })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function takeScreenshot(canvas) {
  const url = canvas.toDataURL('image/png')
  const a   = document.createElement('a')
  a.href    = url
  a.download = `gravitas-screenshot-${Date.now()}.png`
  a.click()
}
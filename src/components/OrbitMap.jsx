import { useRef, useEffect } from 'react'
import { useSimulation } from '../store/simulation.js'
import { bodyRadius } from '../physics/engine.js'

const MAP_SIZE = 160
const PADDING  = 12

export default function OrbitMap() {
  const canvasRef  = useRef()
  const bodies     = useSimulation(s => s.bodies)
  const selectedId = useSimulation(s => s.selectedBodyId)
  const selectBody = useSimulation(s => s.selectBody)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || bodies.length === 0) return
    const ctx = canvas.getContext('2d')
    const W   = MAP_SIZE
    const H   = MAP_SIZE

    ctx.clearRect(0, 0, W, H)

    const xs    = bodies.map(b => b.position.x)
    const ys    = bodies.map(b => b.position.y)
    const minX  = Math.min(...xs)
    const maxX  = Math.max(...xs)
    const minY  = Math.min(...ys)
    const maxY  = Math.max(...ys)
    const range = Math.max(maxX - minX, maxY - minY, 1)
    const scale = (W - PADDING * 2) / range
    const cx    = W / 2 - ((minX + maxX) / 2) * scale
    const cy    = H / 2 - ((minY + maxY) / 2) * scale

    // Trails
    for (const body of bodies) {
      const trail = body.trail || []
      if (trail.length < 2) continue
      ctx.beginPath()
      ctx.strokeStyle = body.color + '55'
      ctx.lineWidth   = 0.5
      trail.forEach((p, i) => {
        const tx = p.x * scale + cx
        const ty = p.y * scale + cy
        i === 0 ? ctx.moveTo(tx, ty) : ctx.lineTo(tx, ty)
      })
      ctx.stroke()
    }

    // Bodies
    for (const body of bodies) {
      const bx = body.position.x * scale + cx
      const by = body.position.y * scale + cy
      const r  = Math.max(Math.cbrt(body.mass) * scale * 0.08, 1.5)

      // Glow
      const grd = ctx.createRadialGradient(bx, by, 0, bx, by, r * 3)
      grd.addColorStop(0, body.color + 'aa')
      grd.addColorStop(1, body.color + '00')
      ctx.beginPath()
      ctx.fillStyle = grd
      ctx.arc(bx, by, r * 3, 0, Math.PI * 2)
      ctx.fill()

      // Dot
      ctx.beginPath()
      ctx.fillStyle = body.color
      ctx.arc(bx, by, r, 0, Math.PI * 2)
      ctx.fill()

      // Selection ring
      if (body.id === selectedId) {
        ctx.beginPath()
        ctx.strokeStyle = '#00e5ff'
        ctx.lineWidth   = 1
        ctx.arc(bx, by, r + 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }, [bodies, selectedId])

  const handleClick = (e) => {
    if (bodies.length === 0) return
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const mx     = e.clientX - rect.left
    const my     = e.clientY - rect.top

    const xs    = bodies.map(b => b.position.x)
    const ys    = bodies.map(b => b.position.y)
    const minX  = Math.min(...xs)
    const maxX  = Math.max(...xs)
    const minY  = Math.min(...ys)
    const maxY  = Math.max(...ys)
    const range = Math.max(maxX - minX, maxY - minY, 1)
    const scale = (MAP_SIZE - PADDING * 2) / range
    const cx    = MAP_SIZE / 2 - ((minX + maxX) / 2) * scale
    const cy    = MAP_SIZE / 2 - ((minY + maxY) / 2) * scale

    for (const body of bodies) {
      const bx = body.position.x * scale + cx
      const by = body.position.y * scale + cy
      const r  = Math.max(Math.cbrt(body.mass) * scale * 0.08, 4)
      if (Math.hypot(mx - bx, my - by) < r + 4) {
        selectBody(body.id)
        return
      }
    }
  }

  if (bodies.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-20"
      style={{
        background: 'rgba(6,6,18,0.82)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: 8
      }}
    >
      <p
        className="font-orbitron text-[8px] tracking-widest mb-1.5"
        style={{ color: '#00e5ff55', textAlign: 'center' }}
      >
        ORBIT MAP
      </p>
      <canvas
        ref={canvasRef}
        width={MAP_SIZE}
        height={MAP_SIZE}
        onClick={handleClick}
        style={{ cursor: 'pointer', display: 'block' }}
      />
    </div>
  )
}
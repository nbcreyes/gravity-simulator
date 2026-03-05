import { useEffect, useRef } from 'react'
import { useSimulation } from '../store/simulation.js'

export default function ContextMenu({ menu, onClose }) {
  const removeBody      = useSimulation(s => s.removeBody)
  const selectBody      = useSimulation(s => s.selectBody)
  const setLockedBodyId = useSimulation(s => s.setLockedBodyId)
  const lockedBodyId    = useSimulation(s => s.lockedBodyId)
  const ref             = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    window.addEventListener('pointerdown', handler)
    return () => window.removeEventListener('pointerdown', handler)
  }, [onClose])

  if (!menu) return null

  const isLocked = lockedBodyId === menu.bodyId

  const actions = [
    {
      label: '🔍  FOCUS',
      action: () => { selectBody(menu.bodyId); onClose() }
    },
    {
      label: isLocked ? '🔓  UNLOCK CAM' : '🔒  LOCK CAM',
      action: () => { setLockedBodyId(isLocked ? null : menu.bodyId); onClose() }
    },
    {
      label: '🗑  DELETE',
      danger: true,
      action: () => { removeBody(menu.bodyId); onClose() }
    }
  ]

  return (
    <div
      ref={ref}
      className="fixed z-50 flex flex-col overflow-hidden"
      style={{
        left: menu.x,
        top:  menu.y,
        background: 'rgba(6,6,18,0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8,
        minWidth: 160,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 font-orbitron text-[9px] tracking-widest"
        style={{
          color: menu.bodyColor,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          textShadow: `0 0 8px ${menu.bodyColor}`
        }}
      >
        {menu.bodyName}
      </div>

      {/* Actions */}
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.action}
          className="px-3 py-2 text-left font-orbitron text-[10px] tracking-wider transition-all"
          style={{
            color: a.danger ? '#ff6e6e' : '#aaa',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = a.danger
              ? 'rgba(255,80,80,0.1)'
              : 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = a.danger ? '#ff4444' : '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = a.danger ? '#ff6e6e' : '#aaa'
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  )
}
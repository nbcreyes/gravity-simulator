import { create } from 'zustand'
import { G_DEFAULT, DT } from '../physics/engine.js'
import { loadPreset } from '../physics/presets.js'

export const useSimulation = create((set) => ({
  bodies: [],
  paused: false,
  G: G_DEFAULT,
  dt: DT,
  timeScale: 1,
  simTime: 0,
  selectedBodyId: null,
  placementMode: 'idle',
  collisionFlashes: [],
  lockedBodyId: null,
  cameraMode: 'free',

  addBody: (body) => set(state => ({
    bodies: [...state.bodies, body]
  })),

  removeBody: (id) => set(state => ({
    bodies: state.bodies.filter(b => b.id !== id),
    selectedBodyId: state.selectedBodyId === id ? null : state.selectedBodyId,
    lockedBodyId: state.lockedBodyId === id ? null : state.lockedBodyId
  })),

  updateBodies: (newBodies) => set({ bodies: newBodies }),

  updateBody: (id, updates) => set(state => ({
    bodies: state.bodies.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  incrementTime: (dt) => set(state => ({ simTime: state.simTime + dt })),

  togglePause: () => set(state => ({ paused: !state.paused })),

  clearAll: () => set({
    bodies: [],
    selectedBodyId: null,
    placementMode: 'idle',
    collisionFlashes: [],
    lockedBodyId: null,
    cameraMode: 'free',
    simTime: 0
  }),

  loadPreset: (name) => set({
    bodies: loadPreset(name),
    selectedBodyId: null,
    placementMode: 'idle',
    collisionFlashes: [],
    lockedBodyId: null,
    cameraMode: 'free',
    simTime: 0
  }),

  selectBody: (id) => set({ selectedBodyId: id }),
  setPlacementMode: (mode) => set({ placementMode: mode }),
  setG: (G) => set({ G }),
  setTimeScale: (ts) => set({ timeScale: ts }),
  setLockedBodyId: (id) => set({ lockedBodyId: id, cameraMode: id ? 'locked' : 'free' }),
  setCameraMode: (mode) => set({ cameraMode: mode, lockedBodyId: null }),

  addCollisionFlash: (flash) => set(state => ({
    collisionFlashes: [...state.collisionFlashes, flash]
  })),

  removeCollisionFlash: (id) => set(state => ({
    collisionFlashes: state.collisionFlashes.filter(f => f.id !== id)
  }))
}))
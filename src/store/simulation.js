import { create } from 'zustand'
import { G_DEFAULT, DT } from '../physics/engine.js'
import { loadPreset } from '../physics/presets.js'

export const useSimulation = create((set, get) => ({
  bodies: [],
  paused: false,
  G: G_DEFAULT,
  dt: DT,
  selectedBodyId: null,
  placementMode: 'idle',
  pendingBody: null,
  collisionFlashes: [],

  addBody: (body) => set(state => ({
    bodies: [...state.bodies, body]
  })),

  removeBody: (id) => set(state => ({
    bodies: state.bodies.filter(b => b.id !== id),
    selectedBodyId: state.selectedBodyId === id ? null : state.selectedBodyId
  })),

  updateBodies: (newBodies) => set({ bodies: newBodies }),

  updateBody: (id, updates) => set(state => ({
    bodies: state.bodies.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  togglePause: () => set(state => ({ paused: !state.paused })),

  clearAll: () => set({
    bodies: [],
    selectedBodyId: null,
    placementMode: 'idle',
    pendingBody: null,
    collisionFlashes: []
  }),

  loadPreset: (name) => set({
    bodies: loadPreset(name),
    selectedBodyId: null,
    placementMode: 'idle',
    pendingBody: null,
    collisionFlashes: []
  }),

  selectBody: (id) => set({ selectedBodyId: id }),

  setPlacementMode: (mode) => set({ placementMode: mode }),

  setPendingBody: (body) => set({ pendingBody: body }),

  setG: (G) => set({ G }),

  addCollisionFlash: (flash) => set(state => ({
    collisionFlashes: [...state.collisionFlashes, flash]
  })),

  removeCollisionFlash: (id) => set(state => ({
    collisionFlashes: state.collisionFlashes.filter(f => f.id !== id)
  }))
}))
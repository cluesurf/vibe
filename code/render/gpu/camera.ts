// The hyperbolic CAMERA and its navigation, framework-agnostic (no React, no GPU calls). It holds the walker's
// position and heading and turns key / mouse actions into hyperbolic isometries, then hands the engine the
// packed uniform for the current mode. Movement is a geodesic step (a Mobius translation), turning is a change
// of heading, so the same controls drive the 2D disk and the 3D ball. Reused by the browser engine and any
// headless fly-through that wants the same motion model. See uniform.ts for the byte layout.

import { mobiusAdd } from '@/code/render/geometry/isometry'
import type {
  Fold2DUniform,
  Fold3DUniform,
} from '@/code/render/gpu/uniform'
import type { FoldMode } from '@/code/render/gpu/fold-scene'

// the look-and-feel constants per mode, the standoff of the eye and the raymarch budget. Interior keeps the eye
// just inside a cell (a first-person room), exterior pulls it outside the ball (the nested-shell model view).
const MODE_PARAMS: Record<
  FoldMode,
  {
    eyeDist: number
    edgeWidth: number
    detail: number
    maxSteps: number
  }
> = {
  '2d': { eyeDist: 0, edgeWidth: 0.012, detail: 0, maxSteps: 0 },
  '3d': {
    eyeDist: 2.4,
    edgeWidth: 0.06,
    detail: 0.0012,
    maxSteps: 240,
  },
  // interior strut lattice: a thin tube radius and a deep march budget so the honeycomb recedes to the horizon
  '3d-interior': {
    eyeDist: 0.05,
    edgeWidth: 0.016,
    detail: 0.0008,
    maxSteps: 560,
  },
}

export type Camera = {
  readonly mode: FoldMode
  moveForward(step: number): void
  moveRight(step: number): void
  moveUp(step: number): void
  turn(delta: number): void
  tilt(delta: number): void
  zoomBy(factor: number): void
  reset(): void
  uniform2D(): Fold2DUniform
  uniform3D(): Fold3DUniform
}

function scale(v: number[], s: number): number[] {
  return v.map(x => x * s)
}

export function makeCamera(mode: FoldMode): Camera {
  const params = MODE_PARAMS[mode]

  // 2D state, the disk point under the screen centre, the view heading, and the zoom
  let pos2: [number, number] = [0, 0]
  let angle = 0
  let zoom = 1

  // 3D state, the camera ball point, and the yaw / pitch heading
  let pos3: [number, number, number] = [0, 0, 0]
  let yaw = 0
  let pitch = 0

  // a forward geodesic step of hyperbolic length `step` brings the point that is `step` ahead to the centre
  const tanhHalf = (step: number): number => Math.tanh(step / 2)

  return {
    mode,
    moveForward(step) {
      const t = tanhHalf(step)
      if (mode === '2d') {
        const dir = [-Math.sin(angle), Math.cos(angle)]
        pos2 = mobiusAdd(pos2, scale(dir, t)) as [number, number]
      } else {
        const f = forward3()
        pos3 = mobiusAdd(pos3, scale(f, t)) as [number, number, number]
      }
    },
    moveRight(step) {
      const t = tanhHalf(step)
      if (mode === '2d') {
        const dir = [Math.cos(angle), Math.sin(angle)]
        pos2 = mobiusAdd(pos2, scale(dir, t)) as [number, number]
      } else {
        const r = right3()
        pos3 = mobiusAdd(pos3, scale(r, t)) as [number, number, number]
      }
    },
    moveUp(step) {
      if (mode === '2d') {
        return
      }
      pos3 = mobiusAdd(pos3, scale([0, 1, 0], tanhHalf(step))) as [
        number,
        number,
        number,
      ]
    },
    turn(delta) {
      if (mode === '2d') {
        angle += delta
      } else {
        yaw += delta
      }
    },
    tilt(delta) {
      if (mode === '2d') {
        return
      }
      pitch = Math.max(-1.5, Math.min(1.5, pitch + delta))
    },
    zoomBy(factor) {
      zoom = Math.max(0.2, Math.min(40, zoom * factor))
    },
    reset() {
      pos2 = [0, 0]
      angle = 0
      zoom = 1
      pos3 = [0, 0, 0]
      yaw = 0
      pitch = 0
    },
    uniform2D() {
      // aspect defaults to 1 (square); a windowed host overrides it with the live viewport ratio each frame
      return {
        pan: pos2,
        zoom,
        rotation: angle,
        edgeWidth: params.edgeWidth,
        aspect: 1,
      }
    },
    uniform3D() {
      const f = forward3()
      return {
        shift: [-pos3[0], -pos3[1], -pos3[2]],
        eye: scale(f, -params.eyeDist) as [number, number, number],
        edgeWidth: params.edgeWidth,
        detail: params.detail,
        maxSteps: params.maxSteps,
        aspect: 1,
      }
    },
  }

  // the unit look direction from yaw / pitch (yaw 0, pitch 0 looks down -z, matching the headless eye on +z)
  function forward3(): [number, number, number] {
    const cp = Math.cos(pitch)
    return [Math.sin(yaw) * cp, Math.sin(pitch), -Math.cos(yaw) * cp]
  }
  // the unit right direction in the horizontal plane
  function right3(): [number, number, number] {
    return [Math.cos(yaw), 0, Math.sin(yaw)]
  }
}
